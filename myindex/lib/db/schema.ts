import { blob, index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/** Wer einen Eintrag sieht: alle, nur Empfänger eines Bewerbungslinks, oder nur man selbst. */
export const VISIBILITIES = ["public", "link", "private"] as const;
export const CV_KINDS = ["experience", "education"] as const;
export type Visibility = (typeof VISIBILITIES)[number];
export type CvKind = (typeof CV_KINDS)[number];

const created = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());
const userRef = () =>
  text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });
const visibility = () => text("visibility", { enum: VISIBILITIES }).notNull().default("public");
const list = (name: string) =>
  text(name, { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: created(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    /** SHA-256 des Cookie-Werts, nie der Wert selbst. */
    id: text("id").primaryKey(),
    userId: userRef(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: created(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const passwordResets = sqliteTable("password_resets", {
  id: text("id").primaryKey(),
  userId: userRef(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: created(),
});

export const profiles = sqliteTable(
  "profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(),
    publicId: text("public_id").notNull().unique(),
    displayName: text("display_name").notNull(),
    headline: text("headline").notNull().default(""),
    bio: text("bio").notNull().default(""),
    location: text("location").notNull().default(""),
    skills: list("skills"),
    avatarId: text("avatar_id"),
    openToWork: integer("open_to_work", { mode: "boolean" }).notNull().default(false),
    /** Aus: Profil erscheint nicht in der Suche und ist nur über Bewerbungslinks sichtbar. */
    searchable: integer("searchable", { mode: "boolean" }).notNull().default(true),
    /** Kleingeschriebener Suchtext aus Name, @Name, Überschrift, Ort und Fähigkeiten (SQLite kennt kein Unicode-ILIKE). */
    searchText: text("search_text").notNull().default(""),
    /** Beispielprofil zum Vorführen, keine echte Person. */
    isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
    createdAt: created(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("profiles_handle_idx").on(t.handle), index("profiles_updated_idx").on(t.updatedAt)],
);

export const links = sqliteTable(
  "links",
  {
    id: text("id").primaryKey(),
    userId: userRef(),
    url: text("url").notNull(),
    label: text("label").notNull().default(""),
    visibility: visibility(),
    position: integer("position").notNull().default(0),
    createdAt: created(),
  },
  (t) => [index("links_user_idx").on(t.userId)],
);

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: userRef(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    url: text("url").notNull().default(""),
    imageId: text("image_id"),
    tags: list("tags"),
    visibility: visibility(),
    position: integer("position").notNull().default(0),
    createdAt: created(),
  },
  (t) => [index("projects_user_idx").on(t.userId)],
);

export const cvEntries = sqliteTable(
  "cv_entries",
  {
    id: text("id").primaryKey(),
    userId: userRef(),
    kind: text("kind", { enum: CV_KINDS }).notNull(),
    /** Rolle oder Abschluss. */
    title: text("title").notNull(),
    /** Firma oder Schule. */
    organization: text("organization").notNull().default(""),
    location: text("location").notNull().default(""),
    /** Monat als JJJJ-MM. */
    startDate: text("start_date").notNull().default(""),
    /** Leer heißt: bis heute. */
    endDate: text("end_date").notNull().default(""),
    description: text("description").notNull().default(""),
    visibility: visibility(),
    createdAt: created(),
  },
  (t) => [index("cv_user_idx").on(t.userId)],
);

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  userId: userRef(),
  contentType: text("content_type").notNull(),
  data: blob("data", { mode: "buffer" }).notNull(),
  createdAt: created(),
});

export const shareLinks = sqliteTable(
  "share_links",
  {
    id: text("id").primaryKey(),
    userId: userRef(),
    token: text("token").notNull().unique(),
    /** Für wen der Link ist, z. B. "Bewerbung bei Muster GmbH". */
    label: text("label").notNull().default(""),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    views: integer("views").notNull().default(0),
    createdAt: created(),
  },
  (t) => [index("share_user_idx").on(t.userId)],
);

export const follows = sqliteTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followeeId: text("followee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: created(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followeeId] }), index("follows_followee_idx").on(t.followeeId)],
);

export type Profile = typeof profiles.$inferSelect;
export type LinkRow = typeof links.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type CvEntryRow = typeof cvEntries.$inferSelect;
export type ShareLinkRow = typeof shareLinks.$inferSelect;

/** Baut den Suchtext eines Profils. JavaScript schreibt Umlaute korrekt klein, SQLite nicht. */
export function buildSearchText(profile: {
  displayName: string;
  handle: string;
  headline?: string;
  location?: string;
  skills?: string[];
}): string {
  return [profile.displayName, profile.handle, profile.headline ?? "", profile.location ?? "", ...(profile.skills ?? [])]
    .join(" | ")
    .toLowerCase();
}
