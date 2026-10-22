"use client";

import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/domain/categories";
import type { FootprintCategory } from "@/lib/domain/types";
import { useFootprintFilter } from "@/lib/stores/use-footprint-filter";
import { cn } from "@/lib/utils";

export function CategorySummary({ counts }: { counts: Record<FootprintCategory, number> }) {
  const active = useFootprintFilter((state) => state.category);
  const toggleCategory = useFootprintFilter((state) => state.toggleCategory);

  return (
    <section aria-label="Spuren nach Rubrik" className="flex flex-wrap gap-2">
      {CATEGORY_ORDER.map((category) => {
        const meta = CATEGORY_META[category];
        const selected = active === category;
        const count = counts[category];
        return (
          <button
            key={category}
            type="button"
            onClick={() => toggleCategory(category)}
            aria-pressed={selected}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
              selected
                ? "border-accent/60 bg-accent text-slate-950"
                : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/20",
              count === 0 && !selected && "text-slate-500",
            )}
          >
            {meta.label}
            <span className={cn("text-xs", selected ? "text-slate-700" : "text-slate-500")}>
              {count === 0 ? "leer" : count}
            </span>
          </button>
        );
      })}
    </section>
  );
}
