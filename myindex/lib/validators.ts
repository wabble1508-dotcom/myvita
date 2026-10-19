import { z } from "zod";
import { FOOTPRINT_CATEGORIES, VISIBILITIES } from "@/lib/domain/types";

function blankToUndefined(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export const scanInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Trag den Namen ein, den du sammeln willst.")
    .max(120, "Der Name ist zu lang."),
  email: z.preprocess(
    blankToUndefined,
    z.string().trim().email("Trag eine gültige E-Mail ein oder lass das Feld leer.").optional(),
  ),
  handle: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim().replace(/^@/, "");
      return trimmed === "" ? undefined : trimmed;
    },
    z
      .string()
      .regex(
        /^[A-Za-z0-9._-]{1,40}$/,
        "Handles dürfen Buchstaben, Zahlen, Punkte, Bindestriche und Unterstriche enthalten.",
      )
      .optional(),
  ),
});

export const visibilitySchema = z.object({
  itemId: z.string().trim().min(1, "Der Fund fehlt."),
  visibility: z.enum(VISIBILITIES),
});

export const deletionSchema = z.object({
  itemId: z.string().trim().min(1, "Der Fund fehlt."),
});

export const profileInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Trag den Namen ein, der auf der Vita stehen soll.")
    .max(120, "Der Name ist zu lang."),
  headline: z.string().trim().max(160, "Die Überschrift ist zu lang."),
  bio: z.string().trim().max(800, "Der Kurztext ist zu lang."),
});

export const newPersonSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Trag den Namen ein.")
    .max(120, "Der Name ist zu lang."),
});

export const shareInputSchema = z.object({
  expiresIn: z.enum(["24h", "7d", "30d"]),
  allowedCategories: z
    .array(z.enum(FOOTPRINT_CATEGORIES))
    .min(1, "Wähl mindestens eine Rubrik aus."),
});

export type ScanInput = z.infer<typeof scanInputSchema>;
export type ProfileInput = z.infer<typeof profileInputSchema>;
export type ShareInput = z.infer<typeof shareInputSchema>;

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Prüf das Formular und versuch es noch einmal.";
}
