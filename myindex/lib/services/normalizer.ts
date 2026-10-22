import type { DisplayFact, FootprintCategory, NormalizedDraft } from "@/lib/domain/types";

export type RawHit = {
  url: string;
  title: string;
  snippet: string;
  facts: DisplayFact[];
};

const DOMAIN_RULES: Array<{ test: RegExp; category: FootprintCategory }> = [
  { test: /(^|\.)(scholar\.google\.com|researchgate\.net|orcid\.org|arxiv\.org|doi\.org)$/i, category: "ACADEMIC" },
  { test: /(^|\.)(uni-[a-z0-9-]+\.de|[a-z0-9-]+\.edu|[a-z0-9-]+\.ac\.uk)$/i, category: "EDUCATION" },
  { test: /(^|\.)((linkedin|xing|github|gitlab|stackoverflow|wellfound)\.com)$/i, category: "PROFESSIONAL" },
  { test: /(^|\.)((x|twitter|instagram|facebook|tiktok|reddit|threads)\.com|bsky\.app)$/i, category: "SOCIAL" },
  { test: /(^|\.)((medium|substack|youtube)\.com|(wikipedia|wikimedia|wikidata|britannica)\.org|news\.ycombinator\.com)$/i, category: "MEDIA_MENTION" },
  { test: /(^|\.)(openalex\.org|semanticscholar\.org)$/i, category: "ACADEMIC" },
  { test: /(^|\.)((opencorporates|sec)\.com|handelsregister\.de)$/i, category: "PUBLIC_RECORD" },
  { test: /(^|\.)(haveibeenpwned\.com)$/i, category: "DATA_LEAK" },
];

const KEYWORD_RULES: Array<{ test: RegExp; category: FootprintCategory }> = [
  { test: /\b(datenleck|geleakt|breach|leaked|leak|pwned)\b/i, category: "DATA_LEAK" },
  { test: /\b(handelsregister|registereintrag|firmenbuch|filing|companies house)\b/i, category: "PUBLIC_RECORD" },
  { test: /\b(veröffentlichung|veroeffentlichung|paper|orcid|forschung|zeitschrift|doi)\b/i, category: "ACADEMIC" },
  { test: /\b(abschluss|bachelor|master|diplom|promotion|universit\w*|hochschule|alumni)\b/i, category: "EDUCATION" },
  { test: /\b(interview|erwähnung|erwaehnung|presse)\b/i, category: "MEDIA_MENTION" },
  { test: /\b(instagram|facebook|tiktok|social-profil|follower)\b/i, category: "SOCIAL" },
  { test: /\b(portfolio|lebenslauf|linkedin|xing|github|ingenieur)\b/i, category: "PROFESSIONAL" },
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
  return DOMAIN_RULES.find((rule) => rule.test.test(domain))?.category ?? null;
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
