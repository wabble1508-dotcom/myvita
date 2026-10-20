import "server-only";
import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createPublicId(used: ReadonlySet<string>): string {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const bytes = randomBytes(8);
    let body = "";
    for (let index = 0; index < 8; index += 1) {
      body += ALPHABET[bytes[index]! % ALPHABET.length];
    }
    const id = `MV-${body}`;
    if (!used.has(id)) return id;
  }
  throw new Error("Es ließ sich keine freie Personen-ID erzeugen.");
}
