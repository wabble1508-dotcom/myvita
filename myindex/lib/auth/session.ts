import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/auth/crypto";

const COOKIE = "mv_session";
const DAYS = 30;

export async function startSession(userId: string): Promise<void> {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000);
  await db().insert(schema.sessions).values({ id: await sha256(token), userId, expiresAt });
  // Abgelaufene Sitzungen dieses Nutzers gleich mit aufräumen.
  await db()
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), lt(schema.sessions.expiresAt, new Date())));
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db().delete(schema.sessions).where(eq(schema.sessions.id, await sha256(token)));
  store.delete(COOKIE);
}

export type Viewer = {
  id: string;
  email: string;
  handle: string;
  displayName: string;
  publicId: string;
};

/** Der angemeldete Nutzer oder null. Einmal pro Anfrage gelesen. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await db()
    .select({
      id: schema.users.id,
      email: schema.users.email,
      handle: schema.profiles.handle,
      displayName: schema.profiles.displayName,
      publicId: schema.profiles.publicId,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .innerJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(and(eq(schema.sessions.id, await sha256(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
});

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/anmelden");
  return viewer;
}
