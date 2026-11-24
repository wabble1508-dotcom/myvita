// Erzeugt SQL mit erfundenen Beispielprofilen zum Vorführen. Keine echten Personen.
// Aufruf: node scripts/demo-seed.mjs > demo.sql, dann wrangler d1 execute DB --file demo.sql (--local oder --remote)
const now = Date.now();
const q = (value) => (value === null ? "NULL" : `'${String(value).replace(/'/g, "''")}'`);
const json = (list) => q(JSON.stringify(list));
let n = 0;
const id = (prefix) => `demo_${prefix}_${(n += 1)}`;

const people = [
  {
    handle: "lena.berger", publicId: "MV-4K7Q2HXR", name: "Lena Berger", location: "Berlin", open: true,
    headline: "UX-Designerin für Apps im Gesundheitswesen",
    bio: "Ich gestalte Apps, die Patientinnen und Praxen den Alltag leichter machen. Vorher Agentur, heute Produktteam.",
    skills: ["Figma", "Prototyping", "Nutzertests", "React"],
    links: ["https://instagram.com/lena.berger.beispiel", "https://linkedin.com/in/lena-berger-beispiel", "https://dribbble.com/lenaberger-beispiel"],
    projects: [
      ["Praxis-App „Termin+“", "Terminbuchung für Arztpraxen. Ich habe das komplette Design und die Nutzertests verantwortet.", ["Figma", "React"]],
      ["Redesign Patientenportal", "Neue Navigation und barrierefreie Formulare. Die Abbruchquote sank um ein Drittel.", ["UX", "Barrierefreiheit"]],
    ],
    cv: [["experience", "UX-Designerin", "Gesund Digital GmbH", "2023-04", ""], ["experience", "Junior Designerin", "Pixelwerk Agentur", "2021-02", "2023-03"], ["education", "B.A. Kommunikationsdesign", "UdK Berlin", "2017-10", "2021-01"]],
  },
  {
    handle: "jonas.okafor", publicId: "MV-7HN3PQ2D", name: "Jonas Okafor", location: "Hamburg", open: false,
    headline: "Full-Stack-Entwickler · TypeScript, Node.js, Cloud",
    bio: "Ich baue Web-Apps von der Datenbank bis zum Button. Nebenbei Open Source und Mentor bei einem Coding-Bootcamp.",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Cloudflare"],
    links: ["https://github.com/jonas-okafor-beispiel", "https://linkedin.com/in/jonas-okafor-beispiel", "https://jonas-okafor.example"],
    projects: [
      ["Kassenbuch – Budget-App", "Haushaltsbuch für WG und Familie mit geteilten Ausgaben. 2.000 aktive Nutzer.", ["Next.js", "PostgreSQL"]],
      ["deploy-check (Open Source)", "Kommandozeilen-Tool, das vor dem Deployment typische Fehler findet.", ["Node.js", "CLI"]],
    ],
    cv: [["experience", "Senior Software Engineer", "Hafenlogistik Digital", "2022-01", ""], ["experience", "Werkstudent Webentwicklung", "Shopwerk", "2019-04", "2021-12"], ["education", "B.Sc. Informatik", "TU Hamburg", "2016-10", "2021-09"]],
  },
  {
    handle: "selin.yildiz", publicId: "MV-2RZ8KWMC", name: "Selin Yıldız", location: "Köln", open: false,
    headline: "Content Creatorin & Videoproduzentin",
    bio: "Kurzvideos, Reels und YouTube-Serien für Marken aus Mode und Food. Von der Idee bis zum Schnitt.",
    skills: ["Videoschnitt", "Premiere Pro", "Social Media", "Storytelling"],
    links: ["https://youtube.com/@selin.yildiz.beispiel", "https://instagram.com/selin.yildiz.beispiel", "https://tiktok.com/@selin.yildiz.beispiel"],
    projects: [
      ["Serie „Kochen unter 5 €“", "YouTube-Serie mit 12 Folgen für eine Supermarktkette, über 400.000 Aufrufe.", ["YouTube", "Food"]],
      ["Reels-Kampagne Sneaker-Launch", "15 Reels in zwei Wochen, gedreht mit dem Smartphone.", ["Instagram", "Mode"]],
    ],
    cv: [["experience", "Freie Videoproduzentin", "Selbstständig", "2021-06", ""], ["education", "Mediengestalterin Bild und Ton", "IHK Köln", "2018-08", "2021-06"]],
  },
  {
    handle: "marco.rossi", publicId: "MV-9TX4BVLE", name: "Marco Rossi", location: "München", open: true,
    headline: "Fotograf für Architektur und Produkte",
    bio: "Klare Bilder für Architekturbüros, Möbelhersteller und Onlineshops.",
    skills: ["Fotografie", "Lightroom", "Architektur", "Produktfotos"],
    links: ["https://instagram.com/marco.rossi.beispiel", "https://behance.net/marcorossi-beispiel", "https://marco-rossi.example"],
    projects: [["Bildband „Neue Höfe“", "Serie über umgebaute Bauernhöfe in Oberbayern, ausgestellt in drei Galerien.", ["Architektur"]]],
    cv: [["experience", "Freier Fotograf", "Studio Rossi", "2019-01", ""], ["education", "Fotografenmeister", "HWK München", "2016-09", "2018-07"]],
  },
  {
    handle: "amira.haddad", publicId: "MV-5DM6QJRA", name: "Amira Haddad", location: "Dortmund", open: true,
    headline: "Pflegefachfrau · Studium Gesundheitsmanagement",
    bio: "Sechs Jahre Intensivpflege. Jetzt berufsbegleitend im Studium und offen für Stellen im Klinikmanagement.",
    skills: ["Intensivpflege", "Teamleitung", "Qualitätsmanagement"],
    links: ["https://linkedin.com/in/amira-haddad-beispiel", "https://xing.com/profile/Amira_Haddad_Beispiel"],
    projects: [["Einarbeitungskonzept Intensivstation", "Leitfaden für neue Pflegekräfte, seit 2024 im Einsatz.", ["Pflege", "Konzept"]]],
    cv: [["experience", "Pflegefachfrau Intensivstation", "Klinikum Dortmund", "2019-10", ""], ["education", "B.A. Gesundheitsmanagement", "FH Dortmund", "2024-10", ""], ["education", "Ausbildung Pflegefachfrau", "Pflegeschule Dortmund", "2016-10", "2019-09"]],
  },
  {
    handle: "tim.schuster", publicId: "MV-8WC2HKNT", name: "Tim Schuster", location: "Leipzig", open: false,
    headline: "Azubi Mechatroniker · Technik-Videos auf TikTok",
    bio: "Im dritten Lehrjahr. Ich zeige auf TikTok, wie ich Sachen repariere und umbaue.",
    skills: ["Mechatronik", "Löten", "3D-Druck", "Video"],
    links: ["https://tiktok.com/@tim.schuster.beispiel", "https://instagram.com/tim.schuster.beispiel"],
    projects: [["Gokart mit E-Motor", "Altes Gokart auf Elektroantrieb umgebaut, mit selbst gedrucktem Akkugehäuse.", ["3D-Druck", "Elektronik"]]],
    cv: [["experience", "Auszubildender Mechatroniker", "Werkzeugbau Leipzig", "2023-09", ""], ["education", "Realschulabschluss", "Oberschule Leipzig-Ost", "2017-08", "2023-07"]],
  },
];

