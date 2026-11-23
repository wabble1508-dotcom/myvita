import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { EditorNav } from "@/components/editor/editor-nav";
import { SiteHeader } from "@/components/site/site-header";
import { logout } from "@/lib/auth/actions";
import { requireViewer } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mein Profil", robots: { index: false, follow: false } };

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:py-10">
        <aside className="mb-6 md:mb-0">
          <div className="md:sticky md:top-6">
            <EditorNav handle={viewer.handle} />
            <form action={logout} className="mt-2 hidden md:block">
              <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-500 hover:bg-white/5 hover:text-zinc-200">
                <LogOut className="size-4" /> Abmelden
              </button>
            </form>
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </>
  );
}
