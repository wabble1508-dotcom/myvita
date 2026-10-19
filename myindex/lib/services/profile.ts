import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { mutateStore, readStore } from "@/lib/data/store";
import { localDid } from "@/lib/domain/did";
import { createPublicId } from "@/lib/domain/create-public-id";
import { normalizePublicId } from "@/lib/domain/public-id";
import type {
  DashboardData,
  ItemRecord,
  PersonRecord,
  PersonView,
  PublicVita,
  ShareLinkRecord,
  StoreData,
  Visibility,
} from "@/lib/domain/types";
import { buildPersonView, buildPublicVita, countSharedItems } from "@/lib/services/exporter";
import { normalizeHit } from "@/lib/services/normalizer";
import { simulateSerp } from "@/lib/services/osint";
import { countCategories, scoreIdentity } from "@/lib/services/privacy";
import type { ProfileInput, ScanInput, ShareInput } from "@/lib/validators";

const EXPIRY_MS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

const ITEM_CAP = 200;

export type PublicPage =
  | { status: "missing" }
  | { status: "expired"; expiresAt: string }
  | { status: "ok"; vita: PublicVita };

export type ScanSummary = {
  createdCount: number;
  skipped: number;
  total: number;
};

export function getShareDesk(): DashboardData & {
  linkViews: Array<DashboardData["links"][number] & { sharedCount: number; expired: boolean }>;
} {
  const data = getDashboard();
  const now = Date.now();
  return {
    ...data,
    linkViews: data.links.map((link) => ({
      ...link,
      sharedCount: countSharedItems(data.items, link),
      expired: new Date(link.expiresAt).getTime() <= now,
    })),
  };
}

export function getDashboard(): DashboardData {
  const data = readStore();
  const person = findActive(data);
  return {
    user: person.user,
    profile: person.profile,
    items: [...person.items].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    links: [...person.links].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    people: data.people.map((entry) => ({
      publicId: entry.profile.publicId,
      fullName: entry.user.fullName,
      active: entry.profile.publicId === person.profile.publicId,
    })),
    health: scoreIdentity(person.profile, person.items),
    counts: countCategories(person.items),
  };
}

export function readPerson(publicId: string): PersonView | null {
  const id = normalizePublicId(publicId);
  if (!id) return null;
  const person = readStore().people.find((entry) => entry.profile.publicId === id);
  if (!person) return null;
  return buildPersonView(person);
}

export function readSharedVita(token: string): PublicPage {
  return toPublicPage(readStore(), token, false);
}

export function recordSharedView(token: string): Promise<PublicPage> {
  return mutateStore((data) => toPublicPage(data, token, true));
}

export function createPerson(fullName: string): Promise<{ publicId: string }> {
  return mutateStore((data) => {
    const now = new Date().toISOString();
    const used = new Set(data.people.map((person) => person.profile.publicId));
    const publicId = createPublicId(used);
    const userId = randomUUID();
    data.people.push({
      user: {
        id: userId,
        email: "",
        fullName,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      },
      profile: {
        id: randomUUID(),
        userId,
        publicId,
        did: localDid(publicId),
        headline: "",
        bio: "",
        verificationLevel: "UNVERIFIED",
        createdAt: now,
        updatedAt: now,
      },
      items: [],
      links: [],
    });
    data.activePublicId = publicId;
    return { publicId };
  });
}

export function switchPerson(publicId: string): Promise<void> {
  return mutateStore((data) => {
    const id = normalizePublicId(publicId);
    const person = id ? data.people.find((entry) => entry.profile.publicId === id) : undefined;
    if (!person || !id) throw new Error("Auf diesem Rechner liegt keine Person mit dieser ID.");
    data.activePublicId = id;
  });
}

