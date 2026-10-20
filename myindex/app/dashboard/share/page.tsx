import type { Metadata } from "next";
import { ShareManager } from "@/components/dashboard/share-manager";
import { getShareDesk } from "@/lib/services/profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teilen",
};

export default function SharePage() {
  const data = getShareDesk();
  return <ShareManager user={data.user} profile={data.profile} links={data.linkViews} />;
}
