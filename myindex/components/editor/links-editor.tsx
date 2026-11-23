"use client";

import { useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { PlatformIcon } from "@/components/vita/platform-icon";
import { useFormAction, VisibilitySelect } from "@/components/editor/shared";
import type { LinkRow } from "@/lib/db/schema";
import { linkCaption, platformFor } from "@/lib/domain/social";
import { addLink, deleteLink, moveLink, setLinkVisibility } from "@/lib/vita/actions";

export function AddLinkForm() {
  const { state, pending, ref, onSubmit } = useFormAction(addLink, { resetOnDone: true });
  return (
    <form ref={ref} onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-[1.4fr_1fr_auto] sm:items-end">
      <Field label="Adresse" htmlFor="url">
        <Input id="url" name="url" required placeholder="instagram.com/deinname" inputMode="url" />
      </Field>
      <Field label="Bezeichnung (optional)" htmlFor="label">
        <Input id="label" name="label" maxLength={60} placeholder="z. B. Mein Fotokanal" />
      </Field>
      <Field label="Wer sieht das?" htmlFor="link-visibility">
        <VisibilitySelect id="link-visibility" />
      </Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
        <Button type="submit" disabled={pending}>
          Link hinzufügen
        </Button>
        <FormMessage error={state?.error} done={state?.done} />
      </div>
    </form>
  );
}

export function LinkList({ links }: { links: LinkRow[] }) {
  const [pending, start] = useTransition();
  if (!links.length) {
    return <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">Noch keine Kanäle.</p>;
  }
  return (
    <ul className="space-y-2" aria-busy={pending}>
      {links.map((link, index) => (
        <li key={link.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <PlatformIcon url={link.url} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{link.label || platformFor(link.url).name}</p>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-zinc-400 hover:underline">
              {linkCaption(link.url)}
            </a>
          </div>
          <VisibilitySelect
            name={`visibility-${link.id}`}
            defaultValue={link.visibility}
            className="h-9 w-auto py-1"
            onChange={(value) => start(() => setLinkVisibility(link.id, value))}
          />
          <div className="flex gap-1">
            <IconButton label="Nach oben" disabled={index === 0} onClick={() => start(() => moveLink(link.id, "up"))}>
              <ArrowUp className="size-4" />
            </IconButton>
            <IconButton label="Nach unten" disabled={index === links.length - 1} onClick={() => start(() => moveLink(link.id, "down"))}>
              <ArrowDown className="size-4" />
            </IconButton>
            <IconButton label="Löschen" onClick={() => start(() => deleteLink(link.id))}>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function IconButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
      {...props}
    >
      {children}
    </button>
  );
}
