"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, max, ne } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import type { FormState } from "@/lib/auth/actions";
import { hashPassword, newId, randomToken, verifyPassword } from "@/lib/auth/crypto";
import { endSession, requireViewer } from "@/lib/auth/session";
import { handleProblem, normalizeHandle } from "@/lib/domain/handle";
import { normalizeUrl } from "@/lib/domain/social";

const visibility = z.enum(["public", "link", "private"]);
const month = z.string().regex(/^(\d{4}-(0[1-9]|1[0-2]))?$/, "Gib Monate als JJJJ-MM an.");
const MAX_IMAGE_BYTES = 1_500_000;
const IMAGE_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Kommaliste ohne Doppelte; "Figma" und "figma" zählen als dasselbe, die erste Schreibweise bleibt. */
function list(value: string, limit: number): string[] {
  const seen = new Map<string, string>();
  for (const part of value.split(",")) {
    const item = part.trim().slice(0, 40);
    const key = item.toLowerCase();
    if (item && !seen.has(key) && seen.size < limit) seen.set(key, item);
  }
  return [...seen.values()];
}

function refresh(): void {
  revalidatePath("/", "layout");
}

function fail(error: unknown): FormState {
  return { error: error instanceof Error ? error.message : "Das hat nicht geklappt. Versuch es noch einmal." };
}

async function storeImage(userId: string, file: FormDataEntryValue | null): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!IMAGE_TYPES.has(file.type)) throw new Error("Nimm ein Bild als JPG, PNG oder WebP.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Das Bild ist zu groß. Höchstens 1,5 MB.");
  const id = newId();
  await db()
    .insert(schema.media)
    .values({ id, userId, contentType: file.type, data: Buffer.from(await file.arrayBuffer()) });
  return id;
}

async function dropImage(userId: string, id: string | null | undefined): Promise<void> {
  if (id) await db().delete(schema.media).where(and(eq(schema.media.id, id), eq(schema.media.userId, userId)));
}

// ---------- Profil ----------

const profileSchema = z.object({
  displayName: z.string().min(2, "Trag deinen Namen ein.").max(80, "Der Name ist zu lang."),
  handle: z.string().transform(normalizeHandle),
  headline: z.string().max(120, "Die Überschrift hat höchstens 120 Zeichen."),
  location: z.string().max(80, "Der Ort ist zu lang."),
  bio: z.string().max(1500, "Der Text über dich hat höchstens 1500 Zeichen."),
});

