import type { ScanInput } from "@/lib/validators";
import type { RawHit } from "@/lib/services/normalizer";

const USER_AGENT = "Mozilla/5.0 (compatible; MyVita/0.1; public name search)";
const RESULT_CAP = 120;
const STOP_WORDS = new Set(["von", "van", "de", "del", "der", "die", "den", "und", "and", "da", "dos", "di", "la", "le", "bin", "al"]);

const BLOCKED_HOST_PARTS = [
  "haveibeenpwned",
  "dehashed",
  "leakcheck",
  "snusbase",
  "intelx",
  "weleakinfo",
  "leak-lookup",
  "leaklookup",
  "psbdmp",
  "breachforums",
  "raidforums",
  "duckduckgo.com",
  "bing.com",
  "yahoo.com",
  "yandex.",
];

export type PublicSearchResult = {
  hits: RawHit[];
  sources: string[];
  failures: string[];
};

type QueryPlan = {
  label: string;
  q: string;
  kl: string;
  pages: number;
  mode: "name" | "handle" | "email";
};

/**
 * Liest öffentliche Treffer zu einem Namen.
 * Websuche, Wikipedia, GitHub, OpenAlex und Hacker News.
 * Passwort- und Datenleck-Seiten werden verworfen.
 */
export async function searchPublicWeb(input: ScanInput): Promise<PublicSearchResult> {
  const name = input.fullName.trim();
  const handle = input.handle?.trim();
  const email = input.email?.trim();
  const plans = queryPlans(name, handle, email);
  const jobs = [
    ...plans.map((plan) => runLabeled(plan.label, () => searchDuckDuckGo(plan, name, handle, email))),
    runLabeled("Wikipedia", () => searchWikipedia(name)),
    runLabeled("GitHub", () => searchGitHub(name)),
    runLabeled("OpenAlex", () => searchOpenAlex(name)),
    runLabeled("Hacker News", () => searchHackerNews(name)),
  ];

  const settled = await mapPool(jobs, 4, (job) => job);
  const hits: RawHit[] = [];
  const seen = new Set<string>();
  const sources: string[] = [];
  const failures: string[] = [];

  for (const result of settled) {
    if (result.error) {
      failures.push(result.label);
      continue;
    }
    sources.push(result.label);
    for (const hit of result.hits) {
      if (hits.length >= RESULT_CAP) break;
      const key = canonicalKey(hit.url);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      hits.push(hit);
    }
  }

  return { hits, sources, failures };
}

export function nameParts(name: string): string[] {
  const parts = fold(name)
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length >= 2 && !STOP_WORDS.has(part));
  const long = parts.filter((part) => part.length >= 3);
  return long.length > 0 ? long : parts;
}

export function mentionsAll(haystack: string, parts: string[]): boolean {
  if (parts.length === 0) return false;
  const text = fold(haystack);
  return parts.every((part) => text.includes(part));
}

