import "server-only";
import { cache } from "react";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL fehlt. Trag die Datenbank-Adresse in .env.local ein.");
  // prepare: false, weil der Supabase-Pooler im Transaktionsmodus keine vorbereiteten Abfragen hält.
  const client = postgres(url, { prepare: false, max: onWorkers() ? 1 : 5 });
  return drizzle(client, { schema });
}

/** Cloudflare Workers erlauben keine Verbindung über mehrere Anfragen hinweg. */
function onWorkers(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

type Db = ReturnType<typeof connect>;
const globalForDb = globalThis as unknown as { myvitaDb?: Db };

const perRequest = cache(connect);

export function db(): Db {
  if (onWorkers()) return perRequest();
  globalForDb.myvitaDb ??= connect();
  return globalForDb.myvitaDb;
}

export { schema };
