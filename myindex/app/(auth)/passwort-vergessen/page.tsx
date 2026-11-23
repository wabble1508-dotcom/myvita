import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Passwort vergessen" };

export default function ForgotPage() {
  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight text-white">Passwort vergessen</h1>
      <p className="mt-2 mb-8 text-sm leading-6 text-zinc-400">
        Trag deine E-Mail ein. Du bekommst einen Link, über den du ein neues Passwort festlegst.
      </p>
      <ForgotForm />
    </>
  );
}
