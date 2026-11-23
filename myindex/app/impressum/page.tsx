import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Impressum" };

// Die markierten Angaben muss der Betreiber vor dem Start eintragen (Pflicht nach § 5 DDG).
export default function ImprintPage() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben nach § 5 DDG</h2>
      <p>
        <Fill>Vor- und Nachname oder Firma</Fill>
        <br />
        <Fill>Straße und Hausnummer</Fill>
        <br />
        <Fill>PLZ und Ort</Fill>
      </p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: <Fill>Kontakt-E-Mail</Fill>
      </p>
      <h2>Verantwortlich für den Inhalt</h2>
      <p>
        <Fill>Name und Anschrift wie oben</Fill>
      </p>
      <p>Für Inhalte auf Mitgliederprofilen sind die jeweiligen Mitglieder verantwortlich.</p>
    </LegalPage>
  );
}
