"use client";

import { useCallback, useState, useTransition } from "react";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { useFormAction, useShrunkFile, VISIBILITY_OPTIONS, VisibilitySelect } from "@/components/editor/shared";
import type { ProjectRow } from "@/lib/db/schema";
import { deleteProject, saveProject } from "@/lib/vita/actions";

export function ProjectForm({ project, onDone }: { project?: ProjectRow; onDone?: () => void }) {
  const current = project?.imageId ? `/media/${project.imageId}` : null;
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const onPreview = useCallback((url: string | null) => {
    setPreview(url);
    if (url) setRemoved(false);
  }, []);
  const { ref: fileInput, clear: clearFile } = useShrunkFile(1600, onPreview);
  const { state, pending, ref, onSubmit } = useFormAction(
    async (previous, form) => {
      const result = await saveProject(previous, form);
      if (result?.done) {
        setPreview(null);
        setRemoved(false);
        clearFile();
        onDone?.();
      }
      return result;
    },
    { resetOnDone: !project },
  );
  const shown = preview ?? (removed ? null : current);
  const key = project?.id ?? "new";

  return (
    <form ref={ref} onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <input type="hidden" name="removeImage" value={removed ? "1" : "0"} />
      <div className="sm:col-span-2">
        <label className="flex aspect-[16/6] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-black/30 text-sm text-zinc-400 hover:border-accent-soft/50">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- Vorschau des gewählten Bildes
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex items-center gap-2">
              <ImagePlus className="size-4" /> Titelbild wählen (optional)
            </span>
          )}
          <input ref={fileInput} type="file" name="image" accept="image/png,image/jpeg,image/webp" className="sr-only" />
        </label>
        {shown ? (
          <button
            type="button"
            className="mt-2 text-xs text-zinc-400 underline"
            onClick={() => {
              setRemoved(true);
              setPreview(null);
              clearFile();
            }}
          >
            Bild entfernen
          </button>
        ) : null}
      </div>
      <Field label="Titel" htmlFor={`title-${key}`}>
        <Input id={`title-${key}`} name="title" required maxLength={100} defaultValue={project?.title} placeholder="z. B. Fitness-App „Move“" />
      </Field>
      <Field label="Link (optional)" htmlFor={`url-${key}`}>
        <Input id={`url-${key}`} name="url" defaultValue={project?.url} placeholder="github.com/… oder deine Seite" inputMode="url" />
      </Field>
      <Field label="Beschreibung" htmlFor={`description-${key}`} className="sm:col-span-2">
        <Textarea
          id={`description-${key}`}
          name="description"
          maxLength={2000}
          defaultValue={project?.description}
          placeholder="Was ist es, was war deine Rolle, was ist dabei herausgekommen?"
        />
      </Field>
      <Field label="Stichworte" htmlFor={`tags-${key}`} hint="Mit Komma trennen.">
        <Input id={`tags-${key}`} name="tags" defaultValue={project?.tags.join(", ")} placeholder="React, Design, Video" />
      </Field>
      <Field label="Wer sieht das?" htmlFor={`visibility-${key}`}>
        <VisibilitySelect id={`visibility-${key}`} defaultValue={project?.visibility} />
      </Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {project ? "Speichern" : "Projekt hinzufügen"}
        </Button>
        {onDone ? (
          <Button type="button" variant="ghost" onClick={onDone}>
            Abbrechen
          </Button>
        ) : null}
        <FormMessage error={state?.error} done={project ? undefined : state?.done} />
      </div>
    </form>
  );
}

export function ProjectList({ projects }: { projects: ProjectRow[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!projects.length) {
    return <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">Noch keine Projekte.</p>;
  }
  return (
    <ul className="space-y-3" aria-busy={pending}>
      {projects.map((project) =>
        editing === project.id ? (
          <li key={project.id}>
            <ProjectForm project={project} onDone={() => setEditing(null)} />
          </li>
        ) : (
          <li key={project.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            {project.imageId ? (
              // eslint-disable-next-line @next/next/no-img-element -- eigenes Projektbild
              <img src={`/media/${project.imageId}`} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="h-14 w-24 shrink-0 rounded-lg bg-gradient-to-br from-accent/40 to-indigo-700/30" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{project.title}</p>
              <p className="text-xs text-zinc-400">{VISIBILITY_OPTIONS.find((option) => option.value === project.visibility)?.label}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(project.id)}>
              <Pencil className="size-3.5" /> Bearbeiten
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`${project.title} löschen`}
              onClick={() => {
                if (confirm(`„${project.title}“ löschen?`)) start(() => deleteProject(project.id));
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
