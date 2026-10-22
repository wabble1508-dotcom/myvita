import type { ScanInput } from "@/lib/validators";
import type { RawHit } from "@/lib/services/normalizer";

const USER_AGENT = "Mozilla/5.0 (compatible; MyVita/0.1; public name search)";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const RESULT_CAP = 200;
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

type ParsedResult = { url: string; title: string; snippet: string };

/**
 * Liest öffentliche Treffer zu einem Namen.
 * Websuche über einen erreichbaren Index, Nachrichten, Wikipedia, GitHub, OpenAlex und Hacker News.
 * Passwort- und Datenleck-Seiten werden verworfen.
 */
export async function searchPublicWeb(input: ScanInput): Promise<PublicSearchResult> {
  const name = input.fullName.trim();
  const handle = input.handle?.trim();
  const email = input.email?.trim();
  const plans = queryPlans(name, handle, email);
  const jobs = [
    runLabeled("Websuche", () => searchBingWeb(name)),
    runLabeled("Nachrichten", () => searchBingNews(name)),
    ...plans.map((plan) => runLabeled(plan.label, () => searchDuckDuckGo(plan, name, handle, email))),
    runLabeled("Wikipedia", () => searchWikipedia(name)),
    runLabeled("GitHub", () => searchGitHub(name)),
    runLabeled("OpenAlex", () => searchOpenAlex(name)),
    runLabeled("Hacker News", () => searchHackerNews(name)),
  ];
  if (handle) jobs.push(runLabeled("Handle", () => searchBingExact(handle, "Handle")));
  if (email) jobs.push(runLabeled("E-Mail", () => searchBingExact(email, "E-Mail")));

  const settled = await mapPool(jobs, 4, (job) => job);
  const hits: RawHit[] = [];
  const seen = new Set<string>();
  const sources: string[] = [];
  const failures: string[] = [];
  let reached = false;

  for (const result of settled) {
    if (result.error === "leer") continue;
    if (result.error) {
      failures.push(result.label);
      continue;
    }
    reached = true;
    if (result.hits.length > 0) sources.push(result.label);
    for (const hit of result.hits) {
      if (hits.length >= RESULT_CAP) break;
      const key = canonicalKey(hit.url);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      hits.push(hit);
    }
  }

  if (sources.length === 0 && reached) sources.push("Websuche");
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

/** Der volle Name steht beieinander, auch in umgekehrter Reihenfolge. */
export function mentionsName(haystack: string, parts: string[]): boolean {
  if (!mentionsAll(haystack, parts)) return false;
  if (parts.length < 2) return true;
  const text = fold(haystack);
  return partsInOrder(text, parts) || partsInOrder(text, [...parts].reverse());
}

export function parseBingRss(xml: string): ParsedResult[] {
  const parsed: ParsedResult[] = [];
  for (const item of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const title = xmlTag(item[1], "title");
    const link = xmlTag(item[1], "link");
    const description = xmlTag(item[1], "description");
    const url = link ? unwrapBing(link) : null;
    if (!url || !title || isBlockedUrl(url)) continue;
    parsed.push({ url, title: decodeHtml(title), snippet: description ? decodeHtml(description) : "" });
  }
  return parsed;
}

export function parseBingHtml(html: string): ParsedResult[] {
  const parsed: ParsedResult[] = [];
  for (const block of html.split(/<li class="b_algo"/i).slice(1)) {
    const heading = block.match(/<h2>([\s\S]*?)<\/h2>/i);
    const link = heading?.[1].match(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!link) continue;
    const url = unwrapBing(decodeAttr(link[1]));
    const title = decodeHtml(link[2]);
    const caption = block.match(/<p class="b_lineclamp\d"[^>]*>([\s\S]*?)<\/p>/i);
    if (!url || !title || isBlockedUrl(url)) continue;
    parsed.push({ url, title, snippet: caption ? decodeHtml(caption[1]) : "" });
  }
  return parsed;
}

export function parseBingNews(html: string): ParsedResult[] {
  const parsed: ParsedResult[] = [];
  for (const match of html.matchAll(/<a\b([^>]*\bclass="title"[^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attr(match[1], "href");
    const heading = match[2].match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (!href || !heading || match.index == null) continue;
    const url = unwrapBing(href);
    const title = decodeHtml(heading[1]);
    const nearby = html.slice(match.index, match.index + 1500);
    const snippetAttr = nearby.match(/class="snippet"[^>]*\btitle="([^"]*)"/i);
    const snippetBody = nearby.match(/class="snippet"[^>]*>([\s\S]*?)<\/div>/i);
    if (!url || !title || isBlockedUrl(url)) continue;
    parsed.push({
      url,
      title,
      snippet: decodeHtml(snippetAttr?.[1] ?? snippetBody?.[1] ?? ""),
    });
  }
  return parsed;
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
    {
      label: "Social Media",
      q: `${quoted} (site:instagram.com OR site:facebook.com OR site:tiktok.com OR site:x.com OR site:twitter.com OR site:threads.net OR site:bsky.app OR site:linkedin.com OR site:xing.com)`,
      kl: "wt-wt",
      pages: 1,
      mode: "name",
    },
    {
      label: "Video und Foren",
      q: `${quoted} (site:youtube.com OR site:vimeo.com OR site:twitch.tv OR site:reddit.com OR site:pinterest.com)`,
      kl: "wt-wt",
      pages: 1,
      mode: "name",
    },
    {
      label: "Zeitungen Deutschland",
      q: `${quoted} (site:spiegel.de OR site:zeit.de OR site:faz.net OR site:sueddeutsche.de OR site:tagesschau.de OR site:welt.de OR site:bild.de OR site:taz.de OR site:handelsblatt.com OR site:n-tv.de OR site:focus.de OR site:stern.de)`,
      kl: "de-de",
      pages: 1,
      mode: "name",
    },
    {
      label: "Zeitungen international",
      q: `${quoted} (site:bbc.com OR site:bbc.co.uk OR site:reuters.com OR site:nytimes.com OR site:theguardian.com OR site:cnn.com OR site:apnews.com OR site:bloomberg.com OR site:forbes.com OR site:washingtonpost.com)`,
      kl: "wt-wt",
      pages: 1,
      mode: "name",
    },
    {
      label: "Nachrichten",
      q: `${quoted} (Zeitung OR Nachrichten OR Artikel OR Meldung OR Interview OR Presse)`,
      kl: "de-de",
      pages: 1,
      mode: "name",
    },
    { label: "Weitere Webseiten", q: quoted, kl: "wt-wt", pages: 2, mode: "name" },
    { label: "Websuche Deutschland", q: quoted, kl: "de-de", pages: 1, mode: "name" },
    { label: "Wikipedia-Seiten", q: `${quoted} site:wikipedia.org`, kl: "wt-wt", pages: 1, mode: "name" },
    { label: "GitHub-Seiten", q: `${quoted} site:github.com`, kl: "wt-wt", pages: 1, mode: "name" },
  ];
  if (handle) plans.push({ label: "Handle", q: `"${handle}"`, kl: "wt-wt", pages: 1, mode: "handle" });
  if (email) plans.push({ label: "E-Mail", q: `"${email}"`, kl: "wt-wt", pages: 1, mode: "email" });
  return plans;
}

async function searchBingWeb(name: string): Promise<RawHit[]> {
  const parts = nameParts(name);
  const markets = [
    { source: "Websuche", setlang: "de", cc: "DE" },
    { source: "Websuche international", setlang: "en", cc: "US" },
  ];
  const hits: RawHit[] = [];
  let failure: unknown;
  for (const market of markets) {
    try {
      const page = acceptBingPage(await fetchBingWeb(name, market.setlang, market.cc), parts);
      for (const result of page) hits.push(toHit(result.url, result.title, result.snippet, market.source, name));
    } catch (error) {
      failure = error;
    }
  }
  if (hits.length === 0 && failure) throw failure;
  return hits;
}

async function searchBingNews(name: string): Promise<RawHit[]> {
  const parts = nameParts(name);
  const markets = [
    { source: "Nachrichten", setlang: "de", cc: "DE" },
    { source: "Nachrichten international", setlang: "en", cc: "US" },
  ];
  const hits: RawHit[] = [];
  let failure: unknown;
  for (const market of markets) {
    try {
      const html = await fetchText(
        `https://www.bing.com/news/search?q=${encodeURIComponent(name)}&setlang=${market.setlang}&cc=${market.cc}`,
        { userAgent: BROWSER_UA },
      );
      const page = acceptBingPage(parseBingNews(html), parts);
      for (const result of page) hits.push(toHit(result.url, result.title, result.snippet, market.source, name));
    } catch (error) {
      failure = error;
    }
  }
  if (hits.length === 0 && failure) throw failure;
  return hits;
}

async function searchBingExact(query: string, source: string): Promise<RawHit[]> {
  const needle = fold(query);
  const page = await fetchBingWeb(`"${query}"`, "de", "DE");
  return page
    .filter((result) => fold(`${result.title} ${result.snippet} ${result.url}`).includes(needle))
    .map((result) => toHit(result.url, result.title, result.snippet, source, query));
}

async function fetchBingWeb(query: string, setlang: string, cc: string): Promise<ParsedResult[]> {
  const xml = await fetchText(
    `https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}&setlang=${setlang}&cc=${cc}`,
    { userAgent: BROWSER_UA },
  );
  const fromRss = parseBingRss(xml);
  if (fromRss.length > 0) return fromRss;
  const html = await fetchText(
    `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=${setlang}&cc=${cc}`,
    { userAgent: BROWSER_UA },
  );
  return parseBingHtml(html);
}

function acceptBingPage(results: ParsedResult[], parts: string[]): ParsedResult[] {
  return results.filter((result) => mentionsName(`${result.title} ${result.snippet} ${result.url}`, parts));
}

function partsInOrder(text: string, parts: string[]): boolean {
  let from = 0;
  let previousEnd = -1;
  for (const part of parts) {
    const at = text.indexOf(part, from);
    if (at < 0) return false;
    if (previousEnd >= 0 && at - previousEnd > 8) return false;
    previousEnd = at + part.length;
    from = previousEnd;
  }
  return true;
}

async function searchDuckDuckGo(plan: QueryPlan, name: string, handle: string | undefined, email: string | undefined): Promise<RawHit[]> {
  const parts = nameParts(name);
  let html: string;
  try {
    html = await fetchText(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(plan.q)}&kl=${encodeURIComponent(plan.kl)}`);
  } catch (error) {
    const status = error instanceof Error ? error.message : "";
    if (status === "202" || status === "403" || status === "429") throw new Error("leer");
    throw error;
  }
  const hits: RawHit[] = [];
  for (let page = 0; page < plan.pages; page += 1) {
    if (!html.includes("result__a")) {
      if (hits.length === 0) throw new Error("leer");
      break;
    }
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
      if (!mentionsName(`${entry.title} ${snippet} ${pageUrl}`, parts)) continue;
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
    if (!mentionsName(author.display_name, parts)) continue;
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
    if (!mentionsName(`${story.title} ${snippet} ${pageUrl}`, parts)) continue;
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
  return mentionsName(haystack, parts);
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

function unwrapBing(href: string): string | null {
  try {
    const absolute = href.startsWith("//") ? `https:${href}` : href;
    const url = new URL(absolute, "https://www.bing.com");
    const token = url.searchParams.get("u");
    if (token?.startsWith("a1")) return canonicalUrl(decodeBingToken(token));
    const host = url.hostname.toLowerCase();
    if (host === "bing.com" || host.endsWith(".bing.com") || host.endsWith("microsoft.com") || host.endsWith(".microsoft.com")) {
      return null;
    }
    return canonicalUrl(url.toString());
  } catch {
    return null;
  }
}

function decodeBingToken(token: string): string {
  const raw = token.slice(2).replace(/-/g, "+").replace(/_/g, "/");
  const padded = raw + "=".repeat((4 - (raw.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function xmlTag(block: string, name: string): string | null {
  const match = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i"));
  return match ? match[1].trim() : null;
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

async function fetchText(url: string, init?: RequestInit & { userAgent?: string }): Promise<string> {
  const userAgent = init?.userAgent ?? USER_AGENT;
  const rest = { ...init };
  delete rest.userAgent;
  const response = await fetch(url, {
    ...rest,
    redirect: "follow",
    signal: AbortSignal.timeout(12_000),
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html,application/json,application/rss+xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "de,en;q=0.8",
      ...rest.headers,
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
