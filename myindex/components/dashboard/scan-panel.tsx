"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ScanResponse = {
  createdCount?: number;
  skipped?: number;
  error?: string;
};

export function ScanPanel({ fullName, email }: { fullName: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [mail, setMail] = useState(email);
  const [handle, setHandle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "error">("ok");

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/osint/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email: mail, handle }),
      });
      let body: ScanResponse = {};
      try {
        body = (await response.json()) as ScanResponse;
      } catch {
        throw new Error("Die Suche hat eine unlesbare Antwort geliefert.");
      }
      if (!response.ok) throw new Error(body.error ?? "Die Suche ist fehlgeschlagen.");
      return body;
    },
    onSuccess: (body) => {
      const created = body.createdCount ?? 0;
      const skipped = body.skipped ?? 0;
      setTone("ok");
      setMessage(
        created === 0
          ? "Keine neuen Funde. Passende Beispielquellen liegen schon in der Sammlung."
          : `${created} ${created === 1 ? "simulierten Fund" : "simulierte Funde"} einsortiert${skipped ? `, ${skipped} waren schon da oder gehören nicht in die Sammlung` : ""}. Gespeichert wird nur, was öffentlich gefunden werden soll.`,
      );
      router.refresh();
    },
    onError: (error: Error) => {
      setTone("error");
      setMessage(error.message);
    },
  });

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-center gap-2 text-sm font-medium text-teal-100">
        <ScanSearch className="size-4" />
        Simulierte Spurensuche
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Die Suche gilt für die geöffnete Person. Ihre ID bleibt gleich, auch wenn der Name sich ändert. Eine weitere Person mit demselben Namen braucht eine eigene ID. Es geht noch nichts ins Netz.
      </p>
      <form
        className="mt-5 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          mutation.mutate();
        }}
      >
        <Field label="Voller Name" value={name} onChange={setName} autoComplete="name" />
        <Field label="E-Mail, optional" value={mail} onChange={setMail} type="email" autoComplete="email" />
        <Field label="Handle, optional" value={handle} onChange={setHandle} placeholder="@du" autoComplete="username" />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Suche läuft…" : "Spuren sammeln"}
        </Button>
      </form>
      {message ? (
        <p
          className={tone === "error" ? "mt-4 text-sm text-rose-100" : "mt-4 text-sm text-teal-100"}
          role={tone === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <input
        value={value}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-3 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-200/60"
      />
    </label>
  );
}
