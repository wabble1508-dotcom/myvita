import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-10 text-sm",
  md: "size-14 text-lg",
  xl: "size-24 text-3xl sm:size-28",
} as const;

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase() || "?";
}

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-indigo-700 font-medium text-white",
        SIZES[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- eigenes, bereits verkleinertes Profilbild
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span aria-label={name}>{initials(name)}</span>
      )}
    </span>
  );
}
