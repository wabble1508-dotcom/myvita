import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-medium tracking-tight text-white">{title}</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-300 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-medium [&_h2]:text-white">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** Markiert Angaben, die der Betreiber selbst eintragen muss. */
export function Fill({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-amber-300/15 px-1.5 py-0.5 text-amber-100">[{children}]</span>;
}
