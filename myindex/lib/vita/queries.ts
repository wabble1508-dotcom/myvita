import "server-only";
import { and, asc, count, desc, eq, gt, ilike, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { CvEntryRow, LinkRow, Profile, ProjectRow, ShareLinkRow, Visibility } from "@/lib/db/schema";

/** Wer schaut: die Öffentlichkeit, Empfänger eines Bewerbungslinks oder die Person selbst. */
export type Audience = "public" | "link" | "owner";

const SEEN_BY: Record<Audience, Visibility[]> = {
  public: ["public"],
  link: ["public", "link"],
  owner: ["public", "link", "private"],
};

export type Vita = {
  profile: Profile;
  links: LinkRow[];
  projects: ProjectRow[];
  experience: CvEntryRow[];
  education: CvEntryRow[];
  followers: number;
  following: number;
};

export function mediaUrl(id: string | null | undefined): string | null {
  return id ? `/media/${id}` : null;
}

/** Neueste Station zuerst; laufende Stationen (ohne Ende) vor beendeten. */
function byDate(a: CvEntryRow, b: CvEntryRow): number {
  const endA = a.endDate || "9999-99";
  const endB = b.endDate || "9999-99";
  if (endA !== endB) return endB.localeCompare(endA);
  return b.startDate.localeCompare(a.startDate);
}

export async function loadVita(profile: Profile, audience: Audience): Promise<Vita> {
  const seen = SEEN_BY[audience];
  const userId = profile.userId;
  const [linkRows, projectRows, cvRows, [followers], [following]] = await Promise.all([
    db()
      .select()
      .from(schema.links)
      .where(and(eq(schema.links.userId, userId), inArray(schema.links.visibility, seen)))
      .orderBy(asc(schema.links.position), asc(schema.links.createdAt)),
    db()
      .select()
      .from(schema.projects)
      .where(and(eq(schema.projects.userId, userId), inArray(schema.projects.visibility, seen)))
      .orderBy(asc(schema.projects.position), desc(schema.projects.createdAt)),
    db()
      .select()
      .from(schema.cvEntries)
      .where(and(eq(schema.cvEntries.userId, userId), inArray(schema.cvEntries.visibility, seen))),
    db().select({ n: count() }).from(schema.follows).where(eq(schema.follows.followeeId, userId)),
    db().select({ n: count() }).from(schema.follows).where(eq(schema.follows.followerId, userId)),
  ]);
  const cv = [...cvRows].sort(byDate);
  return {
    profile,
    links: linkRows,
    projects: projectRows,
    experience: cv.filter((entry) => entry.kind === "experience"),
    education: cv.filter((entry) => entry.kind === "education"),
    followers: followers?.n ?? 0,
    following: following?.n ?? 0,
  };
}

export async function profileByUserId(userId: string): Promise<Profile | null> {
  const [row] = await db().select().from(schema.profiles).where(eq(schema.profiles.userId, userId));
  return row ?? null;
}

export async function profileByHandle(handle: string): Promise<Profile | null> {
  const [row] = await db().select().from(schema.profiles).where(eq(schema.profiles.handle, handle.toLowerCase()));
  return row ?? null;
}

export async function profileByPublicId(publicId: string): Promise<Profile | null> {
  const [row] = await db().select().from(schema.profiles).where(eq(schema.profiles.publicId, publicId.toUpperCase()));
  return row ?? null;
}

export async function isFollowing(followerId: string, followeeId: string): Promise<boolean> {
  const [row] = await db()
    .select({ id: schema.follows.followerId })
    .from(schema.follows)
    .where(and(eq(schema.follows.followerId, followerId), eq(schema.follows.followeeId, followeeId)));
  return Boolean(row);
}

/** Gültiger Bewerbungslink samt Profil; zählt den Aufruf mit. */
export async function openShareLink(token: string): Promise<{ link: ShareLinkRow; profile: Profile } | null> {
  const [row] = await db()
    .select({ link: schema.shareLinks, profile: schema.profiles })
    .from(schema.shareLinks)
    .innerJoin(schema.profiles, eq(schema.profiles.userId, schema.shareLinks.userId))
    .where(and(eq(schema.shareLinks.token, token), gt(schema.shareLinks.expiresAt, new Date())));
  if (!row) return null;
  await db()
    .update(schema.shareLinks)
    .set({ views: sql`${schema.shareLinks.views} + 1` })
    .where(eq(schema.shareLinks.id, row.link.id));
  return row;
}

export async function shareLinksOf(userId: string): Promise<ShareLinkRow[]> {
  return db()
    .select()
    .from(schema.shareLinks)
    .where(eq(schema.shareLinks.userId, userId))
    .orderBy(desc(schema.shareLinks.createdAt));
}

export type SearchHit = Pick<
  Profile,
  "handle" | "publicId" | "displayName" | "headline" | "location" | "avatarId" | "skills" | "openToWork"
>;

/** Findet auffindbare Mitglieder nach Name, @Name, MyVita-ID, Überschrift, Ort oder Fähigkeit. */
export async function searchMembers(query: string, limit = 30): Promise<SearchHit[]> {
  const q = query.trim();
  const columns = {
    handle: schema.profiles.handle,
    publicId: schema.profiles.publicId,
    displayName: schema.profiles.displayName,
    headline: schema.profiles.headline,
    location: schema.profiles.location,
    avatarId: schema.profiles.avatarId,
    skills: schema.profiles.skills,
    openToWork: schema.profiles.openToWork,
  };
  if (!q) {
    return db()
      .select(columns)
      .from(schema.profiles)
      .where(eq(schema.profiles.searchable, true))
      .orderBy(desc(schema.profiles.updatedAt))
      .limit(limit);
  }
  const plain = q.replace(/^@/, "");
  const like = `%${plain.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
  const compactId = plain.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^MV/, "");
  return db()
    .select(columns)
    .from(schema.profiles)
    .where(
      and(
        eq(schema.profiles.searchable, true),
        or(
          ilike(schema.profiles.displayName, like),
          ilike(schema.profiles.handle, like),
          ilike(schema.profiles.headline, like),
          ilike(schema.profiles.location, like),
          compactId.length === 8 ? eq(schema.profiles.publicId, `MV-${compactId}`) : undefined,
          sql`exists (select 1 from unnest(${schema.profiles.skills}) s where s ilike ${like})`,
        ),
      ),
    )
    .orderBy(
      sql`case when ${schema.profiles.handle} = ${plain.toLowerCase()} then 0 when ${schema.profiles.displayName} ilike ${`${plain}%`} then 1 else 2 end`,
      asc(schema.profiles.displayName),
    )
    .limit(limit);
}
