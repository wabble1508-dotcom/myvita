import { headers } from "next/headers";
import { PageTitle } from "@/components/editor/shared";
import { ShareForm, ShareList } from "@/components/editor/share-editor";
import { requireViewer } from "@/lib/auth/session";
import { shareLinksOf } from "@/lib/vita/queries";

export default async function SharePage() {
  const viewer = await requireViewer();
  const now = new Date();
  const links = (await shareLinksOf(viewer.id)).map((link) => ({ ...link, expired: link.expiresAt < now }));
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const proto = list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = process.env.APP_URL?.replace(/\/$/, "") || `${proto}://${host}`;

  return (
    <>
      <PageTitle
        title="Bewerbungslinks"
        text="Ein privater Link zu deiner Vita für eine Bewerbung. Er zeigt zusätzlich alles, was du auf „Nur Bewerbungslinks“ gestellt hast, und läuft von selbst ab. Du siehst, wie oft er geöffnet wurde."
      />
      <div className="space-y-6">
        <ShareForm />
        <ShareList links={links} origin={origin} />
      </div>
    </>
  );
}
