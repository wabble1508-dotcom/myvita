"use server";

import { requireViewer } from "@/lib/auth/session";
import { hostOf } from "@/lib/domain/social";
import { profileByUserId } from "@/lib/vita/queries";
import { searchPublicWeb } from "@/lib/services/public-search";

export type SelfHit = { url: string; title: string; snippet: string; host: string };
export type SelfSearchResult = { ok: true; name: string; hits: SelfHit[] } | { ok: false; error: string };

const lastRun = new Map<string, number>();
const PAUSE_MS = 2 * 60 * 1000;

/**
 * Sucht im öffentlichen Netz nach dem EIGENEN Namen des angemeldeten Mitglieds.
 * Der Name kommt aus dem Profil, nicht aus einer Eingabe: fremde Personen lassen sich so nicht durchsuchen.
 */
export async function findMyself(): Promise<SelfSearchResult> {
  const viewer = await requireViewer();
  const profile = await profileByUserId(viewer.id);
  if (!profile) return { ok: false, error: "Zu deinem Konto fehlt das Profil." };

  const since = Date.now() - (lastRun.get(viewer.id) ?? 0);
  if (since < PAUSE_MS) {
    return { ok: false, error: `Warte noch ${Math.ceil((PAUSE_MS - since) / 1000)} Sekunden bis zur nächsten Suche.` };
  }
  lastRun.set(viewer.id, Date.now());

  try {
    const result = await searchPublicWeb({ fullName: profile.displayName });
    const hits = result.hits.slice(0, 60).map((hit) => ({
      url: hit.url,
      title: hit.title,
      snippet: hit.snippet,
      host: hostOf(hit.url),
    }));
    return { ok: true, name: profile.displayName, hits };
  } catch {
    return { ok: false, error: "Die Suche hat gerade nicht geklappt. Versuch es später noch einmal." };
  }
}
