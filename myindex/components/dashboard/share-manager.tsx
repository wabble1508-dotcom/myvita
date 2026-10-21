"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { createShareLinkAction, updateProfileAction } from "@/lib/actions/footprint";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/domain/categories";
import type { FootprintCategory, ProfileRecord, ShareLinkRecord, UserRecord } from "@/lib/domain/types";
import { formatWhen } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const EXPIRY_OPTIONS = [
  { value: "24h", label: "24 Stunden" },
  { value: "7d", label: "7 Tage" },
  { value: "30d", label: "30 Tage" },
] as const;

export type ShareLinkView = ShareLinkRecord & {
  sharedCount: number;
  expired: boolean;
};

export function ShareManager({
  user,
  profile,
  links,
}: {
  user: UserRecord;
  profile: ProfileRecord;
  links: ShareLinkView[];
}) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal-200">Teilen</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Ein Link zur Personenansicht</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Die feste Adresse ist die Personen-ID {profile.publicId}. Die Sammlung enthält nur Seiten, die öffentlich gefunden werden sollen. Ein Link zeigt eine Auswahl davon und läuft ab.
        </p>
        <div className="mt-4">
          <CopyRow path={`/id/${profile.publicId}`} />
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileForm user={user} profile={profile} />
        <ShareForm />
      </div>
      <LinkList links={links} />
    </div>
  );
}

function ProfileForm({ user, profile }: { user: UserRecord; profile: ProfileRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(user.fullName);
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-white">Text auf dem Link</h2>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          setError(null);
          startTransition(async () => {
            const result = await updateProfileAction({ fullName, headline, bio });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setMessage("Gespeichert. Neue und bestehende Links nutzen diesen Text.");
            router.refresh();
          });
        }}
      >
        <TextField label="Name" value={fullName} onChange={setFullName} />
        <TextField label="Überschrift" value={headline} onChange={setHeadline} />
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Kurztext</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-slate-50 outline-none focus:border-teal-200/60"
          />
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Speichert…" : "Profil speichern"}
        </Button>
        {error ? <p className="text-sm text-rose-100" role="alert">{error}</p> : null}
        {message ? <p className="text-sm text-teal-100" role="status">{message}</p> : null}
      </form>
    </Card>
  );
}

function ShareForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expiresIn, setExpiresIn] = useState<(typeof EXPIRY_OPTIONS)[number]["value"]>("7d");
  const [categories, setCategories] = useState<FootprintCategory[]>(["PROFESSIONAL", "SOCIAL", "MEDIA_MENTION"]);
  const [error, setError] = useState<string | null>(null);
  const [createdPath, setCreatedPath] = useState<string | null>(null);

  function toggle(category: FootprintCategory) {
    setCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-white">Neuer zeitlich begrenzter Link</h2>
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setCreatedPath(null);
          startTransition(async () => {
            const result = await createShareLinkAction({ expiresIn, allowedCategories: categories });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setCreatedPath(`/p/${result.data.accessToken}`);
            router.refresh();
          });
        }}
      >
        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Gültig</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXPIRY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                  expiresIn === option.value
                    ? "border-teal-200/50 bg-teal-200 text-slate-950"
                    : "border-white/10 text-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="expires"
                  value={option.value}
                  checked={expiresIn === option.value}
                  onChange={() => setExpiresIn(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Rubriken mit Funden</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CATEGORY_ORDER.map((category) => (
              <label key={category} className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={categories.includes(category)}
                  onChange={() => toggle(category)}
                  className="size-4 accent-teal-200"
                />
                {CATEGORY_META[category].label}
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" disabled={pending}>
          {pending ? "Wird erzeugt…" : "Link erzeugen"}
        </Button>
        {error ? <p className="text-sm text-rose-100" role="alert">{error}</p> : null}
        {createdPath ? <CopyRow path={createdPath} /> : null}
      </form>
    </Card>
  );
}

function LinkList({ links }: { links: ShareLinkView[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Bestehende Links</h2>
      {links.length === 0 ? (
        <Card className="px-5 py-8 text-sm text-slate-400">Noch keine Links.</Card>
      ) : (
        <ul className="space-y-3">
          {links.map((link) => (
            <li key={link.id}>
              <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={link.expired ? "rose" : "emerald"}>{link.expired ? "Abgelaufen" : "Aktiv"}</Badge>
                    <span className="text-xs text-slate-400">
                      {link.viewsCount} {link.viewsCount === 1 ? "Aufruf" : "Aufrufe"} · {link.sharedCount}{" "}
                      {link.sharedCount === 1 ? "Eintrag" : "Einträge"}
                    </span>
                  </div>
                  <p className="mt-2 truncate font-mono text-sm text-slate-200">/p/{link.accessToken}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Läuft ab {formatWhen(link.expiresAt)} · {link.allowedCategories.map((category) => CATEGORY_META[category].label).join(", ")}
                  </p>
                </div>
                {link.expired ? null : <CopyRow path={`/p/${link.accessToken}`} compact />}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CopyRow({ path, compact = false }: { path: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {compact ? null : <code className="truncate text-xs text-slate-300">{path}</code>}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={async () => {
          const url = `${window.location.origin}${path}`;
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Kopiert" : "Kopieren"}
      </Button>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-3 text-sm text-slate-50 outline-none focus:border-teal-200/60"
      />
    </label>
  );
}
