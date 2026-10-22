"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FingerprintPattern, LayoutDashboard, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutDashboard },
  { href: "/dashboard/share", label: "Link teilen", icon: Link2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="md:border-r md:border-white/10">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 md:hidden">
        <Brand />
        <nav className="ml-auto flex gap-2">
          {links.map((link) => (
            <NavLink key={link.href} {...link} active={isActive(pathname, link.href)} />
          ))}
        </nav>
      </div>
      <aside className="sticky top-0 hidden h-dvh w-60 flex-col overflow-y-auto px-4 pt-6 pb-8 md:flex">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) => (
            <NavLink key={link.href} {...link} active={isActive(pathname, link.href)} />
          ))}
        </nav>
        <p className="mt-auto pt-8 pb-1 text-xs leading-5 text-slate-500">MyVita auf diesem Rechner.</p>
      </aside>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
      <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-ink">
        <FingerprintPattern className="size-4" />
      </span>
      MyVita
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition md:py-2.5",
        active ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-100",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
