import { createHash } from "node:crypto";

export function localDid(email: string): string {
  const digest = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return `did:key:${digest}`;
}
