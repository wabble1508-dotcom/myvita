"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-3xl border border-rose-300/30 bg-rose-500/10 p-6">
      <h1 className="text-lg font-semibold text-white">Die Übersicht konnte nicht geladen werden</h1>
      <p className="mt-2 text-sm leading-6 text-rose-100">{error.message}</p>
      <Button className="mt-4" variant="ghost" onClick={reset}>
        Nochmal versuchen
      </Button>
    </div>
  );
}
