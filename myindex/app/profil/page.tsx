import { ProfileForm } from "@/components/editor/profile-form";
import { PageTitle } from "@/components/editor/shared";
import { requireViewer } from "@/lib/auth/session";
import { mediaUrl, profileByUserId } from "@/lib/vita/queries";

export default async function EditProfilePage({ searchParams }: { searchParams: Promise<{ neu?: string }> }) {
  const viewer = await requireViewer();
  const profile = await profileByUserId(viewer.id);
  if (!profile) throw new Error("Zu deinem Konto fehlt das Profil.");
  const welcome = (await searchParams).neu === "1";

  return (
    <>
      {welcome ? (
        <div className="mb-6 rounded-2xl border border-accent-soft/25 bg-accent/10 p-5">
          <p className="text-base font-medium text-white">Willkommen bei MyVita, {profile.displayName.split(" ")[0]}!</p>
          <p className="mt-1 text-sm leading-6 text-zinc-300">
            Deine MyVita-ID ist <span className="font-mono text-white">{profile.publicId}</span>. Füg ein Foto und eine Überschrift hinzu,
            dann deine Kanäle, Projekte und deinen Lebenslauf.
          </p>
        </div>
      ) : null}
      <PageTitle title="Profil" text="Das sehen andere oben auf deiner Vita." />
      <ProfileForm profile={profile} avatarUrl={mediaUrl(profile.avatarId)} />
    </>
  );
}
