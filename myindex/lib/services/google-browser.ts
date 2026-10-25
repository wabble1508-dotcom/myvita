import childProcess from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

export type GoogleHit = {
  url: string;
  title: string;
  snippet: string;
  image?: string;
};

type Block = { title: string; url: string; goto: string; text: string; image: string };
type Target = { id?: string; type?: string; url?: string; webSocketDebuggerUrl?: string };

const EXTRACT = `(() => {
  function visibleUrl(text) {
    const start = text.search(/https?:\\/\\//);
    if (start < 0) return "";
    const tail = text.slice(start);
    const host = tail.match(/^https?:\\/\\/[^\\s›»>·]+/);
    if (!host) return "";
    let url = host[0];
    const rest = tail.slice(host[0].length);
    for (const segment of rest.matchAll(/\\s*[›»>]\\s*([^›»>·\\s]+)/g)) {
      const part = segment[1];
      if (part.includes("…") || part.includes("...")) break;
      url += "/" + part.replace(/[),.;]+$/g, "");
    }
    try { return new URL(url).toString(); } catch { return ""; }
  }
  const results = [];
  const seen = new Set();
  for (const h3 of document.querySelectorAll("h3")) {
    const title = (h3.innerText || "").replace(/\\s+/g, " ").trim();
    if (!title || seen.has(title)) continue;
    seen.add(title);
    const link = h3.closest("a");
    const href = link ? link.getAttribute("href") || "" : "";
    const goto = href.startsWith("/goto") ? new URL(href, location.origin).toString() : "";
    let node = h3.parentElement;
    let best = node;
    while (node && node.querySelectorAll("h3").length === 1 && (node.innerText || "").length < 900) {
      best = node;
      node = node.parentElement;
    }
    const text = ((best && best.innerText) || "").replace(/\\s+/g, " ").trim().slice(0, 700);
    results.push({ title, url: visibleUrl(text), goto, text, image: photoUrl(best) });
  }
  function photoUrl(root) {
    if (!root) return "";
    for (const img of root.querySelectorAll("img")) {
      const src = img.currentSrc || img.src || "";
      if (!src.startsWith("https://")) continue;
      if (/favicon|\\/icon|sprite|logo/i.test(src)) continue;
      const w = img.naturalWidth || 0;
      const h = img.naturalHeight || 0;
      if ((w && w < 48) || (h && h < 48)) continue;
      return src.slice(0, 500);
    }
    return "";
  }
  return JSON.stringify(results);
})()`;

/**
 * Liest die öffentliche Google-Trefferliste in einem frischen Browserfenster.
 * Ein Captcha oder eine leere Seite liefert keine Treffer und wird nicht umgangen.
 */
export async function googleSearch(name: string, accept: (text: string) => boolean): Promise<GoogleHit[]> {
  return searchSpawned(name, accept);
}

