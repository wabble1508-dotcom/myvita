import "server-only";

// Nur Web Crypto, damit dasselbe auf Node und auf Cloudflare Workers läuft.
const encoder = new TextEncoder();

/** Workers erlauben höchstens 100 000 PBKDF2-Runden. */
const ITERATIONS = 100_000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function randomToken(bytes = 32): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export function newId(): string {
  return randomToken(12);
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toBase64Url(new Uint8Array(digest));
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, rounds, salt, expected] = stored.split("$");
  if (scheme !== "pbkdf2" || !rounds || !salt || !expected) return false;
  const actual = await derive(password, fromBase64Url(salt), Number(rounds));
  const wanted = fromBase64Url(expected);
  if (actual.length !== wanted.length) return false;
  let diff = 0;
  for (let index = 0; index < actual.length; index += 1) diff |= actual[index]! ^ wanted[index]!;
  return diff === 0;
}

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** MyVita-ID wie MV-7F3A9C2E. */
export function newPublicId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let body = "";
  for (const byte of bytes) body += ID_ALPHABET[byte % ID_ALPHABET.length];
  return `MV-${body}`;
}
