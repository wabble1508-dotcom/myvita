import Link from "next/link";
import { ArrowRight, Briefcase, FolderKanban, Link2, Search, Send } from "lucide-react";
import { MemberCard } from "@/components/site/member-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/vita/avatar";
import { PlatformIcon } from "@/components/vita/platform-icon";
import { getViewer } from "@/lib/auth/session";
import { searchMembers } from "@/lib/vita/queries";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ geloescht?: string }> }) {
  const [viewer, members, { geloescht }] = await Promise.all([getViewer(), searchMembers("", 6), searchParams]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {geloescht ? (
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            Dein Konto und alle Daten sind gelöscht.
          </p>
        ) : null}
        <section className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent-soft">Dein Netzwerk für Lebenslauf und Portfolio</p>
            <h1 className="mt-4 max-w-xl text-4xl font-medium tracking-tight text-white sm:text-6xl sm:leading-[1.02]">
              Deine Vita. Alles an einem Ort.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              Instagram, LinkedIn, YouTube, deine Projekte und dein Lebenslauf auf einer Seite. Andere finden dich über deinen Namen oder
              deine MyVita-ID. Und wenn du dich bewirbst, schickst du einfach einen Link.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={viewer ? "/profil" : "/registrieren"} className={buttonVariants({ className: "h-12 px-6 text-base" })}>
                {viewer ? "Mein Profil" : "Kostenlos Vita anlegen"} <ArrowRight className="size-4" />
              </Link>
              <Link href="/suche" className={buttonVariants({ variant: "ghost", className: "h-12 px-6 text-base" })}>
                <Search className="size-4" /> Mitglieder finden
              </Link>
            </div>
          </div>
          <PreviewCard />
        </section>

        <ul className="grid gap-3 border-t border-white/10 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <Point icon={Link2} title="Alle Kanäle gebündelt" text="Instagram, LinkedIn, YouTube, TikTok, GitHub und deine Website mit einem Link." />
          <Point icon={FolderKanban} title="Portfolio" text="Zeig Programme, Apps, Designs und Videos mit Bild, Beschreibung und Link." />
          <Point icon={Briefcase} title="Lebenslauf" text="Erfahrung und Ausbildung übersichtlich, immer aktuell statt als altes PDF." />
          <Point icon={Send} title="Bewerben per Link" text="Ein privater Link für jede Bewerbung. Er läuft ab, und du siehst, ob er geöffnet wurde." />
        </ul>

        {members.length ? (
          <section className="border-t border-white/10 py-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-xl font-medium tracking-tight text-white">Neu auf MyVita</h2>
              <Link href="/suche" className="text-sm text-accent-soft hover:underline">
                Alle ansehen
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <li key={member.handle}>
                  <MemberCard member={member} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

/** Beispiel, wie eine Vita aussieht. Keine echte Person. */
function PreviewCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-4 sm:p-5">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="h-16 bg-[radial-gradient(400px_100px_at_20%_0%,rgba(47,107,255,0.5),transparent_70%)]" />
        <div className="px-4 pb-4">
          <Avatar name="Lena Berger" size="md" className="-mt-7 ring-4 ring-[#0c0e13]" />
          <p className="mt-2 text-lg font-medium text-white">Lena Berger</p>
          <p className="text-xs text-zinc-500">@lena.berger · MV-4K7Q2HXR</p>
          <p className="mt-2 text-sm text-zinc-300">UX-Designerin für Apps im Gesundheitswesen</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Figma", "Prototyping", "React"].map((skill) => (
              <span key={skill} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] text-accent-soft">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
          ["https://instagram.com/lena.designs", "Instagram"],
          ["https://linkedin.com/in/lenaberger", "LinkedIn"],
          ["https://youtube.com/@lenadesigns", "YouTube"],
          ["https://dribbble.com/lenab", "Dribbble"],
        ].map(([url, name]) => (
          <div key={name} className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5">
            <PlatformIcon url={url!} className="size-8 rounded-lg" />
            <span className="text-sm text-white">{name}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <span className="h-12 w-20 shrink-0 rounded-lg bg-gradient-to-br from-accent/60 to-indigo-700/40" />
        <div>
          <p className="text-sm font-medium text-white">Praxis-App „Termin+“</p>
          <p className="text-xs text-zinc-400">Portfolio · Figma, React</p>
        </div>
      </div>
    </div>
  );
}

function Point({ icon: Icon, title, text }: { icon: typeof Link2; title: string; text: string }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <Icon className="size-4 text-accent-soft" />
      <h2 className="mt-4 text-sm font-medium text-white">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-400">{text}</p>
    </li>
  );
}
