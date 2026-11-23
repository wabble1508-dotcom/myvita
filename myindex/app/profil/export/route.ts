import { eq } from "drizzle-orm";
import { getViewer } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

/** Datenauskunft: alles, was zum Konto gespeichert ist, ohne Passwort und Bilddaten. */
export async function GET() {
  const viewer = await getViewer();
  if (!viewer) return new Response("Bitte anmelden.", { status: 401 });
  const id = viewer.id;
  const [user] = await db().select({ email: schema.users.email, createdAt: schema.users.createdAt }).from(schema.users).where(eq(schema.users.id, id));
  const [profile, links, projects, cv, shareLinks, following, followers, media] = await Promise.all([
    db().select().from(schema.profiles).where(eq(schema.profiles.userId, id)),
    db().select().from(schema.links).where(eq(schema.links.userId, id)),
    db().select().from(schema.projects).where(eq(schema.projects.userId, id)),
    db().select().from(schema.cvEntries).where(eq(schema.cvEntries.userId, id)),
    db().select().from(schema.shareLinks).where(eq(schema.shareLinks.userId, id)),
    db().select({ handle: schema.profiles.handle }).from(schema.follows).innerJoin(schema.profiles, eq(schema.profiles.userId, schema.follows.followeeId)).where(eq(schema.follows.followerId, id)),
    db().select({ handle: schema.profiles.handle }).from(schema.follows).innerJoin(schema.profiles, eq(schema.profiles.userId, schema.follows.followerId)).where(eq(schema.follows.followeeId, id)),
    db().select({ id: schema.media.id, contentType: schema.media.contentType, createdAt: schema.media.createdAt }).from(schema.media).where(eq(schema.media.userId, id)),
  ]);
  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), account: user, profile: profile[0], links, projects, cv, shareLinks, following, followers, images: media },
    null,
    2,
  );
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="myvita-${viewer.handle}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
