import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { FollowButton } from "@/components/vita/follow-button";
import { VitaView } from "@/components/vita/vita-view";
import { getViewer } from "@/lib/auth/session";
import { isFollowing, loadVita, profileByHandle } from "@/lib/vita/queries";

type Props = { params: Promise<{ handle: string }> };

async function visibleProfile(raw: string) {
  const handle = decodeURIComponent(raw).replace(/^@/, "").toLowerCase();
  const [profile, viewer] = await Promise.all([profileByHandle(handle), getViewer()]);
  if (!profile) return null;
  const own = viewer?.id === profile.userId;
  if (!profile.searchable && !own) return null;
  return { profile, viewer, own };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await visibleProfile((await params).handle);
  if (!found) return { title: "Nicht gefunden" };
  const { profile } = found;
  return {
    title: `${profile.displayName} (@${profile.handle})`,
    description: profile.headline || `Die Vita von ${profile.displayName} auf MyVita.`,
    robots: profile.searchable ? undefined : { index: false },
  };
}

export default async function ProfilePage({ params }: Props) {
  const found = await visibleProfile((await params).handle);
  if (!found) notFound();
  const { profile, viewer, own } = found;
  const vita = await loadVita(profile, "public");
  const following = viewer && !own ? await isFollowing(viewer.id, profile.userId) : false;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {own ? (
          <p className="mb-4 rounded-2xl border border-accent-soft/20 bg-accent/10 px-4 py-3 text-sm text-accent-soft">
            So sehen andere deine Vita. Private Einträge und Einträge nur für Bewerbungslinks sind hier ausgeblendet.
            {profile.searchable ? null : " Dein Profil ist gerade nicht auffindbar, nur du siehst diese Seite."}
          </p>
        ) : null}
        <VitaView
          vita={vita}
          actions={
            own ? (
              <Link href="/profil" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                <Pencil className="size-3.5" /> Bearbeiten
              </Link>
            ) : (
              <FollowButton handle={profile.handle} following={following} signedIn={Boolean(viewer)} />
            )
          }
        />
      </main>
    </>
  );
}
