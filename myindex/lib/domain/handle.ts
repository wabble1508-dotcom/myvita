/** @Name: 3 bis 30 Zeichen, Kleinbuchstaben, Zahlen, Punkt und Unterstrich. */
export const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])$/;

/** Namen, die nach Seiten der App klingen oder sich als Team ausgeben könnten. */
const RESERVED = new Set([
  "admin", "administrator", "anmelden", "api", "app", "b", "bewerbung", "datenschutz", "einstellungen",
  "help", "hilfe", "id", "impressum", "konto", "login", "logout", "media", "myvita", "netzwerk", "passwort",
  "profil", "registrieren", "root", "settings", "suche", "support", "team", "u", "www",
]);

export function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

/** Fehlertext oder null, wenn der Name passt. */
export function handleProblem(handle: string): string | null {
  if (!HANDLE_PATTERN.test(handle)) {
    return "Der @Name hat 3 bis 30 Zeichen: Kleinbuchstaben, Zahlen, Punkt oder Unterstrich, nicht am Anfang oder Ende.";
  }
  if (RESERVED.has(handle)) return "Dieser @Name ist reserviert. Nimm einen anderen.";
  return null;
}

/** Vorschlag aus dem Namen: "Lena Müller" wird zu "lena.mueller". */
export function suggestHandle(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")
    .slice(0, 30).replace(/\.+$/, "");
  return base.length >= 3 ? base : `${base}.vita`.replace(/^\./, "");
}
