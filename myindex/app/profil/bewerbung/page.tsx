import { PageTitle } from "@/components/editor/shared";
import { ShareForm, ShareList } from "@/components/editor/share-editor";
import { requireViewer } from "@/lib/auth/session";
import { appOrigin } from "@/lib/origin";
import { shareLinksOf } from "@/lib/vita/queries";

export default async function SharePage() {
  const viewer = await requireViewer();
  const now = new Date();
  const links = (await shareLinksOf(viewer.id)).map((link) => ({ ...link, expired: link.expiresAt < now }));
  const origin = await appOrigin();

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
