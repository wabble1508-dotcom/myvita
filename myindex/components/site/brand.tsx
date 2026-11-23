import Link from "next/link";
import { FingerprintPattern } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex size-8 items-center justify-center rounded-xl bg-accent text-white", className)}>
      <FingerprintPattern className="size-4" />
    </span>
  );
}

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
      <Logo />
      MyVita
    </Link>
  );
}
