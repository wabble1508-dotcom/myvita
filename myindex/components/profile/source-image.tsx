import type { DisplayFact } from "@/lib/domain/types";

export function SourceImage({ facts, alt }: { facts: DisplayFact[]; alt: string }) {
  const image = facts.find((fact) => fact.label === "Bild" && fact.value.startsWith("https://"));
  if (!image) return null;
  return (
    <img
      src={image.value}
      alt={alt}
      referrerPolicy="no-referrer"
      className="aspect-video w-full bg-black/40 object-cover"
    />
  );
}

export function factsWithoutImage(facts: DisplayFact[]): DisplayFact[] {
  return facts.filter((fact) => fact.label !== "Bild");
}
