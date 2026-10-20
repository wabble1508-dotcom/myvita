import type { DisplayFact } from "@/lib/domain/types";

export const PLATFORM_IDS = ["instagram", "facebook", "x", "youtube", "linkedin", "github"] as const;

export type PlatformId = (typeof PLATFORM_IDS)[number];

const HOSTS: Record<string, PlatformId> = {
  "instagram.com": "instagram",
  "facebook.com": "facebook",
  "x.com": "x",
  "twitter.com": "x",
  "youtube.com": "youtube",
  "linkedin.com": "linkedin",
  "github.com": "github",
};

export function platformOf(domain: string): PlatformId | null {
  return HOSTS[domain.replace(/^www\./, "").toLowerCase()] ?? null;
}

export function readFact(facts: DisplayFact[] | undefined, labels: string[]): string | undefined {
  const wanted = new Set(labels.map((label) => label.toLowerCase()));
  return facts?.find((fact) => wanted.has(fact.label.toLowerCase()))?.value;
}

export function profileName(title: string, facts: DisplayFact[] | undefined): string {
  const named = readFact(facts, ["Name auf der Seite", "Name", "Angezeigter Name"]);
  if (named) return named;
  const onPlatform = title.split(" auf ")[0];
  if (onPlatform && onPlatform !== title) return onPlatform.replace(/^Erwähnung:\s*/, "");
  const mention = title.match(/^Erwähnung:\s+(.+?)\s+in\b/);
  if (mention?.[1]) return mention[1];
  return title;
}

export function profileHandle(facts: DisplayFact[] | undefined): string | undefined {
  return readFact(facts, ["Nutzername"]);
}

export function profileText(snippet: string, facts: DisplayFact[] | undefined): string {
  return (
    readFact(facts, ["Bio", "Text auf der Seite", "Beschreibung", "Text", "Überschrift"]) ?? snippet
  );
}
