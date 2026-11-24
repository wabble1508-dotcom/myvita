# MyVita – App

Soziales Netzwerk für Lebenslauf, Portfolio und alle Kanäle einer Person. Next.js 16, React 19, TypeScript, Tailwind CSS, Drizzle ORM und Cloudflare D1 (SQLite). Läuft komplett im kostenlosen Cloudflare-Tarif.

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

Du brauchst Node.js 22. Eine Datenbank musst du nicht installieren: wrangler legt lokal eine D1-Datenbank an.

```bash
cd myindex
npm install
npm run db:migrate:local
node scripts/demo-seed.mjs > .wrangler/demo.sql && npx wrangler d1 execute DB --local --file .wrangler/demo.sql
npm run dev
```

Danach läuft die App unter http://localhost:3000, mit sechs Beispielprofilen. Ohne `RESEND_API_KEY` werden E-Mails (z. B. „Passwort vergessen“) nicht verschickt, sondern im Terminal ausgegeben.

So wie bei Cloudflare testen: `npm run cf:preview`.

## Datenbank ändern

1. Tabellen in `lib/db/schema.ts` anpassen.
2. `npm run db:generate` erzeugt eine neue Migration in `drizzle/`.
3. `npm run db:migrate:local` spielt sie lokal ein, `npm run db:migrate:remote` in die echte Datenbank.

## Online bei Cloudflare (kostenlos)

Die Datenbank `myvita` (D1, Westeuropa) ist schon angelegt und in `wrangler.jsonc` eingetragen, mit Tabellen und Beispielprofilen.

1. Auf [dash.cloudflare.com](https://dash.cloudflare.com) **Workers & Pages → Create → Import a repository** wählen und das GitHub-Repository `myvita` verbinden.
2. Einstellungen:
   - Project name: `myvita` (muss zum Namen in `wrangler.jsonc` passen)
   - Root directory: `myindex`
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
3. **Deploy**. Danach geht jede Änderung auf GitHub automatisch online.
4. Die Adresse (`myvita.<dein-name>.workers.dev`) in `wrangler.jsonc` bei `APP_URL` eintragen.

Eigene Domain später: **Workers & Pages → myvita → Settings → Domains & Routes → Add → Custom domain**.

### E-Mails (Passwort vergessen)

Bei [resend.com](https://resend.com) ein Konto anlegen, die eigene Domain bestätigen und den API-Schlüssel als `RESEND_API_KEY` als Secret beim Worker eintragen. `MAIL_FROM` z. B. `MyVita <noreply@deine-domain.de>`.

### Vor dem Start

- Impressum und Datenschutz nutzen die Betreiberangaben aus `lib/operator.ts` (PS Professional Solutions). In `app/datenschutz/page.tsx` ist nur noch der E-Mail-Dienst gelb markiert: eintragen, sobald Resend genutzt wird, sonst den Absatz löschen.
- Bei Cloudflare den Vertrag zur Auftragsverarbeitung (DPA) abschließen. Die Datenschutzseite geht davon aus, dass es ihn gibt.
- Die Suche „Mich im Netz finden“ nutzt öffentliche Suchseiten. Bei Cloudflare fehlt dafür der eingebaute Browser, deshalb liefert sie dort weniger Treffer als lokal.
