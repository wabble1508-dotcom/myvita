import { eq } from "drizzle-orm";
import { PageTitle } from "@/components/editor/shared";
import { SelfSearch } from "@/components/editor/self-search";
import { requireViewer } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

export default async function ImportPage() {
  const viewer = await requireViewer();
  const links = await db().select({ url: schema.links.url }).from(schema.links).where(eq(schema.links.userId, viewer.id));
  return (
    <>
      <PageTitle
        title="Mich im Netz finden"
        text="MyVita sucht bei Google, in Social Media, Videos und Nachrichten nach deinem Namen. Was zu dir gehört, übernimmst du mit einem Klick in deine Kanäle. Nichts wird ohne deinen Klick gespeichert."
      />
      <SelfSearch name={viewer.displayName} known={links.map((link) => link.url)} />
    </>
  );
}
