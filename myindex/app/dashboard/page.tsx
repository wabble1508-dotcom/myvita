import { CategorySummary } from "@/components/dashboard/category-summary";
import { FindingsFeed } from "@/components/dashboard/findings-feed";
import { HealthScoreCard } from "@/components/dashboard/health-score";
import { PersonBar } from "@/components/dashboard/person-bar";
import { ScanPanel } from "@/components/dashboard/scan-panel";
import { getDashboard } from "@/lib/services/profile";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const data = getDashboard();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-200">Personenansicht</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{data.user.fullName}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{data.profile.headline}</p>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-400">
          {data.items.length} gespeicherte Seiten, {data.health.score} von 100. Leere Rubriken bleiben leer.
        </p>
      </header>
      <PersonBar people={data.people} publicId={data.profile.publicId} />
      <CategorySummary counts={data.counts} />
      <FindingsFeed items={data.items} />
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <HealthScoreCard user={data.user} profile={data.profile} health={data.health} />
        <ScanPanel key={data.profile.publicId} fullName={data.user.fullName} email={data.user.email} />
      </section>
    </div>
  );
}
