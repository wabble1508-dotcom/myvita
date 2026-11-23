"use client";

import Link from "next/link";
import { useState } from "react";
import { login, requestPasswordReset, resetPassword, signup } from "@/lib/auth/actions";
import { suggestHandle } from "@/lib/domain/handle";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { useFormAction } from "@/components/editor/shared";

export function SignupForm() {
  const { state, pending, ref, onSubmit } = useFormAction(signup);
  const [name, setName] = useState(state?.values?.displayName ?? "");
  const [handle, setHandle] = useState(state?.values?.handle ?? "");
  const [touched, setTouched] = useState(Boolean(state?.values?.handle));

  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-4">
      <Field label="Vor- und Nachname" htmlFor="displayName">
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!touched) setHandle(suggestHandle(event.target.value));
          }}
        />
      </Field>
      <Field label="@Name" htmlFor="handle" hint="Deine Adresse: myvita/@name. Kleinbuchstaben, Zahlen, Punkt, Unterstrich.">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-zinc-500">@</span>
          <Input
            id="handle"
            name="handle"
            autoComplete="username"
            required
            className="pl-8"
            value={handle}
            onChange={(event) => {
              setTouched(true);
              setHandle(event.target.value.toLowerCase());
            }}
          />
        </div>
      </Field>
      <Field label="E-Mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.values?.email} />
      </Field>
      <Field label="Passwort" htmlFor="password" hint="Mindestens 8 Zeichen.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <FormMessage error={state?.error} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Konto wird angelegt …" : "Konto anlegen"}
      </Button>
      <p className="text-center text-sm text-zinc-400">
        Schon dabei?{" "}
        <Link href="/anmelden" className="text-accent-soft underline">
          Anmelden
        </Link>
      </p>
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const { state, pending, ref, onSubmit } = useFormAction(login);
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/profil"} />
      <Field label="E-Mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.values?.email} />
      </Field>
      <Field label="Passwort" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormMessage error={state?.error} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Anmelden …" : "Anmelden"}
      </Button>
      <div className="flex justify-between text-sm text-zinc-400">
        <Link href="/passwort-vergessen" className="underline">
          Passwort vergessen?
        </Link>
        <Link href="/registrieren" className="text-accent-soft underline">
          Konto anlegen
        </Link>
      </div>
    </form>
  );
}

export function ForgotForm() {
  const { state, pending, ref, onSubmit } = useFormAction(requestPasswordReset);
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-4">
      <Field label="E-Mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <FormMessage error={state?.error} done={state?.done} />
      <Button type="submit" disabled={pending} className="w-full">
        Link schicken
      </Button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const { state, pending, ref, onSubmit } = useFormAction(resetPassword);
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Field label="Neues Passwort" htmlFor="password" hint="Mindestens 8 Zeichen.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <FormMessage error={state?.error} />
      <Button type="submit" disabled={pending} className="w-full">
        Passwort speichern
      </Button>
    </form>
  );
}
