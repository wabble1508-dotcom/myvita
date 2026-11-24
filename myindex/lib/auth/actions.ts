"use server";

import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { buildSearchText } from "@/lib/db/schema";
import { hashPassword, newId, newPublicId, randomToken, sha256, verifyPassword } from "@/lib/auth/crypto";
import { endSession, startSession } from "@/lib/auth/session";
import { handleProblem, normalizeHandle } from "@/lib/domain/handle";
import { appUrl, sendMail } from "@/lib/mail";

export type FormState = { error?: string; done?: string; values?: Record<string, string> } | undefined;

const email = z.string().trim().toLowerCase().email("Trag eine gültige E-Mail-Adresse ein.");
const password = z
  .string()
  .min(8, "Das Passwort braucht mindestens 8 Zeichen.")
  .max(200, "Das Passwort ist zu lang.");

const signupSchema = z.object({
  displayName: z.string().trim().min(2, "Trag deinen Namen ein.").max(80, "Der Name ist zu lang."),
  handle: z.string().transform(normalizeHandle),
  email,
  password,
});

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/profil";
}

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const values = { displayName: text(form, "displayName"), handle: text(form, "handle"), email: text(form, "email") };
  const parsed = signupSchema.safeParse({ ...values, password: text(form, "password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values };
  const data = parsed.data;

  const problem = handleProblem(data.handle);
  if (problem) return { error: problem, values };

  const [emailTaken] = await db().select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, data.email));
  if (emailTaken) return { error: "Mit dieser E-Mail gibt es schon ein Konto. Melde dich an.", values };
  const [handleTaken] = await db()
    .select({ id: schema.profiles.userId })
    .from(schema.profiles)
    .where(eq(schema.profiles.handle, data.handle));
  if (handleTaken) return { error: `@${data.handle} ist schon vergeben. Nimm einen anderen @Namen.`, values };

  const userId = newId();
  const passwordHash = await hashPassword(data.password);
  try {
    // D1 kennt keine Transaktionen über mehrere Aufrufe; ein Batch läuft aber als Ganzes oder gar nicht.
    await db().batch([
      db().insert(schema.users).values({ id: userId, email: data.email, passwordHash }),
      db()
        .insert(schema.profiles)
        .values({
          userId,
          handle: data.handle,
          publicId: newPublicId(),
          displayName: data.displayName,
          searchText: buildSearchText(data),
        }),
    ]);
  } catch {
    // Gleichzeitig angelegt oder ID-Zufall doppelt: selten, ein zweiter Versuch reicht.
    return { error: "Das Konto ließ sich nicht anlegen. Versuch es noch einmal.", values };
  }
  await startSession(userId);
  redirect("/profil?neu=1");
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const values = { email: text(form, "email") };
  const parsed = email.safeParse(values.email);
  const given = text(form, "password");
  if (!parsed.success || !given) return { error: "Trag E-Mail und Passwort ein.", values };

  const [user] = await db().select().from(schema.users).where(eq(schema.users.email, parsed.data));
  // Auch ohne Konto rechnen, damit die Antwortzeit nicht verrät, ob es die E-Mail gibt.
  const ok = await verifyPassword(given, user?.passwordHash ?? "pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA$AAAA");
  if (!user || !ok) return { error: "E-Mail oder Passwort stimmt nicht.", values };

  await startSession(user.id);
  redirect(safeNext(text(form, "next")));
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/");
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(text(form, "email"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const [user] = await db().select().from(schema.users).where(eq(schema.users.email, parsed.data));
  if (user) {
    const token = randomToken();
    await db().delete(schema.passwordResets).where(eq(schema.passwordResets.userId, user.id));
    await db()
      .insert(schema.passwordResets)
      .values({ id: await sha256(token), userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    await sendMail(
      user.email,
      "Neues Passwort für MyVita",
      `Hallo,\n\nüber diesen Link legst du ein neues Passwort fest. Er gilt eine Stunde:\n${appUrl(`/passwort-neu/${token}`)}\n\nWenn du das nicht warst, ignorier diese E-Mail.\n\nMyVita`,
    );
  }
  // Immer dieselbe Antwort, damit niemand fremde Adressen abfragen kann.
  return { done: "Wenn es ein Konto mit dieser E-Mail gibt, ist ein Link unterwegs. Schau in dein Postfach." };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const parsed = password.safeParse(text(form, "password"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const id = await sha256(text(form, "token"));
  const [reset] = await db()
    .select()
    .from(schema.passwordResets)
    .where(and(eq(schema.passwordResets.id, id), gt(schema.passwordResets.expiresAt, new Date())));
  if (!reset) return { error: "Der Link ist abgelaufen. Fordere einen neuen an." };

  await db().update(schema.users).set({ passwordHash: await hashPassword(parsed.data) }).where(eq(schema.users.id, reset.userId));
  await db().delete(schema.passwordResets).where(eq(schema.passwordResets.userId, reset.userId));
  // Alle alten Sitzungen beenden, falls jemand Fremdes angemeldet war.
  await db().delete(schema.sessions).where(eq(schema.sessions.userId, reset.userId));
  await startSession(reset.userId);
  redirect("/profil");
}
