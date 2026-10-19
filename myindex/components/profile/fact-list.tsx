import type { DisplayFact } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function FactList({ facts, tone = "dark" }: { facts: DisplayFact[]; tone?: "dark" | "light" }) {
  if (facts.length === 0) return null;
  const light = tone === "light";

  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {facts.map((fact, index) => (
        <div
          key={`${fact.label}-${index}`}
          className={cn("rounded-xl px-3 py-2.5", light ? "bg-stone-50 ring-1 ring-stone-200" : "bg-black/25 ring-1 ring-white/10")}
        >
          <dt className={cn("text-[11px] font-medium uppercase tracking-wide", light ? "text-stone-500" : "text-slate-500")}>
            {fact.label}
          </dt>
          <dd className={cn("mt-1 text-sm leading-5", light ? "text-stone-950" : "text-white")}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
