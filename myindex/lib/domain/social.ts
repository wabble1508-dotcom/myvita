/** Erkennt aus einer Adresse die Plattform, damit Links mit passendem Zeichen und Namen erscheinen. */
export type SocialPlatform = {
  id: string;
  name: string;
  /** Farbe der Kachel. */
  color: string;
};

const PLATFORMS: { hosts: string[]; platform: SocialPlatform }[] = [
  { hosts: ["instagram.com"], platform: { id: "instagram", name: "Instagram", color: "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)" } },
  { hosts: ["linkedin.com"], platform: { id: "linkedin", name: "LinkedIn", color: "#0a66c2" } },
  { hosts: ["youtube.com", "youtu.be"], platform: { id: "youtube", name: "YouTube", color: "#ff0033" } },
  { hosts: ["tiktok.com"], platform: { id: "tiktok", name: "TikTok", color: "#111111" } },
  { hosts: ["github.com"], platform: { id: "github", name: "GitHub", color: "#24292f" } },
  { hosts: ["x.com", "twitter.com"], platform: { id: "x", name: "X", color: "#000000" } },
  { hosts: ["facebook.com", "fb.com"], platform: { id: "facebook", name: "Facebook", color: "#1877f2" } },
  { hosts: ["xing.com"], platform: { id: "xing", name: "XING", color: "#006567" } },
  { hosts: ["twitch.tv"], platform: { id: "twitch", name: "Twitch", color: "#9146ff" } },
  { hosts: ["behance.net"], platform: { id: "behance", name: "Behance", color: "#1769ff" } },
  { hosts: ["dribbble.com"], platform: { id: "dribbble", name: "Dribbble", color: "#ea4c89" } },
  { hosts: ["spotify.com"], platform: { id: "spotify", name: "Spotify", color: "#1db954" } },
  { hosts: ["soundcloud.com"], platform: { id: "soundcloud", name: "SoundCloud", color: "#ff5500" } },
  { hosts: ["threads.net", "threads.com"], platform: { id: "threads", name: "Threads", color: "#000000" } },
  { hosts: ["pinterest.com", "pinterest.de"], platform: { id: "pinterest", name: "Pinterest", color: "#e60023" } },
  { hosts: ["snapchat.com"], platform: { id: "snapchat", name: "Snapchat", color: "#fffc00" } },
];

const WEBSITE: SocialPlatform = { id: "website", name: "Website", color: "#2f6bff" };

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function platformFor(url: string): SocialPlatform {
  const host = hostOf(url);
  for (const entry of PLATFORMS) {
    if (entry.hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`))) return entry.platform;
  }
  return WEBSITE;
}

/** Ergänzt https:// und prüft, dass es eine Web-Adresse ist. Null bei Unsinn. */
export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Kurzer Text für die Anzeige: Nutzername aus dem Pfad oder die Domain. */
export function linkCaption(url: string): string {
  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.split("/").filter(Boolean).filter((part) => !["in", "channel", "c", "user"].includes(part))[0];
    const host = parsed.hostname.replace(/^www\./, "");
    if (platformFor(url).id !== "website" && segment) return segment.startsWith("@") ? segment : `@${segment}`;
    return host + (parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, ""));
  } catch {
    return url;
  }
}
