import { FactList } from "@/components/profile/fact-list";
import { PlatformFace } from "@/components/profile/platform-face";
import { CATEGORY_META } from "@/lib/domain/categories";
import { platformOf } from "@/lib/domain/platforms";
import type { PublicVita } from "@/lib/domain/types";
import { percent } from "@/lib/format";

export function ReleasedPages({
  sections,
  empty = "In dieser Ansicht sind keine Einträge enthalten.",
}: {
  sections: PublicVita["sections"];
  empty?: string;
}) {
  const profiles = sections.flatMap((section) => section.items.filter((item) => platformOf(item.domain)));
  const pages = sections.flatMap((section) =>
    section.items.filter((item) => !platformOf(item.domain)).map((item) => ({ ...item, category: section.category })),
  );

  if (profiles.length === 0 && pages.length === 0) {
    return <p className="mt-12 text-stone-600">{empty}</p>;
  }

  return (
    <div className="mt-12 space-y-12">
      {profiles.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">Profile</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {profiles.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
                <PlatformFace bare tone="light" domain={item.domain} title={item.title} snippet={item.snippet} facts={item.facts} />
                <div className="space-y-3 px-4 py-4">
                  <FactList tone="light" facts={shownFacts(item)} />
                  <a href={item.sourceUrl} className="inline-block break-all text-sm text-ink underline" target="_blank" rel="noreferrer">
                    {item.sourceUrl}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {pages.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">Weitere Seiten</h2>
          <ul className="mt-4 space-y-4">
            {pages.map((item) => (
              <li key={item.id} className="rounded-2xl bg-white px-5 py-5 ring-1 ring-stone-200">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <span className="text-xs text-stone-500">
                    {CATEGORY_META[item.category].label} · {percent(item.confidenceScore)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-stone-500">{item.domain}</p>
                <div className="mt-4">
                  <FactList tone="light" facts={shownFacts(item)} />
                </div>
                <a href={item.sourceUrl} className="mt-3 inline-block break-all text-sm text-ink underline" target="_blank" rel="noreferrer">
                  {item.sourceUrl}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function shownFacts(item: { title: string; snippet: string; facts: PublicVita["sections"][number]["items"][number]["facts"] }) {
  const facts = item.facts?.length ? [...item.facts] : [];
  if (item.snippet && !facts.some((fact) => fact.value === item.snippet)) {
    facts.push({ label: "Text der Seite", value: item.snippet });
  }
  if (facts.length === 0) return [{ label: "Kurztext", value: item.title }];
  return facts;
}
