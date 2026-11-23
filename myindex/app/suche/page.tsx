import type { Metadata } from "next";
import { Search } from "lucide-react";
import { MemberCard } from "@/components/site/member-card";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { searchMembers } from "@/lib/vita/queries";

export const metadata: Metadata = { title: "Mitglieder suchen" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 100) ?? "";
  const members = await searchMembers(query);

  return (
    <>
      <SiteHeader query={query} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-medium tracking-tight text-white">Mitglieder finden</h1>
        <form action="/suche" className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500" />
            <input
              name="q"
              defaultValue={query}
              autoFocus={!query}
              placeholder="Name, @Name, MyVita-ID, Fähigkeit oder Ort"
              aria-label="Suchbegriff"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pr-4 pl-10 text-base text-white placeholder:text-zinc-500 outline-none focus:border-accent-soft/60"
            />
          </div>
          <Button type="submit" className="h-12 px-5">
            Suchen
          </Button>
        </form>
        <p className="mt-6 mb-3 text-sm text-zinc-400">
          {query
            ? members.length
              ? `${members.length === 30 ? "Mehr als 30" : members.length} ${members.length === 1 ? "Treffer" : "Treffer"} für „${query}“`
              : `Niemand gefunden für „${query}“.`
            : "Zuletzt aktualisierte Profile"}
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {members.map((member) => (
            <li key={member.handle}>
              <MemberCard member={member} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