export function parseDuckDuckGo(html: string): Array<{ url: string; title: string; snippet: string }> {
  const titles = [...html.matchAll(/class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  const snippets = [...html.matchAll(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi)];
  const parsed: Array<{ url: string; title: string; snippet: string }> = [];
  for (let index = 0; index < titles.length; index += 1) {
    const url = unwrapDuckDuckGo(decodeAttr(titles[index][1]));
    const title = decodeHtml(titles[index][2]);
    if (!url || !title || isBlockedUrl(url)) continue;
    parsed.push({
      url,
      title,
      snippet: snippets[index] ? decodeHtml(snippets[index][1]) : "",
    });
  }
  return parsed;
}

function queryPlans(name: string, handle: string | undefined, email: string | undefined): QueryPlan[] {
  const quoted = `"${name}"`;
  const plans: QueryPlan[] = [
    { label: "Websuche", q: quoted, kl: "wt-wt", pages: 3, mode: "name" },
    { label: "Websuche Deutschland", q: quoted, kl: "de-de", pages: 1, mode: "name" },
    { label: "Websuche Profile", q: `${quoted} (Profil OR profile OR Interview OR Biografie OR biography)`, kl: "wt-wt", pages: 1, mode: "name" },
    { label: "LinkedIn", q: `${quoted} site:linkedin.com/in`, kl: "wt-wt", pages: 1, mode: "name" },
    { label: "GitHub-Seiten", q: `${quoted} site:github.com`, kl: "wt-wt", pages: 1, mode: "name" },
    { label: "YouTube", q: `${quoted} site:youtube.com`, kl: "wt-wt", pages: 1, mode: "name" },
    { label: "X", q: `${quoted} (site:x.com OR site:twitter.com)`, kl: "wt-wt", pages: 1, mode: "name" },
    { label: "Wikipedia-Seiten", q: `${quoted} site:wikipedia.org`, kl: "wt-wt", pages: 1, mode: "name" },
  ];
  if (handle) plans.push({ label: "Handle", q: `"${handle}"`, kl: "wt-wt", pages: 1, mode: "handle" });
  if (email) plans.push({ label: "E-Mail", q: `"${email}"`, kl: "wt-wt", pages: 1, mode: "email" });
  return plans;
}

async function searchDuckDuckGo(plan: QueryPlan, name: string, handle: string | undefined, email: string | undefined): Promise<RawHit[]> {
  const parts = nameParts(name);
  let html = await fetchText(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(plan.q)}&kl=${encodeURIComponent(plan.kl)}`);
  const hits: RawHit[] = [];
  for (let page = 0; page < plan.pages; page += 1) {
    if (!html.includes("result__a")) break;
    for (const result of parseDuckDuckGo(html)) {
      if (!matchesPlan(plan.mode, result, parts, handle, email)) continue;
      hits.push(toHit(result.url, result.title, result.snippet, plan.label, plan.q));
    }
    const next = hiddenFields(html);
    if (!next || page === plan.pages - 1) break;
    try {
      html = await fetchText("https://html.duckduckgo.com/html/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: next.toString(),
      });
    } catch {
      break;
    }
  }
  return hits;
}

async function searchWikipedia(name: string): Promise<RawHit[]> {
  const parts = nameParts(name);
  const hits: RawHit[] = [];
  for (const lang of ["de", "en"] as const) {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&utf8=1&format=json&srlimit=8`;
    const payload = (await fetchJson(url)) as {
      query?: { search?: Array<{ title?: string; snippet?: string }> };
    };
    for (const entry of payload.query?.search ?? []) {
      if (!entry.title) continue;
      const snippet = decodeHtml(entry.snippet ?? "");
      const pageUrl = wikiUrl(lang, entry.title);
      if (!mentionsAll(`${entry.title} ${snippet} ${pageUrl}`, parts)) continue;
      hits.push(toHit(pageUrl, entry.title, snippet, lang === "de" ? "Wikipedia Deutsch" : "Wikipedia Englisch", name));
    }
  }
  return hits;
}

async function searchGitHub(name: string): Promise<RawHit[]> {
  const parts = nameParts(name);
  const longest = [...parts].sort((left, right) => right.length - left.length)[0];
  if (!longest) return [];
  const url = `https://api.github.com/search/users?q=${encodeURIComponent(name)}&per_page=8`;
  const payload = (await fetchJson(url, {
    Accept: "application/vnd.github+json",
    "User-Agent": "MyVita",
  })) as { items?: Array<{ login?: string; html_url?: string }> };
  const hits: RawHit[] = [];
  for (const item of payload.items ?? []) {
    if (!item.login || !item.html_url) continue;
    if (!fold(item.login).includes(longest)) continue;
    hits.push(
      toHit(item.html_url, `${item.login} auf GitHub`, `Öffentliches GitHub-Profil ${item.login}.`, "GitHub", name, [
        { label: "Nutzername", value: item.login },
      ]),
    );
  }
  return hits;
}

async function searchOpenAlex(name: string): Promise<RawHit[]> {
  const parts = nameParts(name);
  const url = `https://api.openalex.org/authors?search=${encodeURIComponent(name)}&per-page=5`;
  const payload = (await fetchJson(url)) as {
    results?: Array<{ id?: string; display_name?: string; works_count?: number; orcid?: string | null }>;
  };
  const hits: RawHit[] = [];
  for (const author of payload.results ?? []) {
    if (!author.id || !author.display_name) continue;
    if (!mentionsAll(author.display_name, parts)) continue;
    const facts = [{ label: "Name in der Quelle", value: author.display_name }];
    if (typeof author.works_count === "number") facts.push({ label: "Öffentliche Werke", value: String(author.works_count) });
    if (author.orcid) facts.push({ label: "ORCID", value: author.orcid });
    hits.push(
      toHit(
        author.id,
        `${author.display_name} bei OpenAlex`,
        `Öffentlicher Autoreneintrag zu ${author.display_name}.`,
        "OpenAlex",
        name,
        facts,
      ),
    );
  }
  return hits;
}

async function searchHackerNews(name: string): Promise<RawHit[]> {
  const parts = nameParts(name);
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(name)}&tags=story&hitsPerPage=8`;
  const payload = (await fetchJson(url)) as {
    hits?: Array<{ title?: string; url?: string | null; objectID?: string; story_text?: string | null }>;
  };
  const hits: RawHit[] = [];
  for (const story of payload.hits ?? []) {
    if (!story.title) continue;
    const pageUrl = story.url || (story.objectID ? `https://news.ycombinator.com/item?id=${story.objectID}` : "");
    if (!pageUrl) continue;
    const snippet = decodeHtml(story.story_text ?? story.title);
    if (!mentionsAll(`${story.title} ${snippet} ${pageUrl}`, parts)) continue;
    hits.push(toHit(pageUrl, story.title, snippet, "Hacker News", name));
  }
  return hits;
}

