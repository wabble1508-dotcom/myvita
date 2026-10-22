"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPersonAction } from "@/lib/actions/footprint";
import { Button } from "@/components/ui/button";

type ScanResponse = {
  createdCount?: number;
  error?: string;
};

export function EnrollPerson() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setStatus(null);
        setPending(true);
        void enroll(name, {
          onStatus: setStatus,
          onError: (message) => {
            setError(message);
            setPending(false);
          },
          onDone: (created) => {
            setName("");
            setPending(false);
            setStatus(
              created === 0
                ? "Person ist angelegt. In den abgefragten Quellen lag noch nichts Neues."
                : `${created} öffentliche Seiten liegen jetzt in den Rubriken.`,
            );
            router.push("/dashboard");
            router.refresh();
          },
        });
      }}
    >
      <label className="block">
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Person eintragen</span>
        <span className="mt-2 block text-sm leading-6 text-slate-400">
          Ein Name, eine eigene ID. Danach sucht MyVita in Social Media, Bildern, Videos, Zeitungen und Nachrichten.
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Vor- und Nachname"
          autoComplete="name"
          required
          className="mt-4 h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-3 text-base text-slate-50 outline-none placeholder:text-slate-500 focus:border-accent/70"
        />
      </label>
      <Button type="submit" className="mt-3" disabled={pending}>
        {pending ? "Suche läuft…" : "Eintragen und suchen"}
      </Button>
      {status ? <p className="mt-3 text-sm text-accent">{status}</p> : null}
      {error ? (
        <p className="mt-3 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

async function enroll(
  name: string,
  handlers: {
    onStatus: (status: string) => void;
    onError: (message: string) => void;
    onDone: (created: number) => void;
  },
) {
  handlers.onStatus("Person wird angelegt…");
  const created = await createPersonAction(name);
  if (!created.ok) {
    handlers.onError(created.error);
    return;
  }

  handlers.onStatus("Suche in Social Media, Nachrichten und weiteren Quellen…");
  try {
    const response = await fetch("/api/osint/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name.trim() }),
    });
    let body: ScanResponse = {};
    try {
      body = (await response.json()) as ScanResponse;
    } catch {
      handlers.onError("Die Suche hat eine unlesbare Antwort geliefert.");
      return;
    }
    if (!response.ok) {
      handlers.onError(body.error ?? "Die Suche ist fehlgeschlagen. Die Person ist angelegt.");
      return;
    }
    handlers.onDone(body.createdCount ?? 0);
  } catch {
    handlers.onError("Die Suche hat die Quellen nicht erreicht. Die Person ist angelegt.");
  }
}
