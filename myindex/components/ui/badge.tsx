import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-white/10 text-slate-200",
  sky: "bg-sky-400/15 text-sky-100",
  violet: "bg-violet-400/15 text-violet-100",
  amber: "bg-amber-300/15 text-amber-100",
  rose: "bg-rose-400/15 text-rose-100",
  emerald: "bg-emerald-300/15 text-emerald-100",
  indigo: "bg-indigo-400/15 text-indigo-100",
  cyan: "bg-cyan-300/15 text-cyan-100",
} as const;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
