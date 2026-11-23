import { Camera, Code2, Globe, Music2, Play, Radio, Tv } from "lucide-react";
import { platformFor } from "@/lib/domain/social";
import { cn } from "@/lib/utils";

const GLYPH: Record<string, React.ReactNode> = {
  instagram: <Camera className="size-[55%]" />,
  youtube: <Play className="size-[50%] fill-current" />,
  tiktok: <Music2 className="size-[50%]" />,
  github: <Code2 className="size-[52%]" />,
  twitch: <Tv className="size-[50%]" />,
  spotify: <Radio className="size-[50%]" />,
  soundcloud: <Radio className="size-[50%]" />,
  website: <Globe className="size-[52%]" />,
};

const LETTERS: Record<string, string> = {
  linkedin: "in",
  x: "𝕏",
  facebook: "f",
  xing: "X",
  behance: "Bē",
  dribbble: "Dr",
  threads: "@",
  pinterest: "P",
  snapchat: "S",
};

/** Farbige Kachel mit Zeichen der Plattform, ohne fremde Logos einzubinden. */
export function PlatformIcon({ url, className }: { url: string; className?: string }) {
  const platform = platformFor(url);
  const dark = platform.id === "snapchat";
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1 ring-white/10",
        dark ? "text-black" : "text-white",
        className,
      )}
      style={{ background: platform.color }}
    >
      {GLYPH[platform.id] ?? LETTERS[platform.id] ?? platform.name[0]}
    </span>
  );
}
