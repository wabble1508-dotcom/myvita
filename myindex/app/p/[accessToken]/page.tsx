import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReleasedPages } from "@/components/profile/released-pages";
import { VERIFICATION_LABEL } from "@/lib/domain/categories";
import { formatWhen } from "@/lib/format";
import { readSharedVita, recordSharedView } from "@/lib/services/profile";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ accessToken: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { accessToken } = await params;
  const page = readSharedVita(accessToken);
  const title = page.status === "ok" ? `${page.vita.fullName} · ${page.vita.publicId}` : "Geteilte Ansicht";
  const description =
    page.status === "ok" ? page.vita.headline || "Geteilte Personenansicht aus MyVita." : "Geteilte Personenansicht aus MyVita.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description },
  };
}

export default async function PublicVitaPage({ params }: PageProps) {
  const { accessToken } = await params;
  const page = await recordSharedView(accessToken);

  if (page.status === "missing") notFound();

  if (page.status === "expired") {
    return (
      <Document>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">MyVita</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Dieser Link ist abgelaufen</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-stone-600">
          Er endete am {formatWhen(page.expiresAt)}. Bitte die Person, die ihn geschickt hat, um einen neuen.
        </p>
      </Document>
    );
  }

  const vita = page.vita;

  return (
    <Document>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal-800">MyVita</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{vita.fullName}</h1>
      <p className="mt-4 font-mono text-sm text-teal-800">{vita.publicId}</p>
      <p className="mt-1 text-sm text-stone-500">Abruf über diese ID. Ein gleicher Name kann eine andere ID haben.</p>
      {vita.headline ? <p className="mt-3 text-xl text-stone-600">{vita.headline}</p> : null}
      <p className="mt-4 text-sm text-stone-500">{VERIFICATION_LABEL[vita.verificationLevel]}</p>
      {vita.bio ? <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">{vita.bio}</p> : null}
      <ReleasedPages sections={vita.sections} />
      <footer className="mt-14 border-t border-stone-200 pt-5 text-sm leading-6 text-stone-500">
        Geteilte Seiten der ID {vita.publicId}. Die Einträge sind simuliert, keine Live-Treffer aus dem Web. Private Funde
        fehlen. Dieser Link läuft am {formatWhen(vita.expiresAt)} ab und wurde {vita.viewsCount} Mal geöffnet.
      </footer>
    </Document>
  );
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f3ec] text-stone-950">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">{children}</div>
    </main>
  );
}
