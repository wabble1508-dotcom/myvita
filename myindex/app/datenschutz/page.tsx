import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Datenschutz" };

// Grundgerüst. Vor dem Start von einer Fachperson oder einem Generator prüfen und ergänzen lassen.
export default function PrivacyPage() {
  return (
    <LegalPage title="Datenschutz">
      <h2>Verantwortlich</h2>
      <p>
        <Fill>Name, Anschrift und E-Mail des Betreibers</Fill>
      </p>
      <h2>Was MyVita speichert</h2>
      <p>
        Für dein Konto: E-Mail-Adresse und ein verschlüsselter Passwort-Hash. Für deine Vita: was du selbst einträgst, also Name, @Name,
        Profilfoto, Überschrift, Ort, Text über dich, Fähigkeiten, Links, Projekte, Lebenslauf-Einträge und Bewerbungslinks. Wem du folgst
        und wer dir folgt.
      </p>
      <p>
        Für die Anmeldung setzt MyVita ein technisch notwendiges Cookie (<code>mv_session</code>). Es gibt keine Werbe- oder
        Tracking-Cookies.
      </p>
      <h2>Wer was sieht</h2>
      <p>
        Bei jedem Eintrag bestimmst du selbst: öffentlich, nur über Bewerbungslinks oder privat. In den Einstellungen kannst du dein Profil
        aus der Suche nehmen.
      </p>
      <h2>Suche nach dir selbst</h2>
      <p>
        Mit „Mich im Netz finden“ fragt MyVita öffentliche Suchmaschinen nach deinem Profilnamen. Ergebnisse werden nur gespeichert, wenn du
        sie übernimmst. Nach anderen Personen lässt sich so nicht suchen.
      </p>
      <h2>Deine Rechte</h2>
      <p>
        Unter „Konto“ lädst du alle deine Daten herunter oder löschst dein Konto mit allen Daten sofort. Für weitere Fragen zu Auskunft,
        Berichtigung, Löschung oder Widerspruch schreib an <Fill>Kontakt-E-Mail</Fill>. Du kannst dich bei einer
        Datenschutz-Aufsichtsbehörde beschweren.
      </p>
      <h2>Dienstleister</h2>
      <p>
        Hosting: <Fill>Cloudflare, Inc.</Fill>. Datenbank: <Fill>Supabase, Region z. B. Frankfurt</Fill>. E-Mail-Versand:{" "}
        <Fill>Resend, falls genutzt</Fill>.
      </p>
    </LegalPage>
  );
}
