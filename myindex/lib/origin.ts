import "server-only";
import { headers } from "next/headers";

/**
 * Öffentliche Adresse der App, z. B. https://myvita.example.workers.dev.
 * APP_URL hat Vorrang (eigene Domain); sonst gilt die Adresse, unter der die Anfrage kam.
 */
export async function appOrigin(): Promise<string> {
  const configured = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  const proto = list.get("x-forwarded-proto") ?? (local ? "http" : "https");
  return `${proto}://${host}`;
}
