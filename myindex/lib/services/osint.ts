import { createHash } from "node:crypto";
import type { ScanInput } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { type RawHit } from "@/lib/services/normalizer";

/**
 * Lokaler Platzhalter für eine Suchtreffer-Liste.
 * Es geht kein Aufruf an Google, SerpAPI oder ein anderes Netz.
 * Die Treffer sind Beispielseiten, wie sie zu einem Namen im Netz liegen können.
 * Jede Seite wird danach in eine Rubrik sortiert. Seiten zu Studium oder Papers
 * fehlen hier, weil so eine Seite bei diesem Namen nicht dabei ist.
 */
export function simulateSerp(input: ScanInput): RawHit[] {
  const slug = slugify(input.fullName);
  const handle = (input.handle ?? slug.replace(/-/g, "")).slice(0, 40);
  const name = input.fullName.trim();

  const hits: RawHit[] = [
    {
      url: `https://www.linkedin.com/in/example-simulated-${slug}`,
      title: `${name} auf LinkedIn`,
      snippet: `Öffentliche Profilseite, auf der ${name} steht.`,
      facts: [
        { label: "Seite", value: "LinkedIn-Profil" },
        { label: "Name auf der Seite", value: name },
        { label: "Text auf der Seite", value: "Kurzer öffentlicher Profiltext und ein Ort." },
        { label: "Ort", value: "Berlin" },
      ],
    },
    {
      url: `https://github.com/example-simulated-${handle}`,
      title: `${name} auf GitHub`,
      snippet: `Öffentliche Profilseite mit Repositories zu ${name}.`,
      facts: [
        { label: "Seite", value: "GitHub-Profil" },
        { label: "Nutzername", value: `example-simulated-${handle}` },
        { label: "Text auf der Seite", value: "Bio und eine Liste öffentlicher Repositories." },
      ],
    },
    {
      url: `https://www.instagram.com/example.simulated.${handle}`,
      title: `${name} auf Instagram`,
      snippet: `Öffentliche Profilseite zu ${name}.`,
      facts: [
        { label: "Seite", value: "Instagram-Profil" },
        { label: "Nutzername", value: `@example.simulated.${handle}` },
        { label: "Name auf der Seite", value: name },
        { label: "Bio", value: "Ein Satz im öffentlichen Profil." },
        { label: "Beiträge", value: "auf der Seite zu sehen" },
      ],
    },
    {
      url: `https://www.facebook.com/example.simulated.${handle}`,
      title: `${name} auf Facebook`,
      snippet: `Öffentliche Profilseite, auf der der Name ${name} steht.`,
      facts: [
        { label: "Seite", value: "Facebook-Profil" },
        { label: "Name auf der Seite", value: name },
        { label: "Text auf der Seite", value: "Öffentliche Kurzinfo und ein Ort." },
        { label: "Ort", value: "Berlin" },
      ],
    },
    {
      url: `https://x.com/example_simulated_${handle}`,
      title: `${name} auf X`,
      snippet: `Öffentliche Profilseite mit Beiträgen von ${name}.`,
      facts: [
        { label: "Seite", value: "Profil auf X" },
        { label: "Nutzername", value: `@example_simulated_${handle}` },
        { label: "Name auf der Seite", value: name },
        { label: "Bio", value: "Ein Satz über der Beitragsliste." },
        { label: "Beiträge", value: "öffentlich auf der Seite" },
      ],
    },
    {
      url: `https://www.youtube.com/watch?v=example-simulated-${slug}`,
      title: `Erwähnung: ${name} in einem Video`,
      snippet: `Öffentliches Video, in dem ${name} im Titel oder in der Beschreibung vorkommt.`,
      facts: [
        { label: "Seite", value: "YouTube-Video" },
        { label: "Titel", value: `Ein öffentliches Video nennt ${name}` },
        { label: "Beschreibung", value: `${name} wird in der Videobeschreibung genannt.` },
      ],
    },
    {
      url: `https://news.example/lokal/${slug}`,
      title: `Erwähnung: ${name} in einem lokalen Beitrag`,
      snippet: `Öffentlicher Beitrag, in dem der Name ${name} einmal vorkommt.`,
      facts: [
        { label: "Seite", value: "Lokaler Beitrag" },
        { label: "Überschrift", value: `Lokalmeldung nennt ${name}` },
        { label: "Textstelle", value: `${name} wird in einem Absatz genannt.` },
      ],
    },
    {
      url: `https://forum.example/t/${slug}`,
      title: `Forenthread mit ${name}`,
      snippet: `Öffentlicher Thread. Der Name ${name} steht in einem Beitrag.`,
      facts: [
        { label: "Seite", value: "Forenthread" },
        { label: "Threadtitel", value: `Diskussion, in der ${name} vorkommt` },
        { label: "Textstelle", value: `Ein Beitrag erwähnt ${name} mit einem Satz.` },
      ],
    },
    {
      url: `https://comments.example/${slug}`,
      title: `Kommentar von ${name}`,
      snippet: `Öffentlicher Kommentar unter einem Beitrag, signiert mit ${name}.`,
      facts: [
        { label: "Seite", value: "Kommentar" },
        { label: "Angezeigter Name", value: name },
        { label: "Text", value: "Ein kurzer öffentlicher Kommentar." },
      ],
    },
    {
      url: `https://site.example/${slug}`,
      title: `Öffentliche Seite zu ${name}`,
      snippet: `Eine einzelne öffentliche Seite, auf der ${name} steht.`,
      facts: [
        { label: "Seite", value: "Eigene Seite" },
        { label: "Überschrift", value: name },
        { label: "Text auf der Seite", value: "Ein paar öffentliche Sätze und ein Kontaktformular." },
      ],
    },
  ];

  if (input.email) {
    const tag = createHash("sha256").update(input.email.trim().toLowerCase()).digest("hex").slice(0, 12);
    hits.push({
      url: `https://haveibeenpwned.com/#alert-${tag}`,
      title: "Hinweis aus einem Leak-Index",
      snippet:
        "Simulierter Datenleck-Hinweis. Ein öffentlicher Index würde die eingegebene E-Mail markieren. MyVita speichert keine Passwörter und keine Inhalte aus Datenlecks.",
      facts: [
        { label: "Art", value: "Datenleck-Hinweis" },
        { label: "Sichtbare Angabe", value: "E-Mail-Adresse in einem öffentlichen Index" },
        { label: "Passwort", value: "wird nicht übernommen" },
        { label: "Leak-Inhalt", value: "wird nicht übernommen" },
      ],
    });
  }

  return hits;
}
