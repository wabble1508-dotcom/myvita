import { localDid } from "@/lib/domain/did";
import { DEMO_PUBLIC_ID } from "@/lib/domain/public-id";
import { isPubliclyFindable } from "@/lib/domain/public-store";
import type { FootprintCategory, StoreData } from "@/lib/domain/types";
import { normalizeHit } from "@/lib/services/normalizer";
import { simulateSerp } from "@/lib/services/osint";

const USER_ID = "usr_local_demo";
const PROFILE_ID = "prf_local_demo";

export function createSeed(): StoreData {
  const now = new Date();
  const email = "alex.rivera@example.com";
  const fullName = "Alex Rivera";
  const iso = now.toISOString();
  const hits = simulateSerp({ fullName, email, handle: "alexrivera" });

  return {
    version: 2,
    activePublicId: DEMO_PUBLIC_ID,
    people: [
      {
        user: {
          id: USER_ID,
          email,
          fullName,
          isVerified: true,
          createdAt: iso,
          updatedAt: iso,
        },
        profile: {
          id: PROFILE_ID,
          userId: USER_ID,
          publicId: DEMO_PUBLIC_ID,
          did: localDid(email),
          headline: "Produktentwicklung für ruhige, sorgfältige Software",
          bio: "Ich baue Werkzeuge, mit denen Menschen ihre eigenen Daten überblicken. Diese Seite zeigt nur die Spuren, die ich freigebe.",
          verificationLevel: "OAUTH_VERIFIED",
          createdAt: iso,
          updatedAt: iso,
        },
        items: hits.flatMap((hit, index) => {
          const normalized = normalizeHit(hit, fullName);
          if (!isPubliclyFindable(normalized.category, normalized.domain)) return [];
          return [
            {
              ...normalized,
              id: `itm_seed_${index + 1}`,
              profileId: PROFILE_ID,
              visibility: "PUBLIC" as const,
              isVerifiedByOwner: seedReviewed(normalized.category, normalized.domain),
              deletionRequestedAt: null,
              createdAt: new Date(now.getTime() - (hits.length - index) * 86_400_000).toISOString(),
            },
          ];
        }),
        links: [
          {
            id: "lnk_seed_demo",
            profileId: PROFILE_ID,
            accessToken: "demo_local_share_7f3a9c2e",
            expiresAt: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
            allowedCategories: ["PROFESSIONAL", "SOCIAL", "MEDIA_MENTION"],
            viewsCount: 0,
            createdAt: iso,
          },
        ],
      },
    ],
  };
}

function seedReviewed(category: FootprintCategory, domain: string): boolean {
  if (category === "PROFESSIONAL" && !domain.includes("portfolio")) return true;
  if (category === "ACADEMIC" || category === "PUBLIC_RECORD") return true;
  return false;
}