async function searchSpawned(name: string, accept: (text: string) => boolean): Promise<GoogleHit[]> {
  const chrome = findChrome();
  if (!chrome) throw new Error("leer");
  const port = await freePort();
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "myvita-chrome-"));
  const display = chromeDisplay();
  const child = childProcess.spawn(/* turbopackIgnore: true */ chrome,
    [
      ...(display ? [] : ["--headless=new"]),
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--password-store=basic",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      `--user-data-dir=${dir}`,
      `--remote-debugging-port=${port}`,
      "--window-size=1400,900",
      "--lang=de",
      googleUrl(name),
    ],
    {
      detached: true,
      stdio: "ignore",
      env: { ...process.env, ...(display ? { DISPLAY: display } : {}) },
    },
  );
  child.unref();
  const kill = () => {
    if (!child.pid) return;
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      try {
        child.kill("SIGKILL");
      } catch {
        /* already gone */
      }
    }
  };
  const timer = setTimeout(kill, 48_000);
  try {
    await waitForJson(`http://127.0.0.1:${port}/json/version`);
    const version = await waitForJson<{ webSocketDebuggerUrl?: string }>(`http://127.0.0.1:${port}/json/version`);
    if (!version.webSocketDebuggerUrl) return [];
    const browser = await connectCdp(version.webSocketDebuggerUrl);
    try {
      const first = await readSearch(port, browser, accept);
      if (first.captcha) return [];
      const tab = await connectPage(port);
      if (!tab) return first.hits;
      try {
        let hits = first.hits;
        if (hits.length === 0) {
          await tab.send("Page.navigate", { url: googleUrl(`"${name}"`) });
          hits = await readOpenPage(tab, browser, accept);
        }
        await tab.send("Page.navigate", { url: googleUrl(`"${name}" site:linkedin.com/in`) });
        await waitForHref(tab, "site%3Alinkedin.com");
        const profiles = await readOpenPage(tab, browser, accept);
        return mergeHits(hits, profiles);
      } finally {
        tab.close();
      }
    } finally {
      browser.close();
    }
  } catch (error) {
    if (error instanceof Error && error.message === "leer") throw error;
    return [];
  } finally {
    clearTimeout(timer);
    kill();
    await sleep(200);
    await fsp.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

function googleUrl(query: string): string {
  // Dieselbe Trefferliste wie im Browser, inklusive LinkedIn-Karten und Bildern.
  // Eine ähnliche Schreibweise bleibt draußen, weil nur der volle Name übernommen wird.
  return `https://www.google.de/search?q=${encodeURIComponent(query)}&hl=de&gl=de&num=20&pws=0&nfpr=1`;
}

async function readSearch(
  port: number,
  browser: Cdp,
  accept: (text: string) => boolean,
): Promise<{ hits: GoogleHit[]; captcha: boolean }> {
  const started = Date.now();
  while (Date.now() - started < 12_000) {
    const socket = await pageSocket(port);
    if (!socket) {
      await sleep(300);
      continue;
    }
    const tab = await connectCdp(socket);
    try {
      const state = await pageState(tab);
      if (state === "captcha") return { hits: [], captcha: true };
      if (state === "ready") return { hits: await acceptBlocks(tab, browser, accept), captcha: false };
    } finally {
      tab.close();
    }
    await sleep(350);
  }
  return { hits: [], captcha: false };
}

async function waitForHref(tab: Cdp, part: string): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < 8_000) {
    const current = await tab.send("Runtime.evaluate", { expression: "location.href", returnByValue: true });
    if (String(current.result?.value ?? "").includes(part)) return;
    await sleep(200);
  }
}

async function readOpenPage(tab: Cdp, browser: Cdp, accept: (text: string) => boolean): Promise<GoogleHit[]> {
  const started = Date.now();
  while (Date.now() - started < 12_000) {
    const state = await pageState(tab);
    if (state === "captcha") return [];
    if (state === "ready") return acceptBlocks(tab, browser, accept);
    await sleep(350);
  }
  return [];
}

async function acceptBlocks(tab: Cdp, browser: Cdp, accept: (text: string) => boolean): Promise<GoogleHit[]> {
  const blocks = await extract(tab);
  const hits: GoogleHit[] = [];
  let resolved = 0;
  for (const block of blocks) {
    const snippet = block.text || block.title;
    if (!accept(`${block.title} ${snippet}`)) continue;
    let url = block.url;
    if (!url && block.goto && resolved < 5) {
      url = (await openGoto(browser, block.goto)) ?? "";
      resolved += 1;
    }
    if (!url) continue;
    const image = block.image?.startsWith("https://") ? block.image : undefined;
    hits.push({ url, title: block.title, snippet, image });
  }
  return hits;
}

function mergeHits(first: GoogleHit[], second: GoogleHit[]): GoogleHit[] {
  const seen = new Set(first.map((hit) => hit.url));
  const merged = [...first];
  for (const hit of second) {
    if (seen.has(hit.url)) continue;
    seen.add(hit.url);
    merged.push(hit);
  }
  return merged;
}

