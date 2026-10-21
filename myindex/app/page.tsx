import Link from "next/link";
import { FingerprintPattern, Link2, Shield } from "lucide-react";
import { IdLookup } from "@/components/identity/id-lookup";
import { PlatformFace } from "@/components/profile/platform-face";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const preview = {
  name: "Alex Rivera",
  handle: "@alexrivera",
};

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-teal-200">
            <FingerprintPattern className="size-4" />
            MyVita
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.02]">
            Eine Ansicht für alles, was im Netz zu einem Namen liegt.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Profile, Videos, Erwähnungen und einzelne Seiten, nebeneinander und nach Rubrik sortiert.
            Jede Person hat eine eigene ID. Der Abruf gilt dieser ID, auch wenn derselbe Name noch einmal vorkommt.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary", size: "md" }))}>
              App öffnen
            </Link>
            <Link href="/dashboard/share" className={cn(buttonVariants({ variant: "ghost", size: "md" }))}>
              Link zum Teilen
            </Link>
          </div>
          <div className="mt-8 max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <IdLookup />
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Diese Version erzeugt die Beispielseiten auf deinem Rechner. Sie fragt das Live-Web noch nicht ab.
          </p>
        </div>
        <PreviewStage />
      </div>
      <ul className="mt-16 grid gap-4 sm:grid-cols-3">
        <Point icon={FingerprintPattern} title="Eigene ID" text="Der Abruf läuft über die ID. Ein gleicher Name bleibt eine andere Person." />
        <Point icon={Shield} title="Nur öffentlich auffindbare Seiten" text="Gespeichert wird nur, was öffentlich gefunden werden soll. Private Profile und Datenlecks bleiben draußen." />
        <Point icon={Link2} title="Ein Link, den man schicken kann" text="24 Stunden, 7 Tage oder 30 Tage. Der Link zeigt eine Auswahl der gespeicherten öffentlichen Seiten." />
      </ul>
    </main>
  );
}

function PreviewStage() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-5">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-teal-200">Beispiel</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{preview.name}</p>
        </div>
        <p className="text-xs text-slate-500">sortiert</p>
      </div>
      <div className="mt-4 grid gap-3">
        <PlatformFace
          preview
          domain="linkedin.com"
          title={`${preview.name} auf LinkedIn`}
          snippet="Öffentliche Profilseite mit einem Ort."
          facts={[
            { label: "Name auf der Seite", value: preview.name },
            { label: "Ort", value: "Berlin" },
            { label: "Text auf der Seite", value: "Öffentliche Profilseite mit einem Ort." },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <PlatformFace
            preview
            domain="x.com"
            title={`${preview.name} auf X`}
            snippet="Kurze öffentliche Beiträge."
            facts={[
              { label: "Name auf der Seite", value: preview.name },
              { label: "Nutzername", value: preview.handle },
              { label: "Bio", value: "Kurze öffentliche Beiträge." },
            ]}
          />
          <PlatformFace
            preview
            domain="youtube.com"
            title={`Ein Video nennt ${preview.name}`}
            snippet="Der Name steht in der Beschreibung."
            facts={[
              { label: "Name auf der Seite", value: preview.name },
              { label: "Beschreibung", value: "Der Name steht in der Beschreibung." },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function Point({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Shield;
  title: string;
  text: string;
}) {
  return (
    <li className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <Icon className="size-4 text-teal-200" />
      <h2 className="mt-3 text-sm font-medium text-white">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
    </li>
  );
}