const out = ["DELETE FROM users WHERE id LIKE 'demo\\_%' ESCAPE '\\';"];
people.forEach((p, i) => {
  const userId = `demo_user_${i + 1}`;
  const t = now - i * 3600_000;
  const searchText = [p.name, p.handle, p.headline, p.location, ...p.skills].join(" | ").toLowerCase();
  out.push(`INSERT INTO users (id, email, password_hash, created_at) VALUES (${q(userId)}, ${q(`${p.handle}@beispiel.myvita`)}, 'demo-kein-login', ${t});`);
  out.push(
    `INSERT INTO profiles (user_id, handle, public_id, display_name, headline, bio, location, skills, avatar_id, open_to_work, searchable, search_text, is_demo, created_at, updated_at) VALUES (${q(userId)}, ${q(p.handle)}, ${q(p.publicId)}, ${q(p.name)}, ${q(p.headline)}, ${q(p.bio)}, ${q(p.location)}, ${json(p.skills)}, NULL, ${p.open ? 1 : 0}, 1, ${q(searchText)}, 1, ${t}, ${t});`,
  );
  p.links.forEach((url, position) =>
    out.push(`INSERT INTO links (id, user_id, url, label, visibility, position, created_at) VALUES (${q(id("link"))}, ${q(userId)}, ${q(url)}, '', 'public', ${position}, ${t});`),
  );
  p.projects.forEach(([title, description, tags], position) =>
    out.push(`INSERT INTO projects (id, user_id, title, description, url, image_id, tags, visibility, position, created_at) VALUES (${q(id("project"))}, ${q(userId)}, ${q(title)}, ${q(description)}, '', NULL, ${json(tags)}, 'public', ${position}, ${t});`),
  );
  p.cv.forEach(([kind, title, org, start, end]) =>
    out.push(`INSERT INTO cv_entries (id, user_id, kind, title, organization, location, start_date, end_date, description, visibility, created_at) VALUES (${q(id("cv"))}, ${q(userId)}, ${q(kind)}, ${q(title)}, ${q(org)}, '', ${q(start)}, ${q(end)}, '', 'public', ${t});`),
  );
});
// Ein paar Verbindungen, damit Follower-Zahlen nicht leer sind.
for (const [a, b] of [[2, 1], [3, 1], [5, 1], [1, 2], [4, 3], [6, 3], [1, 5]]) {
  out.push(`INSERT INTO follows (follower_id, followee_id, created_at) VALUES ('demo_user_${a}', 'demo_user_${b}', ${now});`);
}
console.log(out.join("\n"));
