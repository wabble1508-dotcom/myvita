import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/site/legal-page";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = { title: "Datenschutz" };

// Vor dem Start von einer Fachperson prüfen lassen. Gelb markiert: hängt davon ab, welche Dienste wirklich genutzt werden.
export default function PrivacyPage() {
  return (
    <LegalPage title="Datenschutz">
      <h2>Verantwortlich</h2>
      <p>
        {OPERATOR.company}, Inhaber {OPERATOR.owner}, {OPERATOR.street}, {OPERATOR.city}, {OPERATOR.country}. Telefon: {OPERATOR.phone},
        E-Mail: <a href={`mailto:${OPERATOR.email}`} className="underline">{OPERATOR.email}</a>
      </p>
      <p>
        Ein Datenschutzbeauftragter ist nicht bestellt, da wir hierzu gesetzlich nicht verpflichtet sind. Bei Fragen zum Datenschutz
        wende dich an die oben genannte E-Mail-Adresse.
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
        Berichtigung, Löschung oder Widerspruch schreib an{" "}
        <a href={`mailto:${OPERATOR.email}`} className="underline">{OPERATOR.email}</a>. Du kannst dich bei einer
        Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der Landesbeauftragten für Datenschutz und Informationsfreiheit
        Nordrhein-Westfalen (LDI NRW).
      </p>
      <h2>Dienstleister</h2>
      <p>
        Hosting und Datenbank: Cloudflare, Inc. (USA). Cloudflare liefert die Seiten aus und verarbeitet dabei technisch nötige Daten wie
        die IP-Adresse. Die Datenbank (Cloudflare D1) liegt in Westeuropa. Mit Cloudflare besteht ein Vertrag zur Auftragsverarbeitung;
        für Übermittlungen in die USA gelten die EU-Standardvertragsklauseln.
      </p>
      <p>
        E-Mail-Versand (z. B. „Passwort vergessen“): <Fill>Resend, Inc. (USA), falls genutzt</Fill>.
      </p>
    </LegalPage>
  );
}
