import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db()
    .select({ contentType: schema.media.contentType, data: schema.media.data })
    .from(schema.media)
    .where(eq(schema.media.id, id));
  if (!row) return new Response("Nicht gefunden", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.contentType,
      // Jede neue Datei bekommt eine neue ID, daher darf der Browser lange zwischenspeichern.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
