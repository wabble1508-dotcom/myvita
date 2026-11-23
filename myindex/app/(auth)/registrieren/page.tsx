import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/auth-forms";
import { getViewer } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Registrieren" };

export default async function SignupPage() {
  if (await getViewer()) redirect("/profil");
  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight text-white">Deine Vita anlegen</h1>
      <p className="mt-2 mb-8 text-sm leading-6 text-zinc-400">
        Ein Profil für Lebenslauf, Projekte und alle deine Kanäle. Kostenlos.
      </p>
      <SignupForm />
    </>
  );
}
