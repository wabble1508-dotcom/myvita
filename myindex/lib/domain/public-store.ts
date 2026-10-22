import type { FootprintCategory } from "@/lib/domain/types";

const BLOCKED_HOST_PARTS = [
  "haveibeenpwned",
  "dehashed",
  "leakcheck",
  "snusbase",
  "intelx",
  "weleakinfo",
  "leak-lookup",
  "leaklookup",
  "psbdmp",
  "breachforums",
  "raidforums",
];

/**
 * Die Sammlung enthält öffentliche Seiten zum Namen.
 * Passwort- und Datenleck-Seiten bleiben draußen.
 */
export function isPubliclyFindable(category: FootprintCategory, domain: string): boolean {
  if (category === "DATA_LEAK") return false;
  const host = domain.toLowerCase();
  return !BLOCKED_HOST_PARTS.some((part) => host.includes(part));
}
