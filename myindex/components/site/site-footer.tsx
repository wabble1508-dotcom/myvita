import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-zinc-500 sm:px-6">
        <p>© {new Date().getFullYear()} MyVita</p>
        <nav className="flex gap-4">
          <Link href="/suche" className="hover:text-zinc-300">Mitglieder</Link>
          <Link href="/impressum" className="hover:text-zinc-300">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-zinc-300">Datenschutz</Link>
        </nav>
      </div>
    </footer>
  );
}
