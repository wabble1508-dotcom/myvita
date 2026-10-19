/** Feste Beispiel-ID der lokalen Startperson. */
export const DEMO_PUBLIC_ID = "MV-7F3A9C2E";

const BODY = /^[A-Z0-9]{8}$/;

/** Liest eine Personen-ID aus einem Kürzel oder einer Adresse. */
export function normalizePublicId(value: string): string | null {
  const labeled = value.trim().toUpperCase().match(/MV[^A-Z0-9]*([A-Z0-9]{8})/);
  if (labeled?.[1] && BODY.test(labeled[1])) return `MV-${labeled[1]}`;
  const compact = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (BODY.test(compact)) return `MV-${compact}`;
  return null;
}
