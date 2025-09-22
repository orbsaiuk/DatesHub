import { writeClient } from "@/sanity/lib/serverClient";
import {
  CONVERSATION_BY_KEY_QUERY,
  CONVERSATIONS_FOR_USER_QUERY,
  CONVERSATIONS_FOR_TENANT_QUERY,
  MESSAGES_FOR_CONVERSATION_QUERY,
} from "@/sanity/queries/messaging";

// Utilities
export function participantKey(p) {
  if (p.kind === "user") return `user:${p.clerkId}`;
  return `${p.kind}:${p.tenantId}`; // company:<id> or supplier:<id>
}

export function makeCompositeKey(participants) {
  // deterministic: sort by kind then id
  const norm = participants.map((p) =>
    p.kind === "user" ? `user:${p.clerkId}` : `${p.kind}:${p.tenantId}`
  );
  norm.sort();
  return norm.join("|");
}

// Create or get a conversation by composite key.
export async function getOrCreateConversation({
  conversationType,
  participants,
  tenantContext, // { tenantType, tenantId } for business inbox filtering (optional for user-company)
}) {
  const compositeKey = makeCompositeKey(participants);
  const existing = await writeClient.fetch(CONVERSATION_BY_KEY_QUERY, {
    key: compositeKey,
  });
  if (existing?._id) {
    // If a tenantContext is provided but the existing conversation lacks it, patch it.
    if (
      tenantContext &&
      (!existing.tenantType ||
        !existing.tenantId ||
        existing.tenantType !== tenantContext.tenantType ||
        existing.tenantId !== tenantContext.tenantId)
    ) {
      try {
        await writeClient
          .patch(existing._id)
          .set({
            tenantType: tenantContext.tenantType,
            tenantId: tenantContext.tenantId,
          })
          .commit();
        return { ...existing, ...tenantContext };
      } catch (_) {
        // best-effort; fall through to return existing as-is
      }
    }
    return existing;
  }

  const now = new Date().toISOString();
  const unread = participants.map((p) => ({
    participantKey: participantKey(p),
    count: 0,
    updatedAt: now,
  }));

  const doc = {
    _type: "conversation",
    conversationType,
    participants,
    compositeKey,
    lastMessageAt: now,
    lastMessagePreview: "",
    unread,
    ...(tenantContext || {}),
  };
  const created = await writeClient.create(doc);
  return created;
}

// Helper function for user-company conversations
export async function findOrCreateUserConversation({
  userId,
  companyTenantId,
}) {
  const participants = [
    { kind: "user", clerkId: userId },
    { kind: "company", tenantId: companyTenantId },
  ];

  return await getOrCreateConversation({
    conversationType: "user-company",
    participants,
    tenantContext: { tenantType: "company", tenantId: companyTenantId },
  });
}

export async function listUserConversations({
  clerkId,
  offset = 0,
  limit = 20,
}) {
  return await writeClient.fetch(CONVERSATIONS_FOR_USER_QUERY, {
    clerkId,
    offset,
    end: offset + limit,
  });
}

export async function listTenantConversations({
  tenantType,
  tenantId,
  offset = 0,
  limit = 20,
}) {
  return await writeClient.fetch(CONVERSATIONS_FOR_TENANT_QUERY, {
    tenantType,
    tenantId,
    offset,
    end: offset + limit,
  });
}

export async function listMessages({
  conversationId,
  before = new Date().toISOString(),
  offset = 0,
  limit = 30,
}) {
  return await writeClient.fetch(MESSAGES_FOR_CONVERSATION_QUERY, {
    cid: conversationId,
    before,
    offset,
    end: offset + limit,
  });
}

export async function sendMessage({
  conversationId,
  sender,
  text,
  messageType = "text",
  eventRequestData = null,
}) {
  const now = new Date().toISOString();
  // Create message
  const messageData = {
    _type: "message",
    conversation: { _type: "reference", _ref: conversationId },
    sender,
    text,
    messageType,
    createdAt: now,
  };

  // Add event request data if it's an event request message
  if (messageType === "event_request" && eventRequestData) {
    messageData.eventRequestData = eventRequestData;
  }

  const msg = await writeClient.create(messageData);

  const preview = (text || "").slice(0, 120);

  // Fetch conversation to compute unread
  const conv = await writeClient.getDocument(conversationId);
  const senderKey = participantKey(sender);
  const updatedUnread = (conv.unread || []).map((u) =>
    u.participantKey === senderKey
      ? { ...u, updatedAt: now }
      : { ...u, count: Math.max(0, (u.count || 0) + 1), updatedAt: now }
  );

  await writeClient
    .patch(conversationId)
    .set({
      lastMessageAt: now,
      lastMessagePreview: preview,
      unread: updatedUnread,
    })
    .commit();

  return msg;
}

export async function markConversationRead({ conversationId, participant }) {
  const now = new Date().toISOString();
  const key = participantKey(participant);
  const conv = await writeClient.getDocument(conversationId);
  const updatedUnread = (conv.unread || []).map((u) =>
    u.participantKey === key ? { ...u, count: 0, updatedAt: now } : u
  );
  await writeClient
    .patch(conversationId)
    .set({ unread: updatedUnread })
    .commit();
  return { ok: true };
}