export function runScan(input: ScanInput): Promise<ScanSummary> {
  return mutateStore((data) => {
    const person = findActive(data);
    const now = new Date().toISOString();
    person.user.fullName = input.fullName;
    if (input.email) person.user.email = input.email;
    person.user.updatedAt = now;
    person.profile.updatedAt = now;

    const seen = new Set(person.items.map((item) => item.sourceUrl));
    let createdCount = 0;
    let skipped = 0;

    for (const hit of simulateSerp(input)) {
      const normalized = normalizeHit(hit, input.fullName);
      if (seen.has(normalized.sourceUrl)) {
        skipped += 1;
        continue;
      }
      if (person.items.length >= ITEM_CAP) {
        skipped += 1;
        continue;
      }
      seen.add(normalized.sourceUrl);
      person.items.push({
        ...normalized,
        id: randomUUID(),
        profileId: person.profile.id,
        isVerifiedByOwner: false,
        visibility: "PRIVATE",
        deletionRequestedAt: null,
        createdAt: now,
      });
      createdCount += 1;
    }

    return { createdCount, skipped, total: person.items.length };
  });
}

export function setItemVisibility(itemId: string, visibility: Visibility): Promise<void> {
  return mutateStore((data) => {
    const person = findActive(data);
    const item = requireItem(person.items, itemId);
    item.visibility = visibility;
    item.isVerifiedByOwner = true;
    person.profile.updatedAt = new Date().toISOString();
  });
}

export function requestItemDeletion(itemId: string): Promise<void> {
  return mutateStore((data) => {
    const person = findActive(data);
    const item = requireItem(person.items, itemId);
    if (item.deletionRequestedAt) return;
    item.deletionRequestedAt = new Date().toISOString();
    item.visibility = "PRIVATE";
    item.isVerifiedByOwner = true;
    person.profile.updatedAt = item.deletionRequestedAt;
  });
}

export function saveProfileDetails(input: ProfileInput): Promise<void> {
  return mutateStore((data) => {
    const person = findActive(data);
    const now = new Date().toISOString();
    person.user.fullName = input.fullName;
    person.user.updatedAt = now;
    person.profile.headline = input.headline;
    person.profile.bio = input.bio;
    person.profile.updatedAt = now;
  });
}

export function createShareLink(input: ShareInput): Promise<{ accessToken: string; expiresAt: string }> {
  return mutateStore((data) => {
    const person = findActive(data);
    const now = new Date();
    const accessToken = randomBytes(18).toString("base64url");
    const expiresAt = new Date(now.getTime() + EXPIRY_MS[input.expiresIn]).toISOString();
    person.links.push({
      id: randomUUID(),
      profileId: person.profile.id,
      accessToken,
      expiresAt,
      allowedCategories: [...new Set(input.allowedCategories)],
      viewsCount: 0,
      createdAt: now.toISOString(),
    });
    return { accessToken, expiresAt };
  });
}

function toPublicPage(data: StoreData, token: string, countView: boolean): PublicPage {
  const match = findLink(data, token);
  if (!match) return { status: "missing" };
  if (new Date(match.link.expiresAt).getTime() <= Date.now()) {
    return { status: "expired", expiresAt: match.link.expiresAt };
  }
  if (countView) match.link.viewsCount += 1;
  return {
    status: "ok",
    vita: buildPublicVita({
      user: match.person.user,
      profile: match.person.profile,
      items: match.person.items,
      link: match.link,
    }),
  };
}

function findLink(data: StoreData, token: string): { person: PersonRecord; link: ShareLinkRecord } | null {
  for (const person of data.people) {
    const link = person.links.find((item) => item.accessToken === token);
    if (link) return { person, link };
  }
  return null;
}

function findActive(data: StoreData): PersonRecord {
  const person = data.people.find((entry) => entry.profile.publicId === data.activePublicId) ?? data.people[0];
  if (!person) throw new Error("Es ist keine Person gespeichert.");
  return person;
}

function requireItem(items: ItemRecord[], itemId: string): ItemRecord {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) throw new Error("Dieser Fund liegt nicht mehr vor.");
  return item;
}
