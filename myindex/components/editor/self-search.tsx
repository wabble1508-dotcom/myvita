"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import { PlatformIcon } from "@/components/vita/platform-icon";
import { addLink } from "@/lib/vita/actions";
import { findMyself, type SelfHit } from "@/lib/vita/self-search";

export function SelfSearch({ name, known }: { name: string; known: string[] }) {
  const [pending, start] = useTransition();
  const [hits, setHits] = useState<SelfHit[] | null>(null);
  const [error, setError] = useState<string>();
  const [added, setAdded] = useState<Set<string>>(() => new Set(known));

  const run = () =>
    start(async () => {
      setError(undefined);
      const result = await findMyself();
      if (result.ok) setHits(result.hits);
      else setError(result.error);
    });

  const take = (hit: SelfHit) =>
    start(async () => {
      const form = new FormData();
      form.set("url", hit.url);
      form.set("visibility", "public");
      const result = await addLink(undefined, form);
      if (result?.error) setError(result.error);
      else setAdded((current) => new Set(current).add(hit.url));
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-300">
            Gesucht wird nach: <span className="font-medium text-white">{name}</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">Den Namen änderst du unter „Profil“. Nach anderen Personen lässt sich hier nicht suchen.</p>
        </div>
        <Button onClick={run} disabled={pending}>
          <Search className="size-4" /> {pending && !hits ? "Suche läuft …" : "Mich im Netz suchen"}
        </Button>
      </div>
      <FormMessage error={error} />
      {hits ? (
        hits.length ? (
          <ul className="space-y-2">
            {hits.map((hit) => {
              const done = added.has(hit.url);
              return (
                <li key={hit.url} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <PlatformIcon url={hit.url} />
                  <div className="min-w-0 flex-1">
                    <a href={hit.url} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium text-white hover:underline">
                      {hit.title}
                    </a>
                    <p className="truncate text-xs text-zinc-400">{hit.host}</p>
                  </div>
                  <Button size="sm" variant={done ? "ghost" : "primary"} disabled={done || pending} onClick={() => take(hit)}>
                    {done ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                    {done ? "Übernommen" : "Zu meinen Kanälen"}
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">Nichts gefunden.</p>
        )
      ) : null}
    </div>
  );
}
