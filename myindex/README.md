# MyVita – App

Soziales Netzwerk für Lebenslauf, Portfolio und alle Kanäle einer Person. Next.js 16, React 19, TypeScript, Tailwind CSS, Drizzle ORM und Postgres.

## Was die App kann

- **Konten:** Registrierung mit Name, @Name, E-Mail und Passwort. Anmelden, Abmelden, Passwort vergessen (Link per E-Mail), Passwort ändern.
- **Profil:** Foto, Überschrift, Ort, Text über sich, Fähigkeiten, „Offen für Jobs“, „In der Suche auffindbar“. Jede Person bekommt eine feste MyVita-ID (z. B. `MV-7F3A9C2E`).
- **Kanäle:** Instagram, LinkedIn, YouTube, TikTok, GitHub, X, Website und mehr. Die Plattform wird an der Adresse erkannt. Die Reihenfolge lässt sich ändern.
- **Portfolio:** Projekte mit Titelbild, Beschreibung, Link und Stichworten.
- **Lebenslauf:** Erfahrung und Ausbildung mit Zeitraum.
- **Sichtbarkeit pro Eintrag:** öffentlich, nur über Bewerbungslinks oder privat.
- **Bewerbungslinks:** privater Link pro Bewerbung, läuft ab, zählt die Aufrufe.
- **Netzwerk:** Suche nach Name, @Name, MyVita-ID, Fähigkeit oder Ort. Anderen folgen.
- **Mich im Netz finden:** sucht im öffentlichen Netz nach dem eigenen Profilnamen. Treffer lassen sich mit einem Klick als Kanal übernehmen. Nach fremden Personen kann man damit nicht suchen.
- **Datenschutz:** Daten als JSON herunterladen, Konto mit allen Daten löschen, Impressum- und Datenschutzseite.

| Adresse | Seite |
| --- | --- |
| `/` | Startseite |
| `/registrieren`, `/anmelden` | Konto |
| `/@name` | Öffentliche Vita |
| `/id/MV-XXXXXXXX` | Kurzadresse über die MyVita-ID |
| `/suche` | Mitglieder finden |
| `/profil/…` | Eigenes Profil bearbeiten |
| `/b/<token>` | Bewerbungslink |

## Lokal starten

Du brauchst Node.js 22 und eine Postgres-Datenbank.

```bash
cd myindex
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Danach läuft die App unter http://localhost:3000. Ohne `RESEND_API_KEY` werden E-Mails (z. B. „Passwort vergessen“) nicht verschickt, sondern im Terminal ausgegeben.

Im GitHub Codespace läuft die Datenbank automatisch mit (siehe `.devcontainer`).

## Datenbank ändern

1. Tabellen in `lib/db/schema.ts` anpassen.
2. `npm run db:generate` erzeugt eine neue Migration in `drizzle/`.
3. `npm run db:migrate` spielt sie in die Datenbank ein.

## Online stellen: Supabase + Cloudflare

### 1. Datenbank bei Supabase

1. Auf [supabase.com](https://supabase.com) mit GitHub anmelden und ein neues Projekt anlegen. Region: **Frankfurt (eu-central-1)**.
2. Unter **Connect** den Connection String **Transaction pooler** (Port 6543) kopieren und das Passwort einsetzen.
3. Einmal die Tabellen anlegen:

   ```bash
   DATABASE_URL="postgres://…pooler.supabase.com:6543/postgres" npm run db:migrate
   ```

### 2. App bei Cloudflare

1. Auf [dash.cloudflare.com](https://dash.cloudflare.com) anmelden.
2. **Workers & Pages → Create → Import a repository** und dieses GitHub-Repository wählen.
3. Einstellungen:
   - Root directory: `myindex`
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
4. Unter **Settings → Variables and Secrets** eintragen:
   - `DATABASE_URL`: der Supabase-Connection-String von oben (als Secret)
   - `APP_URL`: die öffentliche Adresse, z. B. `https://myvita.example.workers.dev`
   - optional `RESEND_API_KEY` und `MAIL_FROM` für E-Mails
5. Deployen. Ab dann geht jede Änderung auf GitHub automatisch online.

Lokal wie bei Cloudflare testen: `.dev.vars` mit `DATABASE_URL` und `APP_URL` anlegen, dann `npm run cf:preview`.

### 3. E-Mails (Passwort vergessen)

Bei [resend.com](https://resend.com) ein Konto anlegen, die eigene Domain bestätigen und den API-Schlüssel als `RESEND_API_KEY` eintragen. `MAIL_FROM` z. B. `MyVita <noreply@deine-domain.de>`.

### 4. Vor dem Start

- Impressum (`app/impressum/page.tsx`) und Datenschutz (`app/datenschutz/page.tsx`) ausfüllen. Die gelb markierten Stellen sind Platzhalter.
- Die Suche „Mich im Netz finden“ nutzt öffentliche Suchseiten. Bei Cloudflare fehlt dafür der eingebaute Browser, deshalb liefert sie dort weniger Treffer als lokal.
