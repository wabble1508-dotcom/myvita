import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OpenInWorkspace } from "@/components/identity/open-in-workspace";
import { ReleasedPages } from "@/components/profile/released-pages";
import { VERIFICATION_LABEL } from "@/lib/domain/categories";
import { normalizePublicId } from "@/lib/domain/public-id";
import { readPerson } from "@/lib/services/profile";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ publicId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const person = readPerson(publicId);
  const title = person ? `${person.fullName} · ${person.publicId}` : "Personen-ID";
  const description = person
    ? `Abruf von ${person.fullName} über die ID ${person.publicId}.`
    : "Abruf einer Person über ihre MyVita-ID.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description },
  };
}

export default async function PersonByIdPage({ params }: PageProps) {
  const { publicId } = await params;
  const canonical = normalizePublicId(publicId);
  if (!canonical) notFound();
  if (canonical !== publicId) redirect(`/id/${canonical}`);

  const person = readPerson(canonical);
  if (!person) notFound();

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-stone-950">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal-800">MyVita</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{person.fullName}</h1>
        <p className="mt-4 font-mono text-sm text-teal-800">{person.publicId}</p>
        <p className="mt-1 max-w-xl text-sm leading-6 text-stone-500">
          Abruf über diese ID. Ein gleicher Name kann eine andere ID haben.
        </p>
        {person.headline ? <p className="mt-3 text-xl text-stone-600">{person.headline}</p> : null}
        <p className="mt-4 text-sm text-stone-500">{VERIFICATION_LABEL[person.verificationLevel]}</p>
        {person.bio ? <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">{person.bio}</p> : null}
        <div className="mt-4">
          <OpenInWorkspace publicId={person.publicId} />
        </div>
        <ReleasedPages
          sections={person.sections}
          empty="Zu dieser ID sind keine öffentlichen Seiten freigegeben."
        />
        <footer className="mt-14 border-t border-stone-200 pt-5 text-sm leading-6 text-stone-500">
          Diese Seite zeigt die gespeicherten Seiten der ID {person.publicId}. Es sind die Seiten, die öffentlich gefunden
          werden sollen. Die Einträge sind simuliert, keine Live-Treffer aus dem Web.
        </footer>
      </div>
    </main>
  );
}
