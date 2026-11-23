import { eq } from "drizzle-orm";
import { CvForm, CvList } from "@/components/editor/cv-editor";
import { PageTitle } from "@/components/editor/shared";
import { requireViewer } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import type { CvEntryRow } from "@/lib/db/schema";

function newestFirst(a: CvEntryRow, b: CvEntryRow): number {
  return (b.endDate || "9999").localeCompare(a.endDate || "9999") || b.startDate.localeCompare(a.startDate);
}

export default async function CvPage() {
  const viewer = await requireViewer();
  const rows = (await db().select().from(schema.cvEntries).where(eq(schema.cvEntries.userId, viewer.id))).sort(newestFirst);
  return (
    <>
      <PageTitle title="Lebenslauf" text="Deine Stationen. Neueste stehen oben. Mit Bewerbungslinks kannst du Einträge nur für Firmen zeigen." />
      <div className="space-y-10">
        {(["experience", "education"] as const).map((kind) => (
          <section key={kind} className="space-y-3">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent-soft">
              {kind === "experience" ? "Erfahrung" : "Ausbildung"}
            </h2>
            <CvList kind={kind} entries={rows.filter((row) => row.kind === kind)} />
            <CvForm kind={kind} />
          </section>
        ))}
      </div>
    </>
  );
}
