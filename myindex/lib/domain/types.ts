export const FOOTPRINT_CATEGORIES = [
  "PROFESSIONAL",
  "EDUCATION",
  "ACADEMIC",
  "SOCIAL",
  "MEDIA_MENTION",
  "PUBLIC_RECORD",
  "DATA_LEAK",
  "OTHER",
] as const;

export type FootprintCategory = (typeof FOOTPRINT_CATEGORIES)[number];

export const VISIBILITIES = ["PUBLIC", "PRIVATE", "SHARE_ONLY"] as const;

export type Visibility = (typeof VISIBILITIES)[number];

export type VerificationLevel = "UNVERIFIED" | "EID_VERIFIED" | "OAUTH_VERIFIED";

export type UserRecord = {
  id: string;
  email: string;
  fullName: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProfileRecord = {
  id: string;
  userId: string;
  /** Kurze, eindeutige Abruf-ID. Der Name kann sich wiederholen, diese ID nicht. */
  publicId: string;
  did: string;
  headline: string;
  bio: string;
  verificationLevel: VerificationLevel;
  createdAt: string;
  updatedAt: string;
};

export type DisplayFact = {
  label: string;
  value: string;
};

export type ItemRecord = {
  id: string;
  profileId: string;
  sourceUrl: string;
  domain: string;
  title: string;
  snippet: string;
  category: FootprintCategory;
  confidenceScore: number;
  isVerifiedByOwner: boolean;
  visibility: Visibility;
  deletionRequestedAt: string | null;
  createdAt: string;
  /** Angaben, die diese Quelle öffentlich zeigen würde. */
  facts: DisplayFact[];
};

export type ShareLinkRecord = {
  id: string;
  profileId: string;
  accessToken: string;
  expiresAt: string;
  allowedCategories: FootprintCategory[];
  viewsCount: number;
  createdAt: string;
};

export type PersonRecord = {
  user: UserRecord;
  profile: ProfileRecord;
  items: ItemRecord[];
  links: ShareLinkRecord[];
};

export type PersonSummary = {
  publicId: string;
  fullName: string;
  active: boolean;
};

export type StoreData = {
  version: 2;
  activePublicId: string;
  people: PersonRecord[];
};

export type NormalizedDraft = {
  sourceUrl: string;
  domain: string;
  title: string;
  snippet: string;
  category: FootprintCategory;
  confidenceScore: number;
  facts: DisplayFact[];
};

export type HealthReport = {
  score: number;
  completeness: number;
  reviewed: number;
  total: number;
  openLeaks: number;
  label: "Offen" | "Prüfung offen" | "Stabil" | "Gut im Griff";
  summary: string;
};

export type PublicVita = {
  publicId: string;
  fullName: string;
  headline: string;
  bio: string;
  verificationLevel: VerificationLevel;
  expiresAt: string;
  viewsCount: number;
  sections: Array<{
    category: FootprintCategory;
      items: Array<{
          id: string;
          title: string;
          snippet: string;
          domain: string;
          sourceUrl: string;
          confidenceScore: number;
          facts: DisplayFact[];
        }>;
  }>;
};

export type PersonView = {
  publicId: string;
  fullName: string;
  headline: string;
  bio: string;
  verificationLevel: VerificationLevel;
  sections: PublicVita["sections"];
};

export type DashboardData = {
  user: UserRecord;
  profile: ProfileRecord;
  items: ItemRecord[];
  links: ShareLinkRecord[];
  people: PersonSummary[];
  health: HealthReport;
  counts: Record<FootprintCategory, number>;
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
