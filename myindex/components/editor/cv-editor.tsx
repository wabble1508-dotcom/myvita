"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { useFormAction, VisibilitySelect } from "@/components/editor/shared";
import type { CvEntryRow, CvKind } from "@/lib/db/schema";
import { deleteCvEntry, saveCvEntry } from "@/lib/vita/actions";

const WORDS: Record<CvKind, { title: string; titleHint: string; org: string; orgHint: string; add: string }> = {
  experience: { title: "Rolle", titleHint: "z. B. Werkstudent Marketing", org: "Firma", orgHint: "z. B. Muster GmbH", add: "Station hinzufügen" },
  education: { title: "Abschluss oder Fach", titleHint: "z. B. B.Sc. Informatik", org: "Schule oder Hochschule", orgHint: "z. B. TU Berlin", add: "Ausbildung hinzufügen" },
};

export function CvForm({ kind, entry, onDone }: { kind: CvKind; entry?: CvEntryRow; onDone?: () => void }) {
  const words = WORDS[kind];
  const key = entry?.id ?? `new-${kind}`;
  const [current, setCurrent] = useState(entry ? !entry.endDate : false);
  const { state, pending, ref, onSubmit } = useFormAction(
    async (previous, form) => {
      const result = await saveCvEntry(previous, form);
      if (result?.done) {
        // Das Formular für neue Einträge startet wieder mit offenem „Bis“-Feld.
        if (!entry) setCurrent(false);
        onDone?.();
      }
      return result;
    },
    { resetOnDone: !entry },
  );

  return (
    <form ref={ref} onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
      <input type="hidden" name="kind" value={kind} />
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
      <Field label={words.title} htmlFor={`title-${key}`}>
        <Input id={`title-${key}`} name="title" required maxLength={100} defaultValue={entry?.title} placeholder={words.titleHint} />
      </Field>
      <Field label={words.org} htmlFor={`org-${key}`}>
        <Input id={`org-${key}`} name="organization" maxLength={100} defaultValue={entry?.organization} placeholder={words.orgHint} />
      </Field>
      <Field label="Von" htmlFor={`start-${key}`}>
        <Input id={`start-${key}`} name="startDate" type="month" defaultValue={entry?.startDate} />
      </Field>
      <Field label="Bis" htmlFor={`end-${key}`}>
        <Input id={`end-${key}`} name="endDate" type="month" defaultValue={entry?.endDate} disabled={current} />
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          <input type="checkbox" name="current" checked={current} onChange={(event) => setCurrent(event.target.checked)} />
          {kind === "experience" ? "Arbeite ich noch dort" : "Läuft noch"}
        </label>
      </Field>
      <Field label="Ort" htmlFor={`location-${key}`}>
        <Input id={`location-${key}`} name="location" maxLength={80} defaultValue={entry?.location} />
      </Field>
      <Field label="Wer sieht das?" htmlFor={`visibility-${key}`}>
        <VisibilitySelect id={`visibility-${key}`} defaultValue={entry?.visibility} />
      </Field>
      <Field label="Beschreibung (optional)" htmlFor={`description-${key}`} className="sm:col-span-2">
        <Textarea id={`description-${key}`} name="description" maxLength={1500} defaultValue={entry?.description} rows={3} />
      </Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {entry ? "Speichern" : words.add}
        </Button>
        {onDone ? (
          <Button type="button" variant="ghost" onClick={onDone}>
            Abbrechen
          </Button>
        ) : null}
        <FormMessage error={state?.error} done={entry ? undefined : state?.done} />
      </div>
    </form>
  );
}

export function CvList({ kind, entries }: { kind: CvKind; entries: CvEntryRow[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!entries.length) return null;
  return (
    <ul className="space-y-2" aria-busy={pending}>
      {entries.map((entry) =>
        editing === entry.id ? (
          <li key={entry.id}>
            <CvForm kind={kind} entry={entry} onDone={() => setEditing(null)} />
          </li>
        ) : (
          <li key={entry.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 pl-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{entry.title}</p>
              <p className="truncate text-xs text-zinc-400">
                {[entry.organization, [entry.startDate, entry.endDate || "heute"].filter(Boolean).join(" – ")].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(entry.id)}>
              <Pencil className="size-3.5" /> Bearbeiten
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`${entry.title} löschen`}
              onClick={() => {
                if (confirm(`„${entry.title}“ löschen?`)) start(() => deleteCvEntry(entry.id));
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </li>
        ),
      )}
    </ul>
  );
}
