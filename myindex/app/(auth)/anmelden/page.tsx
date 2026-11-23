import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/auth-forms";
import { getViewer } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getViewer()) redirect("/profil");
  const { next } = await searchParams;
  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight text-white">Willkommen zurück</h1>
      <p className="mt-2 mb-8 text-sm leading-6 text-zinc-400">Melde dich an, um deine Vita zu bearbeiten.</p>
      <LoginForm next={next} />
    </>
  );
}
