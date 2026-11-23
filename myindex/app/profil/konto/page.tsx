import { Download, LogOut } from "lucide-react";
import { DeleteAccountForm, PasswordForm } from "@/components/editor/account-forms";
import { PageTitle } from "@/components/editor/shared";
import { buttonVariants } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { requireViewer } from "@/lib/auth/session";

export default async function AccountPage() {
  const viewer = await requireViewer();
  return (
    <>
      <PageTitle title="Konto" />
      <div className="space-y-6">
        <Box title="Anmeldung">
          <p className="text-sm text-zinc-300">
            E-Mail: <span className="text-white">{viewer.email}</span> · MyVita-ID: <span className="font-mono text-white">{viewer.publicId}</span>
          </p>
          <form action={logout} className="mt-4">
            <button className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <LogOut className="size-3.5" /> Abmelden
            </button>
          </form>
        </Box>
        <Box title="Passwort">
          <PasswordForm />
        </Box>
        <Box title="Deine Daten">
          <p className="mb-4 text-sm leading-6 text-zinc-400">Alles, was du bei MyVita eingetragen hast, als Datei (JSON).</p>
          <a href="/profil/export" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <Download className="size-3.5" /> Daten herunterladen
          </a>
        </Box>
        <Box title="Konto löschen" danger>
          <p className="mb-4 text-sm leading-6 text-zinc-400">
            Löscht dein Profil, alle Einträge, Bilder und Bewerbungslinks sofort. Das lässt sich nicht rückgängig machen.
          </p>
          <DeleteAccountForm handle={viewer.handle} />
        </Box>
      </div>
    </>
  );
}

function Box({ title, danger, children }: { title: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border p-5 ${danger ? "border-rose-400/20 bg-rose-500/[0.04]" : "border-white/10 bg-white/[0.03]"}`}>
      <h2 className="mb-4 text-base font-medium text-white">{title}</h2>
      {children}
    </section>
  );
}
