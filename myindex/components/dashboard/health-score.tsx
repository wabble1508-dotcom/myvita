import { VERIFICATION_LABEL } from "@/lib/domain/categories";
import type { HealthReport, ProfileRecord, UserRecord } from "@/lib/domain/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function HealthScoreCard({
  user,
  profile,
  health,
}: {
  user: UserRecord;
  profile: ProfileRecord;
  health: HealthReport;
}) {
  return (
    <Card className="relative overflow-hidden p-6 sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <HealthRing score={health.score} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={health.openLeaks > 0 ? "rose" : "emerald"}>{health.label}</Badge>
            <Badge>{VERIFICATION_LABEL[profile.verificationLevel]}</Badge>
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight text-white">{user.fullName}</p>
          <p className="mt-1 text-sm text-slate-300">{profile.headline}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Personen-ID</p>
          <p className="mt-1 font-mono text-sm text-teal-100">{profile.publicId}</p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">{health.summary}</p>
        </div>
      </div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <Meter label="Profil vollständig" value={health.completeness} />
        <Meter
          label="Funde geprüft"
          value={health.total === 0 ? 0 : Math.round((health.reviewed / health.total) * 100)}
          detail={`${health.reviewed}/${health.total}`}
        />
        <Meter
          label="Datenlecks eingegrenzt"
          value={health.openLeaks === 0 ? 100 : 0}
          detail={health.openLeaks === 0 ? "Privat" : `${health.openLeaks} offen`}
        />
      </dl>
    </Card>
  );
}

function HealthRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? "#5eead4" : score >= 70 ? "#7dd3fc" : score >= 45 ? "#fcd34d" : "#fda4af";

  return (
    <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0" role="img" aria-label={`Identitätswert ${score} von 100`}>
      <circle cx="70" cy="70" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="66" textAnchor="middle" fill="white" fontSize="32" fontWeight="600">
        {score}
      </text>
      <text x="70" y="86" textAnchor="middle" fill="rgba(226,232,240,0.7)" fontSize="11">
        von 100
      </text>
    </svg>
  );
}

function Meter({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs text-slate-400">
        <dt>{label}</dt>
        <dd className="text-slate-200">{detail ?? `${value}%`}</dd>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-teal-200" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
