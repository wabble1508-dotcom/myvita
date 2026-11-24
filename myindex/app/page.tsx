import Link from "next/link";
import { ArrowRight, Briefcase, Building2, Camera, Check, Eye, FolderKanban, GraduationCap, Link2, Send, Smartphone, UserRound } from "lucide-react";
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
              <Link href="/@lena.berger" className={buttonVariants({ variant: "ghost", className: "h-12 px-6 text-base" })}>
                <Eye className="size-4" /> Beispiel ansehen
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

        <section className="border-t border-white/10 py-12">
          <Eyebrow>So funktioniert es</Eyebrow>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-white sm:text-3xl">In drei Schritten zur eigenen Vita</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            <Step n={1} title="Konto anlegen" text="Name, @Name und E-Mail. Du bekommst sofort deine Adresse myvita/@name und eine feste MyVita-ID." />
            <Step n={2} title="Vita füllen" text="Foto, Kanäle, Projekte und Lebenslauf eintragen. Oder „Mich im Netz finden“ sucht deine Profile und du übernimmst sie per Klick." />
            <Step n={3} title="Teilen und gefunden werden" text="Andere finden dich in der Suche. Für Bewerbungen schickst du einen privaten Link, der von selbst abläuft." />
          </ol>
        </section>

        <section className="border-t border-white/10 py-12">
          <Eyebrow>Für wen</Eyebrow>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-white sm:text-3xl">Eine Seite, die mehr zeigt als ein Lebenslauf</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Audience icon={GraduationCap} title="Schüler, Azubis, Studierende" text="Zeigen, was man kann, auch ohne lange Berufserfahrung: Projekte, Videos, Ehrenamt." />
            <Audience icon={UserRound} title="Fachkräfte" text="Aktueller Lebenslauf statt altem PDF. „Offen für Jobs“ mit einem Schalter." />
            <Audience icon={Camera} title="Creator und Freelancer" text="Instagram, YouTube, TikTok und Portfolio gebündelt. Ein Link für die Bio." />
            <Audience icon={Building2} title="Firmen (bald)" text="Talente nach Fähigkeit und Ort finden und Bewerbungen als Link bekommen." />
          </ul>
        </section>

        <section className="border-t border-white/10 py-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <Eyebrow>Selbst bestimmt</Eyebrow>
              <h2 className="mt-3 text-2xl font-medium tracking-tight text-white sm:text-3xl">Du entscheidest, wer was sieht</h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">
                Jeder Eintrag hat drei Stufen. Und deine Daten gehören dir: herunterladen oder Konto löschen geht jederzeit mit einem Klick.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-3">
              <Level title="Öffentlich" text="Alle sehen es, auch über die Suche." tone="bg-accent/15 text-accent-soft" />
              <Level title="Nur Bewerbungslinks" text="Nur wer deinen privaten Link hat, z. B. eine Firma." tone="bg-amber-300/15 text-amber-100" />
              <Level title="Privat" text="Nur du siehst es." tone="bg-white/10 text-zinc-200" />
            </ul>
          </div>
        </section>

        <section className="border-t border-white/10 py-12">
          <Eyebrow>Als App</Eyebrow>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent-soft">
                <Smartphone className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-medium text-white">MyVita auf den Startbildschirm</h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-400">
                  Auf dem Handy im Browser „Zum Home-Bildschirm“ wählen. MyVita startet dann wie eine App, ohne App Store.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-12">
          <Eyebrow>Als Nächstes</Eyebrow>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-white sm:text-3xl">Was dazukommt</h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {[
              "Lebenslauf als PDF mit einem Klick",
              "Anmelden mit Google und Apple",
              "Feed mit Neuigkeiten aus deinem Netzwerk",
              "Nachrichten zwischen Mitgliedern",
              "Firmenkonten mit Stellenanzeigen",
              "Bewerben mit einem Klick über die eigene Vita",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                <Check className="size-4 text-accent-soft" /> {item}
              </li>
            ))}
          </ul>
        </section>

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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent-soft">{children}</p>;
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <span className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">{n}</span>
      <h3 className="mt-4 text-base font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-zinc-400">{text}</p>
    </li>
  );
}

function Audience({ icon: Icon, title, text }: { icon: typeof Link2; title: string; text: string }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <Icon className="size-5 text-accent-soft" />
      <h3 className="mt-4 text-sm font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-zinc-400">{text}</p>
    </li>
  );
}

function Level({ title, text, tone }: { title: string; text: string; tone: string }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{title}</span>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
    </li>
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
