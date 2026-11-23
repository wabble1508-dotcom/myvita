// Legt die Tabellen in der Datenbank an oder bringt sie auf den neuen Stand.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL fehlt.");
  process.exit(1);
}
const client = postgres(url, { max: 1, prepare: false });
await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
await client.end();
console.log("Datenbank ist auf dem neuen Stand.");
