import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Landmark,
  MessagesSquare,
  Newspaper,
  Shapes,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { FOOTPRINT_CATEGORIES, type FootprintCategory } from "@/lib/domain/types";

export const CATEGORY_ORDER = FOOTPRINT_CATEGORIES;

type CategoryMeta = {
  label: string;
  singular: string;
  plural: string;
  icon: LucideIcon;
  chip: string;
  badge: "sky" | "violet" | "amber" | "emerald" | "rose" | "neutral" | "indigo" | "cyan";
};

export const CATEGORY_META: Record<FootprintCategory, CategoryMeta> = {
  PROFESSIONAL: {
    label: "Beruf",
    singular: "Berufsprofil",
    plural: "Berufsprofile",
    icon: Briefcase,
    chip: "bg-sky-400/15 text-sky-100",
    badge: "sky",
  },
  EDUCATION: {
    label: "Studium",
    singular: "Abschluss",
    plural: "Abschlüsse",
    icon: GraduationCap,
    chip: "bg-indigo-400/15 text-indigo-100",
    badge: "indigo",
  },
  ACADEMIC: {
    label: "Wissenschaft",
    singular: "Veröffentlichung",
    plural: "Veröffentlichungen",
    icon: BookOpen,
    chip: "bg-cyan-300/15 text-cyan-100",
    badge: "cyan",
  },
  SOCIAL: {
    label: "Social Media",
    singular: "Social-Media-Seite",
    plural: "Social Media",
    icon: MessagesSquare,
    chip: "bg-violet-400/15 text-violet-100",
    badge: "violet",
  },
  MEDIA_MENTION: {
    label: "Nachrichten",
    singular: "Nachricht",
    plural: "Nachrichten",
    icon: Newspaper,
    chip: "bg-amber-300/15 text-amber-100",
    badge: "amber",
  },
  PUBLIC_RECORD: {
    label: "Register",
    singular: "Registereintrag",
    plural: "Registereinträge",
    icon: Landmark,
    chip: "bg-emerald-300/15 text-emerald-100",
    badge: "emerald",
  },
  DATA_LEAK: {
    label: "Datenleck",
    singular: "Datenleck-Hinweis",
    plural: "Datenleck-Hinweise",
    icon: ShieldAlert,
    chip: "bg-rose-400/15 text-rose-100",
    badge: "rose",
  },
  OTHER: {
    label: "Weitere Quellen",
    singular: "weitere Quelle",
    plural: "weitere Quellen",
    icon: Shapes,
    chip: "bg-white/10 text-slate-200",
    badge: "neutral",
  },
};

export function categoryCountLabel(category: FootprintCategory, count: number): string {
  const meta = CATEGORY_META[category];
  return `${count} ${count === 1 ? meta.singular : meta.plural}`;
}

export const VERIFICATION_LABEL: Record<string, string> = {
  UNVERIFIED: "Nicht geprüft",
  OAUTH_VERIFIED: "Per OAuth geprüft",
  EID_VERIFIED: "Per eID geprüft",
};
