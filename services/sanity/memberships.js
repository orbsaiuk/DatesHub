import { writeClient } from "@/sanity/lib/serverClient";
import {
  USER_BY_ID_OR_CLERKID_QUERY,
  USER_ROLE_AND_MEMBERSHIPS_BY_CLERK_ID_QUERY,
} from "@/sanity/queries/user";

export async function ensureUserMembership(clerkId, entityType, tenantId) {
  try {
    const userDoc = await writeClient.fetch(
      USER_ROLE_AND_MEMBERSHIPS_BY_CLERK_ID_QUERY,
      { userId: clerkId }
    );

    const targetUserId = userDoc?._id
      ? userDoc._id
      : await (async () => {
          // Fallback: ensure a user doc exists (deterministic id)
          const deterministicId = `user.${clerkId}`;
          const existing = await writeClient.fetch(
            USER_BY_ID_OR_CLERKID_QUERY,
            { id: deterministicId, clerkId }
          );
          const _id = existing?._id || deterministicId;
          if (!existing) {
            await writeClient.create({ _id, _type: "user", clerkId });
          }
          return _id;
        })();

    const existingMemberships = Array.isArray(userDoc?.memberships)
      ? userDoc.memberships
      : [];
    const alreadyLinked = existingMemberships.some(
      (m) => m?.tenantType === entityType && m?.tenantId === tenantId
    );

    if (!alreadyLinked) {
      await writeClient
        .patch(targetUserId)
        .setIfMissing({ memberships: [] })
        .append("memberships", [
          { tenantType: entityType, tenantId, role: "owner" },
        ])
        .commit({ autoGenerateArrayKeys: true });
    }

    return { ok: true, userId: targetUserId };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
