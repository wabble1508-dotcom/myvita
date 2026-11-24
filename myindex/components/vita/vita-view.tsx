import { ArrowUpRight, Briefcase, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { Avatar } from "@/components/vita/avatar";
import { PlatformIcon } from "@/components/vita/platform-icon";
import { linkCaption, platformFor } from "@/lib/domain/social";
import type { CvEntryRow } from "@/lib/db/schema";
import { mediaUrl, type Vita } from "@/lib/vita/queries";

const MONTHS = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];

function monthLabel(value: string): string {
  const [year, month] = value.split("-");
  if (!year || !month) return "";
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

function period(entry: CvEntryRow): string {
  const start = monthLabel(entry.startDate);
  const end = entry.endDate ? monthLabel(entry.endDate) : "heute";
  return start ? `${start} – ${end}` : entry.endDate ? end : "";
}

/** Die Vita einer Person, wie andere sie sehen. `actions` erscheint neben dem Namen (Folgen, Bearbeiten). */
export function VitaView({ vita, actions }: { vita: Vita; actions?: React.ReactNode }) {
  const { profile } = vita;
  const empty =
    !profile.bio && !vita.links.length && !vita.projects.length && !vita.experience.length && !vita.education.length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="h-24 bg-[radial-gradient(600px_160px_at_20%_0%,rgba(47,107,255,0.45),transparent_70%)] sm:h-32" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-14">
            <Avatar name={profile.displayName} src={mediaUrl(profile.avatarId)} size="xl" className="ring-4 ring-[#08090c]" />
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">{profile.displayName}</h1>
            {profile.isDemo ? (
              <span className="rounded-full bg-amber-300/15 px-2.5 py-1 text-xs font-medium text-amber-100">Beispielprofil</span>
            ) : null}
            {profile.openToWork ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-200">
                <Sparkles className="size-3" /> Offen für Jobs
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            @{profile.handle} · <span className="font-mono text-xs">{profile.publicId}</span>
          </p>
          {profile.headline ? <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-200">{profile.headline}</p> : null}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-400">
            {profile.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {profile.location}
              </span>
            ) : null}
            <span>
              <strong className="font-medium text-white">{vita.followers}</strong> Follower
            </span>
            <span>
              <strong className="font-medium text-white">{vita.following}</strong> folgt
            </span>
          </div>
          {profile.bio ? <p className="mt-5 max-w-3xl text-sm leading-7 whitespace-pre-line text-zinc-300">{profile.bio}</p> : null}
          {profile.skills.length ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <li key={skill} className="rounded-full border border-accent-soft/25 bg-accent/10 px-3 py-1 text-xs text-accent-soft">
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {vita.links.length ? (
        <Section title="Kanäle">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vita.links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-accent-soft/40 hover:bg-white/[0.06]"
                >
                  <PlatformIcon url={link.url} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{link.label || platformFor(link.url).name}</span>
                    <span className="block truncate text-xs text-zinc-400">{linkCaption(link.url)}</span>
                  </span>
                  <ArrowUpRight className="size-4 text-zinc-500 transition group-hover:text-accent-soft" />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {vita.projects.length ? (
        <Section title="Portfolio">
          <ul className="grid gap-4 sm:grid-cols-2">
            {vita.projects.map((project) => {
              const image = mediaUrl(project.imageId);
              return (
                <li key={project.id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- eigene Bilder, Größe kommt vom Browser-Upload
                    <img src={image} alt="" className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[16/9] items-end bg-gradient-to-br from-accent/40 via-indigo-500/20 to-transparent p-4">
                      <span className="text-2xl font-medium tracking-tight text-white/80">{project.title}</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-medium text-white">{project.title}</h3>
                    {project.description ? (
                      <p className="mt-2 text-sm leading-6 whitespace-pre-line text-zinc-400">{project.description}</p>
                    ) : null}
                    {project.tags.length ? (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <li key={tag} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-zinc-300">
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow ugc"
                        className="mt-auto inline-flex items-center gap-1 pt-4 text-sm text-accent-soft hover:underline"
                      >
                        Ansehen <ArrowUpRight className="size-3.5" />
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      {vita.experience.length || vita.education.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {vita.experience.length ? (
            <Section title="Erfahrung">
              <Timeline entries={vita.experience} icon={<Briefcase className="size-4" />} />
            </Section>
          ) : null}
          {vita.education.length ? (
            <Section title="Ausbildung">
              <Timeline entries={vita.education} icon={<GraduationCap className="size-4" />} />
            </Section>
          ) : null}
        </div>
      ) : null}

      {empty ? (
        <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          Hier steht noch nichts.
        </p>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-accent-soft">{title}</h2>
      {children}
    </section>
  );
}

function Timeline({ entries, icon }: { entries: CvEntryRow[]; icon: React.ReactNode }) {
  return (
    <ol className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-soft">{icon}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-white">{entry.title}</h3>
            <p className="text-sm text-zinc-300">{[entry.organization, entry.location].filter(Boolean).join(" · ")}</p>
            {period(entry) ? <p className="mt-0.5 text-xs text-zinc-500">{period(entry)}</p> : null}
            {entry.description ? (
              <p className="mt-2 text-sm leading-6 whitespace-pre-line text-zinc-400">{entry.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
