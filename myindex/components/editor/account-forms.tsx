"use client";

import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { useFormAction } from "@/components/editor/shared";
import { changePassword, deleteAccount } from "@/lib/vita/actions";

export function PasswordForm() {
  const { state, pending, ref, onSubmit } = useFormAction(changePassword, { resetOnDone: true });
  return (
    <form ref={ref} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Aktuelles Passwort" htmlFor="current">
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Neues Passwort" htmlFor="next">
        <Input id="next" name="next" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          Passwort ändern
        </Button>
        <FormMessage error={state?.error} done={state?.done} />
      </div>
    </form>
  );
}

export function DeleteAccountForm({ handle }: { handle: string }) {
  const { state, pending, ref, onSubmit } = useFormAction(deleteAccount);
  return (
    <form ref={ref} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label={`Zur Bestätigung: ${handle}`} htmlFor="confirm">
        <Input id="confirm" name="confirm" required autoComplete="off" />
      </Field>
      <Field label="Passwort" htmlFor="delete-password">
        <Input id="delete-password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" variant="danger" disabled={pending}>
          Konto endgültig löschen
        </Button>
        <FormMessage error={state?.error} />
      </div>
    </form>
  );
}
