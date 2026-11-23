import { asc, eq } from "drizzle-orm";
import { AddLinkForm, LinkList } from "@/components/editor/links-editor";
import { PageTitle } from "@/components/editor/shared";
import { requireViewer } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

export default async function LinksPage() {
  const viewer = await requireViewer();
  const links = await db()
    .select()
    .from(schema.links)
    .where(eq(schema.links.userId, viewer.id))
    .orderBy(asc(schema.links.position), asc(schema.links.createdAt));
  return (
    <>
      <PageTitle
        title="Kanäle"
        text="Instagram, LinkedIn, YouTube, TikTok, GitHub, deine Website: alles an einem Ort. MyVita erkennt die Plattform an der Adresse."
      />
      <div className="space-y-6">
        <AddLinkForm />
        <LinkList links={links} />
      </div>
    </>
  );
}
