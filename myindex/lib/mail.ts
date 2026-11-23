import "server-only";

/** Schickt eine E-Mail über Resend. Ohne Schlüssel landet sie im Server-Log, damit lokal alles testbar bleibt. */
export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[mail] an ${to}: ${subject}\n${text}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM ?? "MyVita <noreply@example.com>", to, subject, text }),
  });
  if (!response.ok) throw new Error("Die E-Mail ließ sich nicht senden. Versuch es später noch einmal.");
}

export function appUrl(path: string): string {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}