async function extract(tab: Cdp): Promise<Block[]> {
  const raw = await tab.send("Runtime.evaluate", { expression: EXTRACT, returnByValue: true });
  const value = raw.result?.value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as Block[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function openGoto(browser: Cdp, url: string): Promise<string | null> {
  const created = await browser.send("Target.createTarget", { url });
  const targetId = created.targetId;
  if (!targetId) return null;
  try {
    const started = Date.now();
    while (Date.now() - started < 4_000) {
      const targets = await browser.send("Target.getTargets");
      const match = targetInfos(targets).find((entry) => entry.targetId === targetId);
      const landing = match?.url ? publicLanding(match.url) : null;
      if (landing) return landing;
      await sleep(400);
    }
    return null;
  } finally {
    await browser.send("Target.closeTarget", { targetId }).catch(() => undefined);
  }
}

function targetInfos(payload: CdpResult): Array<{ targetId?: string; url?: string }> {
  const infos = payload.targetInfos;
  return Array.isArray(infos) ? infos : [];
}

function publicLanding(href: string): string | null {
  if (!href || href.startsWith("about:") || href.startsWith("chrome:") || href.startsWith("devtools:")) return null;
  try {
    const url = new URL(href);
    if (url.hostname.includes("google.") && url.pathname.startsWith("/goto")) return null;
    const redirect = url.searchParams.get("sessionRedirect");
    if (redirect && /^https?:\/\//i.test(redirect)) return redirect;
    if (url.hostname.includes("google.")) return null;
    if (url.pathname === "/authwall" || /login|checkpoint|authwall/i.test(url.pathname)) {
      return redirectTarget(url);
    }
    return url.toString();
  } catch {
    return null;
  }
}

function redirectTarget(url: URL): string | null {
  const redirect = url.searchParams.get("sessionRedirect");
  return redirect && /^https?:\/\//i.test(redirect) ? redirect : null;
}

async function pageState(tab: Cdp): Promise<"captcha" | "ready" | "wait"> {
  const text = await tab.send("Runtime.evaluate", {
    expression: `(() => {
      const button = [...document.querySelectorAll("button")].find((el) => /alle akzeptieren|accept all|ich stimme zu/i.test(el.innerText || ""));
      if (button) { button.click(); return "consent"; }
      return document.body ? document.body.innerText.slice(0, 500) : "";
    })()`,
    returnByValue: true,
  });
  const body = String(text.result?.value ?? "");
  if (body === "consent") return "wait";
  if (/ungewöhnlichen Datenverkehr|unusual traffic|Our systems have detected|captcha-form|enablejs/i.test(body)) return "captcha";
  const count = await tab.send("Runtime.evaluate", {
    expression: `document.querySelectorAll("h3").length`,
    returnByValue: true,
  });
  return Number(count.result?.value) > 0 ? "ready" : "wait";
}

function findChrome(): string | null {
  const candidates = [
    process.env.CHROME_PATH,
    "/opt/google/chrome/chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) ?? null;
}

function chromeDisplay(): string | undefined {
  if (process.env.DISPLAY) return process.env.DISPLAY;
  if (fs.existsSync("/tmp/.X11-unix/X1")) return ":1";
  if (fs.existsSync("/tmp/.X11-unix/X0")) return ":0";
  return undefined;
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

async function waitForJson<T>(url: string, timeoutMs = 10_000): Promise<T> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return (await response.json()) as T;
    } catch {
      /* chrome is still starting */
    }
    await sleep(200);
  }
  throw new Error("leer");
}

async function pageSocket(port: number): Promise<string | null> {
  try {
    const list = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1000) }).then(
      (response) => response.json() as Promise<Target[]>,
    );
    const pages = list.filter((entry) => entry.type === "page" && entry.webSocketDebuggerUrl);
    const search = pages.find((entry) => (entry.url ?? "").includes("google.") && (entry.url ?? "").includes("/search"));
    return (search ?? pages[0])?.webSocketDebuggerUrl ?? null;
  } catch {
    return null;
  }
}

async function connectPage(port: number): Promise<Cdp | null> {
  const socket = await pageSocket(port);
  return socket ? connectCdp(socket) : null;
}

type CdpResult = {
  result?: { value?: unknown };
  targetId?: string;
  targetInfos?: Array<{ targetId?: string; url?: string }>;
};

type Cdp = {
  send: (method: string, params?: Record<string, unknown>) => Promise<CdpResult>;
  close: () => void;
};

function connectCdp(url: string): Promise<Cdp> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let next = 0;
    const pending = new Map<number, { resolve: (value: CdpResult) => void; reject: (error: Error) => void }>();
    const timer = setTimeout(() => reject(new Error("leer")), 8_000);
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(String(event.data)) as { id?: number; result?: CdpResult; error?: { message?: string } };
      if (!data.id || !pending.has(data.id)) return;
      const waiter = pending.get(data.id);
      pending.delete(data.id);
      if (!waiter) return;
      if (data.error) waiter.reject(new Error(data.error.message || "leer"));
      else waiter.resolve(data.result ?? {});
    });
    ws.addEventListener("open", () => {
      clearTimeout(timer);
      resolve({
        send(method, params) {
          const id = ++next;
          return new Promise((resolveSend, rejectSend) => {
            const timer = setTimeout(() => {
              if (!pending.has(id)) return;
              pending.delete(id);
              rejectSend(new Error("leer"));
            }, 8_000);
            pending.set(id, {
              resolve: (value) => {
                clearTimeout(timer);
                resolveSend(value);
              },
              reject: (error) => {
                clearTimeout(timer);
                rejectSend(error);
              },
            });
            ws.send(JSON.stringify({ id, method, params }));
          });
        },
        close() {
          ws.close();
        },
      });
    });
    ws.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("leer"));
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
