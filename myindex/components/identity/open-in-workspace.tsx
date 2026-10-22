"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchPersonAction } from "@/lib/actions/footprint";

export function OpenInWorkspace({ publicId }: { publicId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        className="inline-flex h-10 items-center rounded-full border border-stone-300 bg-white px-4 text-sm text-ink transition hover:border-stone-950 disabled:opacity-40"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await switchPersonAction(publicId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.push("/dashboard");
            router.refresh();
          });
        }}
      >
        {pending ? "Öffnet…" : "Im Arbeitsbereich öffnen"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
