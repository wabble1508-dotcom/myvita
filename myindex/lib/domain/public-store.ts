import type { FootprintCategory } from "@/lib/domain/types";

/**
 * Die Sammlung enthält nur Seiten, die öffentlich gefunden werden sollen.
 * Private Profile, nicht zugeordnete Seiten und Datenleck-Hinweise bleiben draußen.
 */
export function isPubliclyFindable(category: FootprintCategory, domain: string): boolean {
  if (category === "DATA_LEAK" || category === "OTHER" || category === "PUBLIC_RECORD") return false;
  const host = domain.toLowerCase();
  if (host.includes("instagram") || host.includes("facebook") || host.includes("portfolio")) return false;
  return true;
}
