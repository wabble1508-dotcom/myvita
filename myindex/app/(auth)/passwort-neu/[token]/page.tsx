import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Neues Passwort", robots: { index: false } };

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight text-white">Neues Passwort</h1>
      <p className="mt-2 mb-8 text-sm leading-6 text-zinc-400">Danach bist du direkt angemeldet.</p>
      <ResetForm token={token} />
    </>
  );
}
