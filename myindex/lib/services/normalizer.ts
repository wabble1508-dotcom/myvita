import type { DisplayFact, FootprintCategory, NormalizedDraft } from "@/lib/domain/types";

export type RawHit = {
  url: string;
  title: string;
  snippet: string;
  facts: DisplayFact[];
};

const SOCIAL_HOSTS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "tiktok.com",
  "x.com",
  "twitter.com",
  "threads.net",
  "bsky.app",
  "reddit.com",
  "youtube.com",
  "youtu.be",
  "pinterest.com",
  "snapchat.com",
  "twitch.tv",
  "linkedin.com",
  "xing.com",
  "mastodon.social",
  "discord.com",
  "t.me",
  "telegram.me",
  "vk.com",
  "tumblr.com",
  "flickr.com",
  "vimeo.com",
  "dailymotion.com",
  "rumble.com",
];

const NEWS_HOSTS = [
  "spiegel.de",
  "zeit.de",
  "faz.net",
  "sueddeutsche.de",
  "tagesschau.de",
  "welt.de",
  "bild.de",
  "taz.de",
  "handelsblatt.com",
  "n-tv.de",
  "focus.de",
  "stern.de",
  "tagesspiegel.de",
  "rp-online.de",
  "merkur.de",
  "abendblatt.de",
  "morgenpost.de",
  "berliner-zeitung.de",
  "zdf.de",
  "dw.com",
  "deutschlandfunk.de",
  "bbc.com",
  "bbc.co.uk",
  "reuters.com",
  "apnews.com",
  "nytimes.com",
  "theguardian.com",
  "cnn.com",
  "washingtonpost.com",
  "bloomberg.com",
  "forbes.com",
  "wsj.com",
  "ft.com",
  "economist.com",
  "lemonde.fr",
  "nzz.ch",
  "tagesanzeiger.ch",
  "derstandard.at",
  "orf.at",
  "heise.de",
  "golem.de",
  "theverge.com",
  "wired.com",
  "techcrunch.com",
  "medium.com",
  "substack.com",
  "wikipedia.org",
  "wikimedia.org",
  "wikidata.org",
  "britannica.com",
  "news.ycombinator.com",
];

const PROFESSIONAL_HOSTS = ["github.com", "gitlab.com", "stackoverflow.com", "wellfound.com"];
const ACADEMIC_HOSTS = ["scholar.google.com", "researchgate.net", "orcid.org", "arxiv.org", "doi.org", "openalex.org", "semanticscholar.org", "ingentaconnect.com"];
const RECORD_HOSTS = ["opencorporates.com", "sec.gov", "handelsregister.de", "companieshouse.gov.uk"];
const LEAK_HOSTS = ["haveibeenpwned.com"];

const DOMAIN_RULES: Array<{ test: RegExp; category: FootprintCategory }> = [
  { test: /(^|\.)(uni-[a-z0-9-]+\.de|[a-z0-9-]+\.edu|[a-z0-9-]+\.ac\.uk)$/i, category: "EDUCATION" },
];

const KEYWORD_RULES: Array<{ test: RegExp; category: FootprintCategory }> = [
  { test: /\b(datenleck|geleakt|breach|leaked|leak|pwned)\b/i, category: "DATA_LEAK" },
  { test: /\b(zeitung|nachrichten|tagesschau|pressemitteilung|leiterartikel|interview|presse)\b/i, category: "MEDIA_MENTION" },
  { test: /\b(handelsregister|registereintrag|firmenbuch|filing|companies house)\b/i, category: "PUBLIC_RECORD" },
  { test: /\b(veröffentlichung|veroeffentlichung|paper|orcid|forschung|zeitschrift|doi)\b/i, category: "ACADEMIC" },
  { test: /\b(abschluss|bachelor|master|diplom|promotion|universit\w*|hochschule|alumni|phd|doktorandin|doktorand|postdoc)\b/i, category: "EDUCATION" },
  { test: /\b(instagram|facebook|tiktok|youtube|linkedin|social-profil)\b/i, category: "SOCIAL" },
  { test: /\b(portfolio|lebenslauf|github|ingenieur)\b/i, category: "PROFESSIONAL" },
];

export function domainFromUrl(url: string): string {
  return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
}

export function categorize(input: { domain: string; title: string; snippet: string }): {
  category: FootprintCategory;
  domainCategory: FootprintCategory | null;
  keywordCategory: FootprintCategory | null;
} {
  const haystack = `${input.title} ${input.snippet} ${input.domain}`;
  const leakKeyword = KEYWORD_RULES.find(
    (rule) => rule.category === "DATA_LEAK" && rule.test.test(haystack),
  );
  if (leakKeyword) {
    return { category: "DATA_LEAK", domainCategory: matchDomain(input.domain), keywordCategory: "DATA_LEAK" };
  }

  const domainCategory = matchDomain(input.domain);
  const keywordCategory = matchKeyword(haystack);
  return {
    category: domainCategory ?? keywordCategory ?? "OTHER",
    domainCategory,
    keywordCategory,
  };
}

export function normalizeHit(hit: RawHit, subjectName: string): NormalizedDraft {
  const domain = domainFromUrl(hit.url);
  const decision = categorize({ domain, title: hit.title, snippet: hit.snippet });
  return {
    sourceUrl: hit.url,
    domain,
    title: hit.title.trim(),
    snippet: hit.snippet.trim(),
    category: decision.category,
    confidenceScore: scoreConfidence(decision, hit.title, subjectName),
    facts: hit.facts
      .map((fact) => ({ label: fact.label.trim(), value: fact.value.trim() }))
      .filter((fact) => fact.label.length > 0 && fact.value.length > 0),
  };
}

function matchDomain(domain: string): FootprintCategory | null {
  const host = domain.toLowerCase();
  if (hostMatches(host, LEAK_HOSTS)) return "DATA_LEAK";
  if (hostMatches(host, SOCIAL_HOSTS)) return "SOCIAL";
  if (hostMatches(host, NEWS_HOSTS) || /zeitung|nachrichten|\.news$/.test(host)) return "MEDIA_MENTION";
  if (hostMatches(host, ACADEMIC_HOSTS)) return "ACADEMIC";
  if (hostMatches(host, PROFESSIONAL_HOSTS)) return "PROFESSIONAL";
  if (hostMatches(host, RECORD_HOSTS)) return "PUBLIC_RECORD";
  return DOMAIN_RULES.find((rule) => rule.test.test(host))?.category ?? null;
}

function hostMatches(host: string, names: string[]): boolean {
  return names.some((name) => host === name || host.endsWith(`.${name}`));
}

function matchKeyword(haystack: string): FootprintCategory | null {
  return KEYWORD_RULES.find((rule) => rule.category !== "DATA_LEAK" && rule.test.test(haystack))?.category ?? null;
}

function scoreConfidence(
  decision: { domainCategory: FootprintCategory | null; keywordCategory: FootprintCategory | null },
  title: string,
  subjectName: string,
): number {
  let score = 0.42;
  if (decision.domainCategory) score += 0.34;
  if (decision.keywordCategory) {
    const agrees = decision.domainCategory == null || decision.keywordCategory === decision.domainCategory;
    score += agrees ? 0.12 : -0.08;
  }
  if (nameAppears(title, subjectName)) score += 0.06;
  return clamp(round2(score), 0.35, 0.97);
}

function nameAppears(title: string, subjectName: string): boolean {
  const normalizedTitle = title.toLowerCase();
  return subjectName
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length >= 3)
    .some((part) => normalizedTitle.includes(part));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
