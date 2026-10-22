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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:py-10">
      <header className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-medium tracking-tight text-white">
          <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-ink">
            <FingerprintPattern className="size-4" />
          </span>
          MyVita
        </p>
        <p className="text-xs text-zinc-500">Auf diesem Rechner</p>
      </header>
      <div className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Personenansicht</p>
          <h1 className="mt-4 max-w-xl text-4xl font-medium tracking-tight text-white sm:text-6xl sm:leading-[1.02]">
            Eine Ansicht für alles, was im Netz zu einem Namen liegt.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
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
          <div className="mt-8 max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <IdLookup />
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            Die Beispielperson liegt auf diesem Rechner. Die Suche fragt das öffentliche Web ab und speichert die Seiten, auf denen der Name steht.
          </p>
        </div>
        <PreviewStage />
      </div>
      <ul className="grid gap-3 border-t border-white/10 py-8 sm:grid-cols-3">
        <Point icon={FingerprintPattern} title="Eigene ID" text="Der Abruf läuft über die ID. Ein gleicher Name bleibt eine andere Person." />
        <Point icon={Shield} title="Öffentliche Seiten zum Namen" text="Die Suche sammelt, was öffentlich zum Namen zu finden ist. Passwort- und Datenleck-Seiten bleiben draußen." />
        <Point icon={Link2} title="Ein Link, den man schicken kann" text="24 Stunden, 7 Tage oder 30 Tage. Der Link zeigt eine Auswahl der gespeicherten öffentlichen Seiten." />
      </ul>
    </main>
  );
}

function PreviewStage() {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-4 sm:p-5">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Beispiel</p>
          <p className="mt-2 text-2xl font-medium tracking-tight text-white">{preview.name}</p>
        </div>
        <p className="text-xs text-zinc-500">sortiert</p>
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
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <Icon className="size-4 text-accent" />
      <h2 className="mt-4 text-sm font-medium text-white">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-400">{text}</p>
    </li>
  );
}
