"use client";

import { startTransition, useActionState, useCallback, useEffect, useRef } from "react";
import type { FormState } from "@/lib/auth/actions";
import { Select } from "@/components/ui/field";

export const VISIBILITY_OPTIONS = [
  { value: "public", label: "Öffentlich" },
  { value: "link", label: "Nur Bewerbungslinks" },
  { value: "private", label: "Privat" },
] as const;

export function VisibilitySelect({
  name = "visibility",
  defaultValue = "public",
  id,
  onChange,
  className,
}: {
  name?: string;
  defaultValue?: string;
  id?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <Select
      id={id}
      name={name}
      defaultValue={defaultValue}
      className={className}
      aria-label="Wer sieht das?"
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
    >
      {VISIBILITY_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}

export function PageTitle({ title, text }: { title: string; text?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-medium tracking-tight text-white sm:text-3xl">{title}</h1>
      {text ? <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{text}</p> : null}
    </header>
  );
}

/** Verkleinert ein Bild im Browser zu WebP, damit Uploads klein bleiben. */
export async function shrinkImage(file: File, maxSide: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  if (!blob) return file;
  return new File([blob], "bild.webp", { type: "image/webp" });
}

/** Ersetzt die Datei im Formular durch eine verkleinerte Fassung, sobald sie gewählt ist. */
export function useShrunkFile(maxSide: number, onPreview: (url: string | null) => void) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const handle = async () => {
      const file = input.files?.[0];
      if (!file) return onPreview(null);
      try {
        const small = await shrinkImage(file, maxSide);
        const transfer = new DataTransfer();
        transfer.items.add(small);
        input.files = transfer.files;
        onPreview(URL.createObjectURL(small));
      } catch {
        onPreview(URL.createObjectURL(file));
      }
    };
    input.addEventListener("change", handle);
    return () => input.removeEventListener("change", handle);
  }, [maxSide, onPreview]);
  const clear = useCallback(() => {
    if (ref.current) ref.current.value = "";
  }, []);
  return { ref, clear };
}

/**
 * Schickt ein Formular an eine Server-Aktion, ohne dass React es bei Fehlern leert.
 * Mit `resetOnDone` wird es nach Erfolg geleert (für "Hinzufügen"-Formulare).
 */
export function useFormAction(
  action: (state: FormState, form: FormData) => Promise<FormState>,
  { resetOnDone = false }: { resetOnDone?: boolean } = {},
) {
  const [state, dispatch, pending] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnDone && state?.done) ref.current?.reset();
  }, [state, resetOnDone]);
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => dispatch(form));
  };
  return { state, pending, ref, onSubmit };
}
