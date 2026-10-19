import { FOOTPRINT_CATEGORIES, type FootprintCategory, type HealthReport, type ItemRecord, type ProfileRecord } from "@/lib/domain/types";

/**
 * Identity health is a local control score, not a credit score.
 * 45 points: profile fields and verification.
 * 35 points: share of findings the owner has reviewed.
 * 20 points: leak alerts kept private. Each public or share-only leak removes 10, down to zero.
 */
export function scoreIdentity(profile: ProfileRecord, items: ItemRecord[]): HealthReport {
  const completeness = profileCompleteness(profile);
  const reviewed = items.filter((item) => item.isVerifiedByOwner).length;
  const total = items.length;
  const reviewRatio = total === 0 ? 0.5 : reviewed / total;
  const openLeaks = items.filter(
    (item) => item.category === "DATA_LEAK" && item.visibility !== "PRIVATE" && item.deletionRequestedAt == null,
  ).length;
  const leakPoints = Math.max(0, 20 - openLeaks * 10);
  const score = clamp(Math.round((completeness / 45) * 45 + reviewRatio * 35 + leakPoints), 0, 100);

  return {
    score,
    completeness: Math.round((completeness / 45) * 100),
    reviewed,
    total,
    openLeaks,
    label: labelFor(score),
    summary: summaryFor({ score, reviewed, total, openLeaks, completeness }),
  };
}

export function countCategories(items: ItemRecord[]): Record<FootprintCategory, number> {
  const counts = Object.fromEntries(FOOTPRINT_CATEGORIES.map((category) => [category, 0])) as Record<
    FootprintCategory,
    number
  >;
  for (const item of items) counts[item.category] += 1;
  return counts;
}

function profileCompleteness(profile: ProfileRecord): number {
  let points = 0;
  if (profile.headline.trim()) points += 15;
  if (profile.bio.trim()) points += 15;
  if (profile.did.trim()) points += 5;
  if (profile.verificationLevel === "OAUTH_VERIFIED") points += 5;
  if (profile.verificationLevel === "EID_VERIFIED") points += 10;
  return points;
}

function labelFor(score: number): HealthReport["label"] {
  if (score >= 85) return "Gut im Griff";
  if (score >= 70) return "Stabil";
  if (score >= 45) return "Prüfung offen";
  return "Offen";
}

function summaryFor(input: {
  score: number;
  reviewed: number;
  total: number;
  openLeaks: number;
  completeness: number;
}): string {
  if (input.openLeaks > 0) {
    return `${input.openLeaks} Datenleck-Hinweis${input.openLeaks === 1 ? " ist" : "e sind"} noch sichtbar. Stell sie auf privat oder frag die Löschung an.`;
  }
  if (input.total === 0) {
    return "Starte eine Suche, um zu sehen, wie Funde sortiert werden. Neue Treffer bleiben privat, bis du sie prüfst.";
  }
  if (input.reviewed < input.total) {
    return `${input.reviewed} von ${input.total} Funden geprüft. Eine Änderung der Sichtbarkeit zählt als Prüfung.`;
  }
  if (input.completeness < 45) {
    return "Die Funde sind geprüft. Ergänze Überschrift und Kurztext, bevor du eine Vita teilst.";
  }
  return "Profilfelder sind gefüllt und jeder Fund ist geprüft.";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
