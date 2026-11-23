import { notFound, redirect } from "next/navigation";
import { profileByPublicId } from "@/lib/vita/queries";

/** Kurzadresse über die MyVita-ID, z. B. /id/MV-7F3A9C2E. */
export default async function PublicIdPage({ params }: { params: Promise<{ publicId: string }> }) {
  const raw = decodeURIComponent((await params).publicId).toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^MV/, "");
  const profile = raw.length === 8 ? await profileByPublicId(`MV-${raw}`) : null;
  if (!profile?.searchable) notFound();
  redirect(`/@${profile.handle}`);
}
