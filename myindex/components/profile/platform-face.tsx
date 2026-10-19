import { Play } from "lucide-react";
import { platformOf, profileHandle, profileName, profileText, type PlatformId } from "@/lib/domain/platforms";
import type { DisplayFact } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function PlatformFace({
  domain,
  title,
  snippet,
  facts,
  tone = "dark",
  bare = false,
  preview = false,
}: {
  domain: string;
  title: string;
  snippet: string;
  facts?: DisplayFact[];
  tone?: "dark" | "light";
  bare?: boolean;
  preview?: boolean;
}) {
  const platform = platformOf(domain);
  if (!platform) return null;

  const name = profileName(title, facts);
  const handle = profileHandle(facts);
  const text = profileText(snippet, facts);
  const light = tone === "light";

  if (platform === "instagram") {
    return (
      <div className={frame(bare, light, light ? "bg-white" : "bg-black")}>
        <div className="flex items-center gap-3 px-4 py-4">
          <Avatar name={name} ring="bg-gradient-to-tr from-amber-300 via-rose-500 to-fuchsia-600" light={light} />
          <div className="min-w-0">
            <p className={cn("truncate text-sm font-semibold", light ? "text-stone-950" : "text-white")}>{name}</p>
            <p className={cn("truncate text-xs", light ? "text-stone-500" : "text-slate-400")}>{handle ?? domain}</p>
          </div>
          <PlatformMark platform={platform} light={light} />
        </div>
        {preview ? (
          <>
            <p className={cn("px-4 pb-4 text-sm leading-6", light ? "text-stone-700" : "text-slate-200")}>{text}</p>
            <div className="grid grid-cols-3 gap-0.5">
              <Tile className="bg-gradient-to-br from-amber-200 via-rose-300 to-fuchsia-400" />
              <Tile className="bg-gradient-to-br from-teal-200 via-sky-300 to-indigo-400" />
              <Tile className="bg-gradient-to-br from-orange-200 via-amber-300 to-rose-400" />
            </div>
          </>
        ) : null}
      </div>
    );
  }

  if (platform === "facebook") {
    return (
      <div className={frame(bare, light, light ? "bg-white" : "bg-[#10131a]")}>
        <div className="h-16 bg-gradient-to-r from-sky-500 to-indigo-500" />
        <div className="px-4 pb-4">
          <div className="-mt-6 flex items-end gap-3">
            <Avatar name={name} ring="bg-sky-400" light={light} />
            <div className="min-w-0 pb-1">
              <p className={cn("truncate text-sm font-semibold", light ? "text-stone-950" : "text-white")}>{name}</p>
              <p className={cn("text-xs", light ? "text-stone-500" : "text-slate-400")}>{domain}</p>
            </div>
            <PlatformMark platform={platform} light={light} />
          </div>
          {preview ? <p className={cn("mt-3 text-sm leading-6", light ? "text-stone-700" : "text-slate-200")}>{text}</p> : null}
        </div>
      </div>
    );
  }

  if (platform === "youtube") {
    return (
      <div className={frame(bare, light, light ? "bg-white" : "bg-black")}>
        <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-rose-600 text-white">
            <Play className="size-5 fill-white" />
          </span>
        </div>
        <div className="flex items-start gap-3 px-4 py-4">
          <Avatar name={name} ring="bg-rose-500" light={light} />
          <div className="min-w-0">
            <p className={cn("text-sm font-semibold leading-5", light ? "text-stone-950" : "text-white")}>{title}</p>
            <p className={cn("mt-1 text-xs", light ? "text-stone-500" : "text-slate-400")}>{name}</p>
            {preview ? <p className={cn("mt-2 text-sm leading-6", light ? "text-stone-700" : "text-slate-300")}>{text}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(frame(bare, light, light ? "bg-white" : "bg-black"), "p-4")}>
      <div className="flex items-start gap-3">
        <Avatar name={name} ring={platform === "linkedin" ? "bg-sky-500" : "bg-slate-500"} light={light} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn("truncate text-sm font-semibold", light ? "text-stone-950" : "text-white")}>{name}</p>
              <p className={cn("truncate text-xs", light ? "text-stone-500" : "text-slate-400")}>{handle ?? domain}</p>
            </div>
            <PlatformMark platform={platform} light={light} />
          </div>
          {preview ? <p className={cn("mt-3 text-sm leading-6", light ? "text-stone-700" : "text-slate-200")}>{text}</p> : null}
        </div>
      </div>
    </div>
  );
}

function frame(bare: boolean, light: boolean, surface: string) {
  return cn("overflow-hidden", surface, bare ? "" : "rounded-2xl ring-1", bare ? "" : light ? "ring-stone-200" : "ring-white/10");
}

function Avatar({ name, ring, light }: { name: string; ring: string; light: boolean }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span className={cn("inline-flex shrink-0 rounded-full p-[2px]", ring)}>
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full text-xs font-semibold",
          light ? "bg-white text-stone-950" : "bg-[#111] text-white",
        )}
      >
        {initials || "·"}
      </span>
    </span>
  );
}

function Tile({ className }: { className: string }) {
  return <div className={cn("aspect-square", className)} aria-hidden="true" />;
}

const MARK: Record<PlatformId, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  github: "GitHub",
};

function PlatformMark({ platform, light }: { platform: PlatformId; light: boolean }) {
  return (
    <span className={cn("ml-auto shrink-0 text-[10px] font-medium uppercase tracking-[0.16em]", light ? "text-stone-400" : "text-slate-500")}>
      {MARK[platform]}
    </span>
  );
}
