import Link from "next/link";
import { Search } from "lucide-react";
import { Brand } from "@/components/site/brand";
import { buttonVariants } from "@/components/ui/button";
import { getViewer } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export async function SiteHeader({ query = "" }: { query?: string }) {
  const viewer = await getViewer();
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Brand />
        <form action="/suche" className="relative ml-2 hidden min-w-0 flex-1 sm:block sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Name, @Name oder MyVita-ID"
            aria-label="Mitglieder suchen"
            className="h-9 w-full rounded-full border border-white/10 bg-white/[0.04] pr-3 pl-9 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent-soft/60"
          />
        </form>
        <nav className="ml-auto flex items-center gap-2">
          <Link href="/suche" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "sm:hidden")} aria-label="Suche">
            <Search className="size-4" />
          </Link>
          {viewer ? (
            <Link href="/profil" className={buttonVariants({ variant: "primary", size: "sm" })}>
              Mein Profil
            </Link>
          ) : (
            <>
              <Link href="/anmelden" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Anmelden
              </Link>
              <Link href="/registrieren" className={buttonVariants({ variant: "primary", size: "sm" })}>
                Registrieren
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
