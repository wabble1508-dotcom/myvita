import { asc, desc, eq } from "drizzle-orm";
import { ProjectForm, ProjectList } from "@/components/editor/portfolio-editor";
import { PageTitle } from "@/components/editor/shared";
import { requireViewer } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

export default async function PortfolioPage() {
  const viewer = await requireViewer();
  const projects = await db()
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.userId, viewer.id))
    .orderBy(asc(schema.projects.position), desc(schema.projects.createdAt));
  return (
    <>
      <PageTitle title="Portfolio" text="Zeig, was du gebaut, gestaltet oder produziert hast: Apps, Programme, Designs, Videos, Texte." />
      <div className="space-y-6">
        <ProjectList projects={projects} />
        <div>
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-accent-soft">Neues Projekt</h2>
          <ProjectForm />
        </div>
      </div>
    </>
  );
}
