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
        className="text-sm text-teal-800 underline disabled:opacity-40"
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
