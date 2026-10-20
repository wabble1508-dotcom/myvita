"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { createPersonAction, switchPersonAction } from "@/lib/actions/footprint";
import type { PersonSummary } from "@/lib/domain/types";
import { IdLookup } from "@/components/identity/id-lookup";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PersonBar({ people, publicId }: { people: PersonSummary[]; publicId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const duplicated = duplicatedNames(people);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal-200">Personen-ID</p>
          <p className="mt-2 font-mono text-2xl tracking-wide text-white">{publicId}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Der Abruf läuft über diese ID. Derselbe Name kann bei einer anderen Person noch einmal vorkommen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyIdLink publicId={publicId} />
          <Link href={`/id/${publicId}`} className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
            Abrufseite
          </Link>
        </div>
      </div>
      <ul className="mt-5 flex flex-wrap gap-2">
        {people.map((person) => (
          <li key={person.publicId}>
            <button
              type="button"
              disabled={pending}
              aria-current={person.active ? "true" : undefined}
              onClick={() => {
                if (person.active) return;
                setError(null);
                setMessage(null);
                startTransition(async () => {
                  const result = await switchPersonAction(person.publicId);
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  router.refresh();
                });
              }}
              className={cn(
                "min-w-44 rounded-2xl border px-3 py-2 text-left transition disabled:opacity-50",
                person.active ? "border-teal-200/50 bg-teal-200/10" : "border-white/10 bg-black/20 hover:bg-white/5",
              )}
            >
              <span className="block truncate text-sm text-white">{person.fullName}</span>
              <span className="mt-1 block font-mono text-xs text-teal-100">{person.publicId}</span>
              {duplicated.has(person.fullName.trim().toLocaleLowerCase("de")) ? (
                <span className="mt-1 block text-[11px] text-slate-400">Gleicher Name, andere ID</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            setMessage(null);
            startTransition(async () => {
              const result = await createPersonAction(name);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setName("");
              setMessage(`Neue ID ${result.data.publicId}. Der Name darf schon vorkommen.`);
              router.refresh();
            });
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Weitere Person</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name, auch wenn er schon vorkommt"
              autoComplete="name"
              className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-3 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-200/60"
            />
          </label>
          <Button type="submit" variant="ghost" disabled={pending}>
            {pending ? "Legt an…" : "Eigene ID anlegen"}
          </Button>
        </form>
        <IdLookup />
      </div>
      {message ? <p className="mt-3 text-sm text-teal-100">{message}</p> : null}
      {error ? (
        <p className="mt-3 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}

function CopyIdLink({ publicId }: { publicId: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(`${window.location.origin}/id/${publicId}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Kopiert" : "Adresse kopieren"}
    </Button>
  );
}

function duplicatedNames(people: PersonSummary[]): Set<string> {
  const counts = new Map<string, number>();
  for (const person of people) {
    const key = person.fullName.trim().toLocaleLowerCase("de");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key));
}