export async function saveProfile(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireViewer();
  const parsed = profileSchema.safeParse({
    displayName: text(form, "displayName"),
    handle: text(form, "handle"),
    headline: text(form, "headline"),
    location: text(form, "location"),
    bio: text(form, "bio"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  if (data.handle !== viewer.handle) {
    const problem = handleProblem(data.handle);
    if (problem) return { error: problem };
    const [taken] = await db()
      .select({ id: schema.profiles.userId })
      .from(schema.profiles)
      .where(and(eq(schema.profiles.handle, data.handle), ne(schema.profiles.userId, viewer.id)));
    if (taken) return { error: `@${data.handle} ist schon vergeben.` };
  }

  try {
    const [current] = await db().select({ avatarId: schema.profiles.avatarId }).from(schema.profiles).where(eq(schema.profiles.userId, viewer.id));
    const removeAvatar = form.get("removeAvatar") === "1";
    const avatarId = await storeImage(viewer.id, form.get("avatar"));
    if (avatarId || removeAvatar) await dropImage(viewer.id, current?.avatarId);

    await db()
      .update(schema.profiles)
      .set({
        ...data,
        skills: list(text(form, "skills"), 30),
        openToWork: form.get("openToWork") === "on",
        searchable: form.get("searchable") === "on",
        ...(avatarId ? { avatarId } : removeAvatar ? { avatarId: null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.userId, viewer.id));
  } catch (error) {
    return fail(error);
  }
  refresh();
  return { done: "Gespeichert." };
}

// ---------- Links ----------

export async function addLink(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireViewer();
  const url = normalizeUrl(text(form, "url"));
  if (!url) return { error: "Trag eine Adresse ein, z. B. instagram.com/deinname." };
  const vis = visibility.safeParse(text(form, "visibility") || "public");
  if (!vis.success) return { error: "Wähle, wer den Link sieht." };

  const existing = await db().select({ id: schema.links.id }).from(schema.links).where(eq(schema.links.userId, viewer.id));
  if (existing.length >= 30) return { error: "Höchstens 30 Links." };
  const [last] = await db().select({ n: max(schema.links.position) }).from(schema.links).where(eq(schema.links.userId, viewer.id));
  await db().insert(schema.links).values({
    id: newId(),
    userId: viewer.id,
    url,
    label: text(form, "label").slice(0, 60),
    visibility: vis.data,
    position: (last?.n ?? 0) + 1,
  });
  refresh();
  return { done: "Link hinzugefügt." };
}

export async function setLinkVisibility(id: string, value: string): Promise<void> {
  const viewer = await requireViewer();
  const vis = visibility.parse(value);
  await db().update(schema.links).set({ visibility: vis }).where(and(eq(schema.links.id, id), eq(schema.links.userId, viewer.id)));
  refresh();
}

export async function moveLink(id: string, direction: "up" | "down"): Promise<void> {
  const viewer = await requireViewer();
  const rows = await db()
    .select({ id: schema.links.id })
    .from(schema.links)
    .where(eq(schema.links.userId, viewer.id))
    .orderBy(schema.links.position, schema.links.createdAt);
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target]!, rows[index]!];
  await db().transaction(async (tx) => {
    for (const [position, row] of rows.entries()) {
      await tx.update(schema.links).set({ position }).where(eq(schema.links.id, row.id));
    }
  });
  refresh();
}

export async function deleteLink(id: string): Promise<void> {
  const viewer = await requireViewer();
  await db().delete(schema.links).where(and(eq(schema.links.id, id), eq(schema.links.userId, viewer.id)));
  refresh();
}

// ---------- Portfolio ----------

const projectSchema = z.object({
  title: z.string().min(2, "Gib dem Projekt einen Titel.").max(100, "Der Titel ist zu lang."),
  description: z.string().max(2000, "Die Beschreibung hat höchstens 2000 Zeichen."),
  visibility,
});

export async function saveProject(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireViewer();
  const parsed = projectSchema.safeParse({
    title: text(form, "title"),
    description: text(form, "description"),
    visibility: text(form, "visibility") || "public",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const rawUrl = text(form, "url");
  const url = rawUrl ? normalizeUrl(rawUrl) : "";
  if (url === null) return { error: "Die Projekt-Adresse sieht nicht wie ein Link aus." };
  const id = text(form, "id");

  try {
    const [current] = id
      ? await db().select().from(schema.projects).where(and(eq(schema.projects.id, id), eq(schema.projects.userId, viewer.id)))
      : [];
    if (id && !current) return { error: "Das Projekt gibt es nicht mehr." };
    const removeImage = form.get("removeImage") === "1";
    const imageId = await storeImage(viewer.id, form.get("image"));
    if (imageId || removeImage) await dropImage(viewer.id, current?.imageId);

    const values = {
      ...parsed.data,
      url,
      tags: list(text(form, "tags"), 12),
      ...(imageId ? { imageId } : removeImage ? { imageId: null } : {}),
    };
    if (current) {
      await db().update(schema.projects).set(values).where(eq(schema.projects.id, current.id));
    } else {
      const count = await db().select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.userId, viewer.id));
      if (count.length >= 50) return { error: "Höchstens 50 Projekte." };
      await db().insert(schema.projects).values({ id: newId(), userId: viewer.id, ...values });
    }
  } catch (error) {
    return fail(error);
  }
  refresh();
  return { done: id ? "Projekt gespeichert." : "Projekt hinzugefügt." };
}

export async function deleteProject(id: string): Promise<void> {
  const viewer = await requireViewer();
  const [row] = await db().select().from(schema.projects).where(and(eq(schema.projects.id, id), eq(schema.projects.userId, viewer.id)));
  if (!row) return;
  await db().delete(schema.projects).where(eq(schema.projects.id, id));
  await dropImage(viewer.id, row.imageId);
  refresh();
}

// ---------- Lebenslauf ----------

const cvSchema = z
  .object({
    kind: z.enum(["experience", "education"]),
    title: z.string().min(2, "Trag eine Rolle oder einen Abschluss ein.").max(100, "Der Titel ist zu lang."),
    organization: z.string().max(100, "Der Name ist zu lang."),
    location: z.string().max(80, "Der Ort ist zu lang."),
    startDate: month,
    endDate: month,
    description: z.string().max(1500, "Die Beschreibung hat höchstens 1500 Zeichen."),
    visibility,
  })
  .refine((entry) => !entry.endDate || !entry.startDate || entry.endDate >= entry.startDate, {
    message: "Das Ende liegt vor dem Beginn.",
  });

export async function saveCvEntry(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireViewer();
  const parsed = cvSchema.safeParse({
    kind: text(form, "kind"),
    title: text(form, "title"),
    organization: text(form, "organization"),
    location: text(form, "location"),
    startDate: text(form, "startDate"),
    endDate: form.get("current") === "on" ? "" : text(form, "endDate"),
    description: text(form, "description"),
    visibility: text(form, "visibility") || "public",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const id = text(form, "id");
  if (id) {
    const updated = await db()
      .update(schema.cvEntries)
      .set(parsed.data)
      .where(and(eq(schema.cvEntries.id, id), eq(schema.cvEntries.userId, viewer.id)))
      .returning({ id: schema.cvEntries.id });
    if (!updated.length) return { error: "Den Eintrag gibt es nicht mehr." };
  } else {
    const count = await db().select({ id: schema.cvEntries.id }).from(schema.cvEntries).where(eq(schema.cvEntries.userId, viewer.id));
    if (count.length >= 60) return { error: "Höchstens 60 Einträge." };
    await db().insert(schema.cvEntries).values({ id: newId(), userId: viewer.id, ...parsed.data });
  }
  refresh();
  return { done: "Gespeichert." };
}

export async function deleteCvEntry(id: string): Promise<void> {
  const viewer = await requireViewer();
  await db().delete(schema.cvEntries).where(and(eq(schema.cvEntries.id, id), eq(schema.cvEntries.userId, viewer.id)));
  refresh();
}

// ---------- Bewerbungslinks ----------

export async function createShareLink(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireViewer();
  const days = Number(text(form, "days"));
  if (![1, 7, 30, 90].includes(days)) return { error: "Wähle, wie lange der Link gilt." };
  const existing = await db().select({ id: schema.shareLinks.id }).from(schema.shareLinks).where(eq(schema.shareLinks.userId, viewer.id));
  if (existing.length >= 50) return { error: "Höchstens 50 Links. Lösch alte Links zuerst." };
  await db().insert(schema.shareLinks).values({
    id: newId(),
    userId: viewer.id,
    token: randomToken(18),
    label: text(form, "label").slice(0, 80),
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  });
  refresh();
  return { done: "Link erstellt. Kopier ihn unten und schick ihn mit deiner Bewerbung." };
}

export async function deleteShareLink(id: string): Promise<void> {
  const viewer = await requireViewer();
  await db().delete(schema.shareLinks).where(and(eq(schema.shareLinks.id, id), eq(schema.shareLinks.userId, viewer.id)));
  refresh();
}

// ---------- Netzwerk ----------

export async function toggleFollow(handle: string): Promise<void> {
  const viewer = await requireViewer();
  const [target] = await db()
    .select({ userId: schema.profiles.userId })
    .from(schema.profiles)
    .where(eq(schema.profiles.handle, handle));
  if (!target || target.userId === viewer.id) return;
  const removed = await db()
    .delete(schema.follows)
    .where(and(eq(schema.follows.followerId, viewer.id), eq(schema.follows.followeeId, target.userId)))
    .returning({ id: schema.follows.followerId });
  if (!removed.length) {
    await db().insert(schema.follows).values({ followerId: viewer.id, followeeId: target.userId }).onConflictDoNothing();
  }
  refresh();
}

// ---------- Konto ----------

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireViewer();
  const next = text(form, "next");
  if (next.length < 8) return { error: "Das neue Passwort braucht mindestens 8 Zeichen." };
  const [user] = await db().select().from(schema.users).where(eq(schema.users.id, viewer.id));
  if (!user || !(await verifyPassword(text(form, "current"), user.passwordHash))) {
    return { error: "Das aktuelle Passwort stimmt nicht." };
  }
  await db().update(schema.users).set({ passwordHash: await hashPassword(next) }).where(eq(schema.users.id, viewer.id));
  return { done: "Passwort geändert." };
}

export async function deleteAccount(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireViewer();
  if (text(form, "confirm").replace(/^@/, "").toLowerCase() !== viewer.handle) {
    return { error: `Tipp zur Bestätigung deinen @Namen ein: ${viewer.handle}` };
  }
  const [user] = await db().select().from(schema.users).where(eq(schema.users.id, viewer.id));
  if (!user || !(await verifyPassword(text(form, "password"), user.passwordHash))) {
    return { error: "Das Passwort stimmt nicht." };
  }
  await endSession();
  // Alles andere hängt am Nutzer und wird mit gelöscht.
  await db().delete(schema.users).where(eq(schema.users.id, viewer.id));
  redirect("/?geloescht=1");
}
