import { defineConfig } from "drizzle-kit";

// Nur zum Erzeugen der Migrationen. Eingespielt werden sie mit wrangler (npm run db:migrate:local / db:migrate:remote).
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
});
