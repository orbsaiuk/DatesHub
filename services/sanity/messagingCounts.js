import { writeClient } from "@/sanity/lib/serverClient";
import {
  UNREAD_COUNT_FOR_TENANT_QUERY,
  UNREAD_COUNT_FOR_USER_QUERY,
} from "@/sanity/queries/messaging";

export async function getUnreadForTenant({ tenantType, tenantId }) {
  const participantKey = `${tenantType}:${tenantId}`;
  const counts = await writeClient.fetch(UNREAD_COUNT_FOR_TENANT_QUERY, {
    tenantType,
    tenantId,
    participantKey,
  });
  // Sum all the counts from the array
  const totalCount = Array.isArray(counts) 
    ? counts.reduce((sum, count) => sum + Number(count || 0), 0)
    : Number(counts || 0);
  return totalCount;
}

export async function getUnreadForUser({ clerkId }) {
  const participantKey = `user:${clerkId}`;
  const counts = await writeClient.fetch(UNREAD_COUNT_FOR_USER_QUERY, {
    clerkId,
    participantKey,
  });
  // Sum all the counts from the array
  const totalCount = Array.isArray(counts) 
    ? counts.reduce((sum, count) => sum + Number(count || 0), 0)
    : Number(counts || 0);
  return totalCount;
}