function matchesPlan(
  mode: QueryPlan["mode"],
  result: { url: string; title: string; snippet: string },
  parts: string[],
  handle: string | undefined,
  email: string | undefined,
): boolean {
  const haystack = `${result.title} ${result.snippet} ${result.url}`;
  if (mode === "email") return Boolean(email) && fold(haystack).includes(fold(email ?? ""));
  if (mode === "handle") return Boolean(handle) && fold(haystack).includes(fold(handle ?? ""));
  return mentionsAll(haystack, parts);
}

function toHit(
  url: string,
  title: string,
  snippet: string,
  source: string,
  query: string,
  extra: RawHit["facts"] = [],
): RawHit {
  const text = snippet.trim() || title.trim();
  return {
    url,
    title: title.trim(),
    snippet: text,
    facts: [
      { label: "Herkunft", value: "Öffentliche Websuche" },
      { label: "Quelle", value: source },
      { label: "Suchbegriff", value: query },
      { label: "Textstelle", value: text },
      ...extra,
    ],
  };
}

function unwrapDuckDuckGo(href: string): string | null {
  try {
    const absolute = href.startsWith("//") ? `https:${href}` : href;
    const url = new URL(absolute, "https://duckduckgo.com");
    const target = url.searchParams.get("uddg") ?? (url.hostname.endsWith("duckduckgo.com") ? "" : absolute);
    if (!target) return null;
    return canonicalUrl(target);
  } catch {
    return null;
  }
}

function canonicalUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "fbclid" || key === "gclid") url.searchParams.delete(key);
    }
    url.hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return null;
  }
}

function canonicalKey(raw: string): string | null {
  return canonicalUrl(raw);
}

function isBlockedUrl(raw: string): boolean {
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (BLOCKED_HOST_PARTS.some((part) => host.includes(part))) return true;
    if (host === "google.com" || host.endsWith(".google.com")) {
      return !(host.startsWith("scholar.") || host.startsWith("sites."));
    }
    return false;
  } catch {
    return true;
  }
}

function hiddenFields(html: string): URLSearchParams | null {
  const form = html.match(/<form action="\/html\/" method="post">([\s\S]*?)<\/form>/i);
  if (!form) return null;
  const params = new URLSearchParams();
  for (const input of form[1].matchAll(/<input\b([^>]*)>/gi)) {
    const name = attr(input[1], "name");
    const value = attr(input[1], "value");
    if (!name || value == null) continue;
    params.set(name, value);
  }
  if (!params.get("q") || !params.get("vqd")) return null;
  return params;
}

function attr(tag: string, key: string): string | null {
  const match = tag.match(new RegExp(`\\b${key}="([^"]*)"`, "i"));
  return match ? decodeAttr(match[1]) : null;
}

function wikiUrl(lang: "de" | "en", title: string): string {
  const slug = encodeURIComponent(title.replace(/ /g, "_")).replace(/%2F/g, "/");
  return `https://${lang}.wikipedia.org/wiki/${slug}`;
}

function fold(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function decodeAttr(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;|&apos;/g, "'");
}

function decodeHtml(value: string): string {
  return decodeAttr(value.replace(/<[^>]+>/g, " "))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCodePoint(Number(num)))
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const response = await fetch(url, {
    ...init,
    redirect: "follow",
    signal: AbortSignal.timeout(12_000),
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      "Accept-Language": "de,en;q=0.8",
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error(`${response.status}`);
  return response.text();
}

async function fetchJson(url: string, headers?: Record<string, string>): Promise<unknown> {
  const text = await fetchText(url, { headers });
  return JSON.parse(text) as unknown;
}

async function runLabeled(label: string, task: () => Promise<RawHit[]>): Promise<{ label: string; hits: RawHit[]; error?: string }> {
  try {
    return { label, hits: await task() };
  } catch (error) {
    return { label, hits: [], error: error instanceof Error ? error.message : "fehlgeschlagen" };
  }
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}
