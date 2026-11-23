import {
  boolean,
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

/** Wer einen Eintrag sieht: alle, nur Empfänger eines Bewerbungslinks, oder nur man selbst. */
export const visibility = pgEnum("visibility", ["public", "link", "private"]);
export const cvKind = pgEnum("cv_kind", ["experience", "education"]);

const created = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const userRef = () =>
  text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: created(),
});

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 des Cookie-Werts, nie der Wert selbst. */
    id: text("id").primaryKey(),
    userId: userRef(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: created(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const passwordResets = pgTable("password_resets", {
  id: text("id").primaryKey(),
  userId: userRef(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: created(),
});

export const profiles = pgTable(
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
    skills: text("skills").array().notNull().default([]),
    avatarId: text("avatar_id"),
    openToWork: boolean("open_to_work").notNull().default(false),
    /** Aus: Profil erscheint nicht in der Suche und ist nur über Bewerbungslinks sichtbar. */
    searchable: boolean("searchable").notNull().default(true),
    createdAt: created(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("profiles_handle_idx").on(t.handle)],
);

export const links = pgTable(
  "links",
  {
    id: text("id").primaryKey(),
    userId: userRef(),
    url: text("url").notNull(),
    label: text("label").notNull().default(""),
    visibility: visibility("visibility").notNull().default("public"),
    position: integer("position").notNull().default(0),
    createdAt: created(),
  },
  (t) => [index("links_user_idx").on(t.userId)],
);

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: userRef(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    url: text("url").notNull().default(""),
    imageId: text("image_id"),
    tags: text("tags").array().notNull().default([]),
    visibility: visibility("visibility").notNull().default("public"),
    position: integer("position").notNull().default(0),
    createdAt: created(),
  },
  (t) => [index("projects_user_idx").on(t.userId)],
);

export const cvEntries = pgTable(
  "cv_entries",
  {
    id: text("id").primaryKey(),
    userId: userRef(),
    kind: cvKind("kind").notNull(),
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
    visibility: visibility("visibility").notNull().default("public"),
    createdAt: created(),
  },
  (t) => [index("cv_user_idx").on(t.userId)],
);

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  userId: userRef(),
  contentType: text("content_type").notNull(),
  data: bytea("data").notNull(),
  createdAt: created(),
});

export const shareLinks = pgTable(
  "share_links",
  {
    id: text("id").primaryKey(),
    userId: userRef(),
    token: text("token").notNull().unique(),
    /** Für wen der Link ist, z. B. "Bewerbung bei Muster GmbH". */
    label: text("label").notNull().default(""),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    views: integer("views").notNull().default(0),
    createdAt: created(),
  },
  (t) => [index("share_user_idx").on(t.userId)],
);

export const follows = pgTable(
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

export type Visibility = (typeof visibility.enumValues)[number];
export type CvKind = (typeof cvKind.enumValues)[number];
export type Profile = typeof profiles.$inferSelect;
export type LinkRow = typeof links.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type CvEntryRow = typeof cvEntries.$inferSelect;
export type ShareLinkRow = typeof shareLinks.$inferSelect;
