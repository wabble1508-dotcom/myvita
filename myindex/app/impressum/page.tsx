import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = { title: "Impressum" };

export default function ImprintPage() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {OPERATOR.company}
        <br />
        Inhaber: {OPERATOR.owner}
        <br />
        {OPERATOR.street}
        <br />
        {OPERATOR.city}
        <br />
        {OPERATOR.country}
      </p>
      <h2>Kontakt</h2>
      <p>
        Telefon: <a href={OPERATOR.phoneHref} className="underline">{OPERATOR.phone}</a>
        <br />
        E-Mail: <a href={`mailto:${OPERATOR.email}`} className="underline">{OPERATOR.email}</a>
        <br />
        Website: <a href={OPERATOR.website} className="underline">{OPERATOR.website.replace("https://", "")}</a>
      </p>
      <p>Umsatzsteuer: Kleinunternehmer im Sinne von § 19 UStG.</p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        {OPERATOR.owner}, {OPERATOR.street}, {OPERATOR.city}
      </p>
      <h2>Inhalte von Mitgliedern</h2>
      <p>
        Für die Inhalte auf Mitgliederprofilen sind die jeweiligen Mitglieder verantwortlich. Wenn dir ein rechtswidriger Inhalt auffällt,
        schreib an <a href={`mailto:${OPERATOR.email}`} className="underline">{OPERATOR.email}</a>. Wir prüfen den Hinweis und entfernen
        rechtswidrige Inhalte umgehend.
      </p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      <h2>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
        verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
        Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>
      <h2>Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die
        Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
        schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
      </p>
    </LegalPage>
  );
}
