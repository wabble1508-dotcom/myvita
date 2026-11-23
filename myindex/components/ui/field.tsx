import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-accent-soft/70 focus:ring-2 focus:ring-accent/30";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400", className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 leading-6", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "h-11", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-5 text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function FormMessage({ error, done }: { error?: string; done?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-100">
        {error}
      </p>
    );
  }
  if (done) {
    return (
      <p role="status" className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3.5 py-2.5 text-sm text-emerald-100">
        {done}
      </p>
    );
  }
  return null;
}
