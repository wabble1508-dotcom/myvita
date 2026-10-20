export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-4 w-80 animate-pulse rounded-full bg-white/5" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-8 w-24 animate-pulse rounded-full bg-white/5" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-3xl bg-white/5" />
        <div className="h-80 animate-pulse rounded-3xl bg-white/5" />
      </div>
    </div>
  );
}
