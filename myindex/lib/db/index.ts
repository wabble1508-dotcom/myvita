import "server-only";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Datenbank dieser Anfrage: Cloudflare D1 über die Bindung `DB` (siehe wrangler.jsonc).
 * Beim lokalen Entwickeln stellt wrangler eine lokale D1 bereit.
 */
export const db = cache(() => drizzle(getCloudflareContext().env.DB, { schema }));

export { schema };
