import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Brand } from "@/components/site/brand";
import { VitaView } from "@/components/vita/vita-view";
import { loadVita, openShareLink } from "@/lib/vita/queries";

export const metadata: Metadata = { title: "Bewerbung", robots: { index: false, follow: false } };

/** Bewerbungslink: zeigt zusätzlich Einträge, die nur für Empfänger solcher Links freigegeben sind. */
export default async function ApplicationPage({ params }: { params: Promise<{ token: string }> }) {
  const opened = await openShareLink((await params).token);
  if (!opened) notFound();
  const vita = await loadVita(opened.profile, "link");
  const until = opened.link.expiresAt.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Brand />
        <p className="text-xs text-zinc-500">
          {opened.link.label ? `${opened.link.label} · ` : ""}Link gültig bis {until}
        </p>
      </div>
      <VitaView vita={vita} />
    </main>
  );
}
