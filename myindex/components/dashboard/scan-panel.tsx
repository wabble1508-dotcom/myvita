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
  found?: number;
  sources?: string[];
  failures?: string[];
  error?: string;
};

export function ScanPanel({ fullName }: { fullName: string; email: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "error">("ok");

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/osint/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
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
      const found = body.found ?? 0;
      const sources = (body.sources ?? []).slice(0, 6).join(", ");
      const sourceNote = sources ? ` Quellen: ${sources}.` : "";
      const failureNote = body.failures && body.failures.length > 0 ? " Einige Quellen haben nicht geantwortet." : "";
      setTone("ok");
      setMessage(
        created === 0
          ? found === 0
            ? `Zu diesem Namen lag in den abgefragten öffentlichen Quellen nichts.${sourceNote}${failureNote}`
            : `Keine neuen Seiten. ${found} Treffer lagen schon in der Sammlung oder gehören nicht hinein.${sourceNote}${failureNote}`
          : `${created} ${created === 1 ? "öffentliche Seite" : "öffentliche Seiten"} gespeichert. ${found} Treffer gelesen${skipped ? `, ${skipped} waren schon da oder gehören nicht in die Sammlung` : ""}.${sourceNote}${failureNote}`,
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
      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        <ScanSearch className="size-4" />
        Noch einmal suchen
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Sucht für {fullName} noch einmal in Social Media, Zeitungen, Nachrichten und den übrigen öffentlichen Quellen. Die ID bleibt gleich.
      </p>
      <form
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          mutation.mutate();
        }}
      >
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Suche läuft…" : "Diese Person noch einmal suchen"}
        </Button>
      </form>
      {message ? (
        <p
          className={tone === "error" ? "mt-4 text-sm text-rose-100" : "mt-4 text-sm text-accent"}
          role={tone === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </Card>
  );
}
