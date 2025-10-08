import { writeClient } from "@/sanity/lib/serverClient";
import {
  UNREAD_COUNT_FOR_TENANT_QUERY,
  UNREAD_COUNT_FOR_USER_QUERY,
} from "@/sanity/queries/messaging";

export async function getUnreadForTenant({ tenantType, tenantId }) {
  // Get the business document ID
  const business = await writeClient.fetch(
    `*[_type in ["company", "supplier"] && tenantId == $tenantId][0]`,
    { tenantId }
  );

  if (!business?._id) {
    return 0;
  }

  // Count unread messages in conversations where this business is a participant
  const count = await writeClient.fetch(
    `count(*[_type == "message" 
      && !($participantKey in readBy[].participantKey) 
      && sender._ref != $businessId
      && conversation._ref in *[_type == "conversation" && (participant1._ref == $businessId || participant2._ref == $businessId)]._id])`,
    {
      participantKey: `${tenantType}:${tenantId}`,
      businessId: business._id,
    }
  );

  return Number(count || 0);
}

export async function getUnreadForUser({ clerkId }) {
  // Get the user document ID
  const user = await writeClient.fetch(
    `*[_type == "user" && clerkId == $clerkId][0]`,
    { clerkId }
  );

  if (!user?._id) {
    return 0;
  }

  // Count unread messages in conversations where this user is a participant
  const count = await writeClient.fetch(
    `count(*[_type == "message" 
      && !($participantKey in readBy[].participantKey) 
      && sender._ref != $userId
      && conversation._ref in *[_type == "conversation" && (participant1._ref == $userId || participant2._ref == $userId)]._id])`,
    {
      participantKey: `user:${clerkId}`,
      userId: user._id,
    }
  );

  return Number(count || 0);
}
