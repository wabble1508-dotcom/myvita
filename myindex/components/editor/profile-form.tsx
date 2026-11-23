"use client";

import { useCallback, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { Avatar } from "@/components/vita/avatar";
import { useFormAction, useShrunkFile } from "@/components/editor/shared";
import type { Profile } from "@/lib/db/schema";
import { saveProfile } from "@/lib/vita/actions";

export function ProfileForm({ profile, avatarUrl }: { profile: Profile; avatarUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const onPreview = useCallback((url: string | null) => {
    setPreview(url);
    if (url) setRemoved(false);
  }, []);
  const { ref: fileInput, clear: clearFile } = useShrunkFile(640, onPreview);
  const { state, pending, ref, onSubmit } = useFormAction(async (previous, form) => {
    const result = await saveProfile(previous, form);
    if (result?.done) {
      // Ab jetzt das gespeicherte Bild vom Server zeigen.
      setPreview(null);
      setRemoved(false);
      clearFile();
    }
    return result;
  });
  const shown = preview ?? (removed ? null : avatarUrl);

  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-6">
      <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <Avatar name={profile.displayName} src={shown} size="xl" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Profilfoto</p>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 text-sm text-zinc-100 hover:border-white/30">
              <Camera className="size-3.5" /> Foto wählen
              <input ref={fileInput} type="file" name="avatar" accept="image/png,image/jpeg,image/webp" className="sr-only" />
            </label>
            {shown ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRemoved(true);
                  setPreview(null);
                  clearFile();
                }}
              >
                <Trash2 className="size-3.5" /> Entfernen
              </Button>
            ) : null}
          </div>
          <input type="hidden" name="removeAvatar" value={removed ? "1" : "0"} />
          <p className="text-xs text-zinc-500">JPG, PNG oder WebP. Wird automatisch verkleinert.</p>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="displayName">
          <Input id="displayName" name="displayName" defaultValue={profile.displayName} required maxLength={80} />
        </Field>
        <Field label="@Name" htmlFor="handle" hint="Ändert auch deine Adresse. Alte Links auf @name funktionieren dann nicht mehr.">
          <Input id="handle" name="handle" defaultValue={profile.handle} required maxLength={30} />
        </Field>
        <Field label="Überschrift" htmlFor="headline" className="sm:col-span-2" hint="Ein Satz, z. B. „UX-Designerin für Apps im Gesundheitswesen“.">
          <Input id="headline" name="headline" defaultValue={profile.headline} maxLength={120} />
        </Field>
        <Field label="Ort" htmlFor="location">
          <Input id="location" name="location" defaultValue={profile.location} maxLength={80} placeholder="z. B. Berlin" />
        </Field>
        <Field label="Fähigkeiten" htmlFor="skills" hint="Mit Komma trennen. Man findet dich auch darüber.">
          <Input id="skills" name="skills" defaultValue={profile.skills.join(", ")} placeholder="Figma, React, Videoschnitt" />
        </Field>
        <Field label="Über mich" htmlFor="bio" className="sm:col-span-2">
          <Textarea id="bio" name="bio" defaultValue={profile.bio} maxLength={1500} rows={5} />
        </Field>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <Toggle name="openToWork" defaultChecked={profile.openToWork} title="Offen für Jobs" text="Zeigt ein grünes Zeichen auf deiner Vita." />
        <Toggle
          name="searchable"
          defaultChecked={profile.searchable}
          title="In der Suche auffindbar"
          text="Aus: Niemand findet dich, und deine Vita-Seite ist nur für dich sichtbar. Bewerbungslinks funktionieren weiter."
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Speichern …" : "Speichern"}
        </Button>
        <FormMessage error={state?.error} done={state?.done} />
      </div>
    </form>
  );
}

function Toggle({ name, defaultChecked, title, text }: { name: string; defaultChecked: boolean; title: string; text: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full bg-white/15 p-0.5 transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent-soft [&>span]:transition peer-checked:[&>span]:translate-x-4">
        <span className="size-4 rounded-full bg-white" />
      </span>
      <span>
        <span className="block text-sm font-medium text-white">{title}</span>
        <span className="block text-xs leading-5 text-zinc-400">{text}</span>
      </span>
    </label>
  );
}
