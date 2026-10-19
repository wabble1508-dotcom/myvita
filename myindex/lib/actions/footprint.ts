"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/domain/types";
import { normalizePublicId } from "@/lib/domain/public-id";
import {
  createPerson,
  createShareLink,
  requestItemDeletion,
  saveProfileDetails,
  setItemVisibility,
  switchPerson,
} from "@/lib/services/profile";
import {
  deletionSchema,
  firstIssue,
  newPersonSchema,
  profileInputSchema,
  shareInputSchema,
  visibilitySchema,
} from "@/lib/validators";

export async function updateVisibilityAction(
  itemId: string,
  visibility: string,
): Promise<ActionResult<{ id: string }>> {
  const parsed = visibilitySchema.safeParse({ itemId, visibility });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  try {
    await setItemVisibility(parsed.data.itemId, parsed.data.visibility);
    refreshFootprint();
    return { ok: true, data: { id: parsed.data.itemId } };
  } catch (error) {
    return { ok: false, error: messageFrom(error) };
  }
}

export async function requestDeletionAction(itemId: string): Promise<ActionResult<{ id: string }>> {
  const parsed = deletionSchema.safeParse({ itemId });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  try {
    await requestItemDeletion(parsed.data.itemId);
    refreshFootprint();
    return { ok: true, data: { id: parsed.data.itemId } };
  } catch (error) {
    return { ok: false, error: messageFrom(error) };
  }
}

export async function updateProfileAction(input: {
  fullName: string;
  headline: string;
  bio: string;
}): Promise<ActionResult<{ fullName: string }>> {
  const parsed = profileInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  try {
    await saveProfileDetails(parsed.data);
    refreshFootprint();
    return { ok: true, data: { fullName: parsed.data.fullName } };
  } catch (error) {
    return { ok: false, error: messageFrom(error) };
  }
}

export async function createPersonAction(fullName: string): Promise<ActionResult<{ publicId: string }>> {
  const parsed = newPersonSchema.safeParse({ fullName });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  try {
    const created = await createPerson(parsed.data.fullName);
    refreshFootprint();
    return { ok: true, data: created };
  } catch (error) {
    return { ok: false, error: messageFrom(error) };
  }
}

export async function switchPersonAction(publicId: string): Promise<ActionResult<{ publicId: string }>> {
  const id = normalizePublicId(publicId);
  if (!id) return { ok: false, error: "Die ID hat die Form MV- und acht Zeichen." };

  try {
    await switchPerson(id);
    refreshFootprint();
    return { ok: true, data: { publicId: id } };
  } catch (error) {
    return { ok: false, error: messageFrom(error) };
  }
}

export async function createShareLinkAction(input: {
  expiresIn: string;
  allowedCategories: string[];
}): Promise<ActionResult<{ accessToken: string; expiresAt: string }>> {
  const parsed = shareInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  try {
    const created = await createShareLink(parsed.data);
    refreshFootprint();
    return { ok: true, data: created };
  } catch (error) {
    return { ok: false, error: messageFrom(error) };
  }
}

function refreshFootprint(): void {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/share");
  revalidatePath("/p/[accessToken]", "page");
  revalidatePath("/id/[publicId]", "page");
}

function messageFrom(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Das hat nicht geklappt. Versuch es noch einmal.";
}
