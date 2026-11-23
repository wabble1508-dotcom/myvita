"use client";

import Link from "next/link";
import { useTransition } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { toggleFollow } from "@/lib/vita/actions";

export function FollowButton({ handle, following, signedIn }: { handle: string; following: boolean; signedIn: boolean }) {
  const [pending, start] = useTransition();
  if (!signedIn) {
    return (
      <Link href={`/anmelden?next=/@${handle}`} className={buttonVariants({ size: "sm" })}>
        <UserPlus className="size-3.5" /> Folgen
      </Link>
    );
  }
  return (
    <Button
      size="sm"
      variant={following ? "ghost" : "primary"}
      disabled={pending}
      onClick={() => start(() => toggleFollow(handle))}
    >
      {following ? <UserCheck className="size-3.5" /> : <UserPlus className="size-3.5" />}
      {following ? "Folgst du" : "Folgen"}
    </Button>
  );
}
