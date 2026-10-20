import { CATEGORY_ORDER } from "@/lib/domain/categories";
import type { ItemRecord, PersonView, ProfileRecord, PublicVita, ShareLinkRecord, UserRecord } from "@/lib/domain/types";

export function countSharedItems(items: ItemRecord[], link: ShareLinkRecord): number {
  return selectSharedItems(items, link).length;
}

export function selectSharedItems(items: ItemRecord[], link: ShareLinkRecord): ItemRecord[] {
  const allowed = new Set(link.allowedCategories);
  return items
    .filter((item) => item.deletionRequestedAt == null)
    .filter((item) => item.visibility === "PUBLIC" || item.visibility === "SHARE_ONLY")
    .filter((item) => allowed.has(item.category))
    .sort(bySection);
}

export function selectPublicItems(items: ItemRecord[]): ItemRecord[] {
  return items
    .filter((item) => item.deletionRequestedAt == null)
    .filter((item) => item.visibility === "PUBLIC")
    .sort(bySection);
}

export function buildPersonView(input: { user: UserRecord; profile: ProfileRecord; items: ItemRecord[] }): PersonView {
  return {
    publicId: input.profile.publicId,
    fullName: input.user.fullName,
    headline: input.profile.headline,
    bio: input.profile.bio,
    verificationLevel: input.profile.verificationLevel,
    sections: toSections(selectPublicItems(input.items)),
  };
}

export function buildPublicVita(input: {
  user: UserRecord;
  profile: ProfileRecord;
  items: ItemRecord[];
  link: ShareLinkRecord;
}): PublicVita {
  return {
    publicId: input.profile.publicId,
    fullName: input.user.fullName,
    headline: input.profile.headline,
    bio: input.profile.bio,
    verificationLevel: input.profile.verificationLevel,
    expiresAt: input.link.expiresAt,
    viewsCount: input.link.viewsCount,
    sections: toSections(selectSharedItems(input.items, input.link)),
  };
}

function toSections(items: ItemRecord[]): PublicVita["sections"] {
  return CATEGORY_ORDER.flatMap((category) => {
    const sectionItems = items.filter((item) => item.category === category);
    if (sectionItems.length === 0) return [];
    return [
      {
        category,
        items: sectionItems.map((item) => ({
          id: item.id,
          title: item.title,
          snippet: item.snippet,
          domain: item.domain,
          sourceUrl: item.sourceUrl,
          confidenceScore: item.confidenceScore,
          facts: item.facts ?? [],
        })),
      },
    ];
  });
}

function bySection(left: ItemRecord, right: ItemRecord): number {
  const categoryDelta = CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category);
  if (categoryDelta !== 0) return categoryDelta;
  return right.confidenceScore - left.confidenceScore;
}
