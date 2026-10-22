import { NextResponse } from "next/server";
import { runScan } from "@/lib/services/profile";
import { firstIssue, scanInputSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Der Inhalt muss JSON sein." }, { status: 400 });
  }

  const parsed = scanInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  try {
    const summary = await runScan(parsed.data);
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Die Suche ist fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
