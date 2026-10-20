"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_PUBLIC_ID, normalizePublicId } from "@/lib/domain/public-id";
import { Button } from "@/components/ui/button";

export function IdLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        const id = normalizePublicId(value);
        if (!id) {
          setError(`Die ID hat die Form MV- und acht Zeichen, zum Beispiel ${DEMO_PUBLIC_ID}.`);
          return;
        }
        setError(null);
        router.push(`/id/${id}`);
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Person über ID öffnen</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={DEMO_PUBLIC_ID}
          spellCheck={false}
          autoCapitalize="characters"
          className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-3 font-mono text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-200/60"
        />
      </label>
      <Button type="submit" variant="ghost">
        Abrufen
      </Button>
      {error ? (
        <p className="text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
