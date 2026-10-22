"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestDeletionAction, updateVisibilityAction } from "@/lib/actions/footprint";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/domain/categories";
import type { DisplayFact, ItemRecord, Visibility } from "@/lib/domain/types";
import { formatWhen, percent } from "@/lib/format";
import { useFootprintFilter } from "@/lib/stores/use-footprint-filter";
import { cn } from "@/lib/utils";
import { platformOf } from "@/lib/domain/platforms";
import { FactList } from "@/components/profile/fact-list";
import { PlatformFace } from "@/components/profile/platform-face";
import { factsWithoutImage, SourceImage } from "@/components/profile/source-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const VISIBILITY_OPTIONS: Array<{ value: Visibility; label: string }> = [
  { value: "PUBLIC", label: "Öffentlich" },
  { value: "SHARE_ONLY", label: "Teilen" },
  { value: "PRIVATE", label: "Privat" },
];

export function FindingsFeed({ items }: { items: ItemRecord[] }) {
  const router = useRouter();
  const category = useFootprintFilter((state) => state.category);
  const clear = useFootprintFilter((state) => state.clear);
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [visibilityOverride, setVisibilityOverride] = useState<Record<string, Visibility>>({});
  const [deletedIds, setDeletedIds] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const visibleItems = items.filter((item) => category === "ALL" || item.category === category);
  const groups = CATEGORY_ORDER.flatMap((entry) => {
    const groupItems = visibleItems.filter((item) => item.category === entry);
    return groupItems.length === 0 ? [] : [{ category: entry, items: groupItems }];
  });

  function changeVisibility(item: ItemRecord, visibility: Visibility) {
    setError(null);
    setPendingId(item.id);
    setVisibilityOverride((current) => ({ ...current, [item.id]: visibility }));
    startTransition(async () => {
      const result = await updateVisibilityAction(item.id, visibility);
      setPendingId(null);
      if (!result.ok) {
        setVisibilityOverride((current) => {
          const next = { ...current };
          delete next[item.id];
          return next;
        });
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function requestDeletion(item: ItemRecord) {
    setError(null);
    setPendingId(item.id);
    startTransition(async () => {
      const result = await requestDeletionAction(item.id);
      setPendingId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDeletedIds((current) => ({ ...current, [item.id]: new Date().toISOString() }));
      setVisibilityOverride((current) => ({ ...current, [item.id]: "PRIVATE" }));
      router.refresh();
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Was im Netz liegt</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            Die Seiten liegen nach Rubrik: Social Media, Nachrichten, Beruf und die übrigen öffentlichen Quellen. Jede Karte zeigt, was gespeichert ist.
          </p>
        </div>
        {category !== "ALL" ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            Alle zeigen
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="rounded-2xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
      {groups.length === 0 ? (
        <Card className="px-5 py-8 text-sm text-slate-400">
          {items.length === 0 ? "Trag oben einen Namen ein. Leere Rubriken bleiben leer." : "Dazu lag nichts im Netz."}
        </Card>
      ) : null}
      {groups.map((group) => {
          const meta = CATEGORY_META[group.category];
          const Icon = meta.icon;
          return (
            <div key={group.category} className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Icon className="size-4 text-slate-400" />
                {meta.plural}
                <span className="text-slate-500">{group.items.length}</span>
              </h3>
              <ul className="grid gap-4 xl:grid-cols-2">
                {group.items.map((item) => (
                  <FindingCard
                    key={item.id}
                    item={item}
                    visibility={visibilityFor(item, visibilityOverride)}
                    deletionRequestedAt={item.deletionRequestedAt ?? deletedIds[item.id] ?? null}
                    busy={pending && pendingId === item.id}
                    onVisibility={(visibility) => changeVisibility(item, visibility)}
                    onDelete={() => requestDeletion(item)}
                  />
                ))}
              </ul>
            </div>
          );
        })}
    </section>
  );
}

function FindingCard({
  item,
  visibility,
  deletionRequestedAt,
  busy,
  onVisibility,
  onDelete,
}: {
  item: ItemRecord;
  visibility: Visibility;
  deletionRequestedAt: string | null;
  busy: boolean;
  onVisibility: (visibility: Visibility) => void;
  onDelete: () => void;
}) {
  const meta = CATEGORY_META[item.category];
  const facts = shownFacts(item);
  const platform = platformOf(item.domain);
  const visual = item.facts.some((fact) => fact.label === "Bild");

  return (
    <li>
      <Card className={cn("flex h-full flex-col", platform || visual ? "overflow-hidden p-0" : "p-4 sm:p-5")}>
        <SourceImage facts={item.facts} alt={item.title} />
        {platform ? (
          <>
            <PlatformFace bare domain={item.domain} title={item.title} snippet={item.snippet} facts={facts} />
            <div className="space-y-3 p-4 pb-0">
              <FactList facts={facts} />
              <a href={item.sourceUrl} className="inline-block text-sm text-accent underline" target="_blank" rel="noreferrer">
                {item.sourceUrl}
              </a>
            </div>
          </>
        ) : (
          <div className={cn(visual && "p-4 pb-0 sm:p-5 sm:pb-0")}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={meta.badge}>{meta.label}</Badge>
              <span className="font-mono text-xs text-slate-500">{item.domain}</span>
              <span className="text-xs text-slate-500">{percent(item.confidenceScore)}</span>
              {item.isVerifiedByOwner ? <span className="text-xs text-accent">Geprüft</span> : null}
            </div>
            <h4 className="mt-3 text-base font-medium text-white">{item.title}</h4>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Was auf der Seite steht</p>
            <div className="mt-2">
              <FactList facts={facts} />
            </div>
            <a href={item.sourceUrl} className="mt-3 inline-block break-all text-sm text-accent underline" target="_blank" rel="noreferrer">
              {item.sourceUrl}
            </a>
          </div>
        )}
        <div className={cn("mt-auto flex flex-col gap-3 border-t border-white/10 sm:flex-row sm:items-center sm:justify-between", platform || visual ? "p-4" : "pt-4")}>
          <div role="group" aria-label={`Sichtbarkeit für ${item.title}`} className="flex rounded-full border border-white/10 bg-black/20 p-1">
            {VISIBILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={visibility === option.value}
                disabled={busy}
                onClick={() => onVisibility(option.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition disabled:opacity-50",
                  visibility === option.value ? "bg-white text-slate-950" : "text-slate-300 hover:text-white",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button variant="danger" size="sm" disabled={busy || deletionRequestedAt != null} onClick={onDelete}>
            {deletionRequestedAt ? "Löschung angefragt" : "DSGVO-Löschung anfragen"}
          </Button>
        </div>
        <p className={cn("text-xs text-slate-500", platform || visual ? "px-4 pb-4" : "mt-3")}>
          {platform ? (
            <>
              {item.domain}
              {item.isVerifiedByOwner ? " · Geprüft" : ""} · {percent(item.confidenceScore)} · {formatWhen(item.createdAt)}
            </>
          ) : (
            <>Hinzugefügt {formatWhen(item.createdAt)}</>
          )}
          {deletionRequestedAt ? ` · Löschung angefragt ${formatWhen(deletionRequestedAt)}` : ""}
        </p>
        {deletionRequestedAt ? (
          <p className={cn("text-xs leading-5 text-slate-400", platform ? "px-4 pb-4" : "mt-2")}>
            Lokal vermerkt und aus Freigaben ausgeblendet. Diese Version schreibt die Quelle nicht an.
          </p>
        ) : null}
      </Card>
    </li>
  );
}

function shownFacts(item: ItemRecord): DisplayFact[] {
  const facts = factsWithoutImage(item.facts?.length ? [...item.facts] : []);
  if (item.snippet && !facts.some((fact) => fact.value === item.snippet)) {
    facts.push({ label: "Text der Seite", value: item.snippet });
  }
  if (facts.length === 0) return [{ label: "Kurztext", value: item.title }];
  return facts;
}

function visibilityFor(item: ItemRecord, override: Record<string, Visibility>): Visibility {
  const next = override[item.id];
  return next && next !== item.visibility ? next : item.visibility;
}
