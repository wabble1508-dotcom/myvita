import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createSeed } from "@/lib/data/seed";
import { createPublicId } from "@/lib/domain/create-public-id";
import { DEMO_PUBLIC_ID, normalizePublicId } from "@/lib/domain/public-id";
import { isPubliclyFindable } from "@/lib/domain/public-store";
import type { ItemRecord, PersonRecord, ProfileRecord, ShareLinkRecord, StoreData, UserRecord } from "@/lib/domain/types";

const directory = path.join(process.cwd(), "data");
const filePath = path.join(directory, "store.json");

let queue: Promise<unknown> = Promise.resolve();

export function readStore(): StoreData {
  ensureStore();
  try {
    const before = fs.statSync(filePath).mtimeMs;
    const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const loaded = toStore(parsed);
    if (!loaded) {
      throw new Error("Im lokalen Profil fehlen Felder. Lösch data/store.json und lade neu.");
    }
    if (loaded.dirty && fs.statSync(filePath).mtimeMs === before) writeStore(loaded.store);
    return loaded.store;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Das lokale Profil ließ sich nicht lesen. Lösch data/store.json und lade neu.");
    }
    throw error;
  }
}

export function mutateStore<T>(change: (data: StoreData) => T): Promise<T> {
  const run = queue.then(() => {
    const data = readStore();
    const result = change(data);
    writeStore(data);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function ensureStore(): void {
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  if (!fs.existsSync(filePath)) writeStore(createSeed());
}

function writeStore(data: StoreData): void {
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function toStore(value: unknown): { store: StoreData; dirty: boolean } | null {
  if (!isRecord(value)) return null;
  if (value.version === 2 && Array.isArray(value.people)) {
    return peopleStore(value.people, value.activePublicId, false);
  }
  if (value.version === 1 && isRecord(value.user) && isRecord(value.profile) && Array.isArray(value.items) && Array.isArray(value.links)) {
    return peopleStore(
      [
        {
          user: value.user,
          profile: value.profile,
          items: value.items,
          links: value.links,
        },
      ],
      undefined,
      true,
    );
  }
  return null;
}

function peopleStore(people: unknown[], activePublicId: unknown, upgraded: boolean): { store: StoreData; dirty: boolean } | null {
  if (people.length === 0 || !people.every(isPersonShape)) return null;
  const used = new Set<string>();
  let dirty = upgraded;
  const normalized: PersonRecord[] = people.map((person) => {
    const claimed = claimId(person.profile, used);
    if (claimed.changed) dirty = true;
    const items = (person.items as ItemRecord[]).filter(
      (item) => item.visibility === "PUBLIC" && item.deletionRequestedAt == null && isPubliclyFindable(item.category, item.domain),
    );
    if (items.length !== person.items.length) dirty = true;
    return {
      user: person.user as UserRecord,
      profile: { ...(person.profile as ProfileRecord), publicId: claimed.id },
      items,
      links: person.links as ShareLinkRecord[],
    };
  });
  const requested = typeof activePublicId === "string" ? normalizePublicId(activePublicId) : null;
  const active = normalized.some((person) => person.profile.publicId === requested)
    ? requested
    : normalized[0]?.profile.publicId;
  if (!active) return null;
  if (active !== activePublicId) dirty = true;
  return { store: { version: 2, activePublicId: active, people: normalized }, dirty };
}

function claimId(profile: Record<string, unknown>, used: Set<string>): { id: string; changed: boolean } {
  const raw = typeof profile.publicId === "string" ? normalizePublicId(profile.publicId) : null;
  if (raw && !used.has(raw)) {
    used.add(raw);
    return { id: raw, changed: raw !== profile.publicId };
  }
  if (profile.id === "prf_local_demo" && !used.has(DEMO_PUBLIC_ID)) {
    used.add(DEMO_PUBLIC_ID);
    return { id: DEMO_PUBLIC_ID, changed: true };
  }
  const created = createPublicId(used);
  used.add(created);
  return { id: created, changed: true };
}

function isPersonShape(value: unknown): value is Record<string, unknown> & {
  user: Record<string, unknown>;
  profile: Record<string, unknown>;
  items: unknown[];
  links: unknown[];
} {
  if (!isRecord(value)) return false;
  return isRecord(value.user) && isRecord(value.profile) && Array.isArray(value.items) && Array.isArray(value.links);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
