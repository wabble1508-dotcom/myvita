"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Eye, FolderKanban, Link2, Search, Send, Settings, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/profil", label: "Profil", icon: UserRound },
  { href: "/profil/links", label: "Kanäle", icon: Link2 },
  { href: "/profil/portfolio", label: "Portfolio", icon: FolderKanban },
  { href: "/profil/lebenslauf", label: "Lebenslauf", icon: Briefcase },
  { href: "/profil/import", label: "Mich im Netz finden", icon: Search },
  { href: "/profil/bewerbung", label: "Bewerbungslinks", icon: Send },
  { href: "/profil/konto", label: "Konto", icon: Settings },
];

export function EditorNav({ handle }: { handle: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/profil" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition md:py-2.5",
              active ? "bg-accent/15 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
            )}
          >
            <Icon className={cn("size-4", active && "text-accent-soft")} />
            {label}
          </Link>
        );
      })}
      <Link
        href={`/@${handle}`}
        className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap text-accent-soft hover:bg-white/5 md:mt-3 md:py-2.5"
      >
        <Eye className="size-4" /> Meine Vita ansehen
      </Link>
    </nav>
  );
}
