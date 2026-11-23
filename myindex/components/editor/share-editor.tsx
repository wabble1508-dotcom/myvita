"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select } from "@/components/ui/field";
import { useFormAction } from "@/components/editor/shared";
import type { ShareLinkRow } from "@/lib/db/schema";
import { createShareLink, deleteShareLink } from "@/lib/vita/actions";

export function ShareForm() {
  const { state, pending, ref, onSubmit } = useFormAction(createShareLink, { resetOnDone: true });
  return (
    <form ref={ref} onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-[1.5fr_1fr] sm:items-end">
      <Field label="Für wen?" htmlFor="label">
        <Input id="label" name="label" maxLength={80} placeholder="z. B. Bewerbung bei Muster GmbH" />
      </Field>
      <Field label="Gültig" htmlFor="days">
        <Select id="days" name="days" defaultValue="30">
          <option value="1">24 Stunden</option>
          <option value="7">7 Tage</option>
          <option value="30">30 Tage</option>
          <option value="90">90 Tage</option>
        </Select>
      </Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          Link erstellen
        </Button>
        <FormMessage error={state?.error} done={state?.done} />
      </div>
    </form>
  );
}

export function ShareList({ links, origin }: { links: (ShareLinkRow & { expired: boolean })[]; origin: string }) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  if (!links.length) {
    return <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">Noch keine Bewerbungslinks.</p>;
  }
  return (
    <ul className="space-y-2" aria-busy={pending}>
      {links.map((link) => {
        const url = `${origin}/b/${link.token}`;
        const { expired } = link;
        return (
          <li key={link.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 pl-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{link.label || "Bewerbungslink"}</p>
              <p className="truncate font-mono text-xs text-zinc-400">{url}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {expired ? "Abgelaufen" : `Gültig bis ${new Date(link.expiresAt).toLocaleDateString("de-DE")}`} · {link.views}× geöffnet
              </p>
            </div>
            {!expired ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(url);
                  setCopied(link.id);
                  setTimeout(() => setCopied(null), 1800);
                }}
              >
                {copied === link.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied === link.id ? "Kopiert" : "Kopieren"}
              </Button>
            ) : null}
            <Button type="button" variant="ghost" size="sm" aria-label="Link löschen" onClick={() => start(() => deleteShareLink(link.id))}>
              <Trash2 className="size-3.5" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
