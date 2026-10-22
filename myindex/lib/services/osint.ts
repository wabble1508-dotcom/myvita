import type { ScanInput } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { type RawHit } from "@/lib/services/normalizer";

/**
 * Lokale Beispielseiten für die Startperson.
 * Die echte Suche liegt in public-search.ts und fragt das öffentliche Web ab.
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
        { label: "Herkunft", value: "Beispiel auf diesem Rechner" },
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
        { label: "Herkunft", value: "Beispiel auf diesem Rechner" },
        { label: "Seite", value: "GitHub-Profil" },
        { label: "Nutzername", value: `example-simulated-${handle}` },
        { label: "Text auf der Seite", value: "Bio und eine Liste öffentlicher Repositories." },
      ],
    },
    {
      url: `https://x.com/example_simulated_${handle}`,
      title: `${name} auf X`,
      snippet: `Öffentliche Profilseite mit Beiträgen von ${name}.`,
      facts: [
        { label: "Herkunft", value: "Beispiel auf diesem Rechner" },
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
        { label: "Herkunft", value: "Beispiel auf diesem Rechner" },
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
        { label: "Herkunft", value: "Beispiel auf diesem Rechner" },
        { label: "Seite", value: "Lokaler Beitrag" },
        { label: "Überschrift", value: `Lokalmeldung nennt ${name}` },
        { label: "Textstelle", value: `${name} wird in einem Absatz genannt.` },
      ],
    },
  ];

  return hits;
}
