import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { Avatar } from "@/components/vita/avatar";
import { mediaUrl, type SearchHit } from "@/lib/vita/queries";

export function MemberCard({ member }: { member: SearchHit }) {
  return (
    <Link
      href={`/@${member.handle}`}
      className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-accent-soft/40 hover:bg-white/[0.06]"
    >
      <Avatar name={member.displayName} src={mediaUrl(member.avatarId)} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="truncate text-base font-medium text-white">{member.displayName}</span>
          {member.openToWork ? <Sparkles className="size-3.5 text-emerald-300" aria-label="Offen für Jobs" /> : null}
        </p>
        <p className="text-xs text-zinc-500">
          @{member.handle} · <span className="font-mono">{member.publicId}</span>
        </p>
        {member.headline ? <p className="mt-1.5 line-clamp-2 text-sm text-zinc-300">{member.headline}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {member.location ? (
            <span className="mr-1 inline-flex items-center gap-1 text-xs text-zinc-400">
              <MapPin className="size-3" /> {member.location}
            </span>
          ) : null}
          {member.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] text-accent-soft">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
