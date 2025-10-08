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

// Create or get a conversation between two participants.
export async function getOrCreateConversation({ participant1, participant2 }) {
  // Check if conversation already exists between these two participants
  const existing = await writeClient.fetch(
    `*[_type == "conversation" && 
      ((participant1._ref == $p1 && participant2._ref == $p2) || 
       (participant1._ref == $p2 && participant2._ref == $p1))][0]`,
    { p1: participant1, p2: participant2 }
  );

  if (existing?._id) {
    return existing;
  }

  // Create new conversation
  const doc = {
    _type: "conversation",
    participant1: { _type: "reference", _ref: participant1 },
    participant2: { _type: "reference", _ref: participant2 },
    createdAt: new Date().toISOString(),
  };

  const created = await writeClient.create(doc);
  return created;
}

// Helper function for user-company conversations
export async function findOrCreateUserConversation({
  userId,
  companyTenantId,
}) {
  // First, get the user document ID
  const user = await writeClient.fetch(
    `*[_type == "user" && clerkId == $userId][0]`,
    { userId }
  );

  if (!user?._id) {
    throw new Error("User not found");
  }

  // Get the company document ID
  const company = await writeClient.fetch(
    `*[_type == "company" && tenantId == $tenantId][0]`,
    { tenantId: companyTenantId }
  );

  if (!company?._id) {
    throw new Error("Company not found");
  }

  return await getOrCreateConversation({
    participant1: user._id,
    participant2: company._id,
  });
}

export async function listUserConversations({
  clerkId,
  offset = 0,
  limit = 20,
}) {
  return await writeClient.fetch(CONVERSATIONS_FOR_USER_QUERY, {
    clerkId,
    participantKey: `user:${clerkId}`,
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
    participantKey: `${tenantType}:${tenantId}`,
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
  orderRequest = null,
}) {
  const now = new Date().toISOString();

  // Resolve sender to Sanity document ID
  let senderRef = null;
  if (sender) {
    if (sender.kind === "user") {
      const user = await writeClient.fetch(
        `*[_type == "user" && clerkId == $clerkId][0]._id`,
        { clerkId: sender.clerkId }
      );
      senderRef = user;
    } else {
      // company or supplier
      const tenant = await writeClient.fetch(
        `*[_type == $kind && tenantId == $tenantId][0]._id`,
        { kind: sender.kind, tenantId: sender.tenantId }
      );
      senderRef = tenant;
    }
  }

  // Create participantKey for sender (so they don't see their own message as unread)
  const senderParticipantKey = sender
    ? sender.kind === "user"
      ? `user:${sender.clerkId}`
      : `${sender.kind}:${sender.tenantId}`
    : null;

  // Create message with sender already marked as having read it
  const messageData = {
    _type: "message",
    conversation: { _type: "reference", _ref: conversationId },
    messageType,
    createdAt: now,
    readBy: senderParticipantKey
      ? [
        {
          _key: `${senderParticipantKey}-${Date.now()}`,
          participantKey: senderParticipantKey,
          readAt: now,
        },
      ]
      : [],
  };

  if (senderRef) {
    messageData.sender = { _type: "reference", _ref: senderRef };
  }

  if (messageType === "order_request" && orderRequest) {
    messageData.orderRequest = orderRequest;
  } else {
    messageData.text = text;
  }

  const msg = await writeClient.create(messageData);
  return msg;
}

export async function markConversationRead({ conversationId, participant }) {
  const now = new Date().toISOString();
  const key = participantKey(participant);

  // Get all unread messages in this conversation for this participant
  const messages = await writeClient.fetch(
    `*[_type == "message" && conversation._ref == $conversationId && !($participantKey in readBy[].participantKey)]`,
    { conversationId, participantKey: key }
  );

  // Mark each message as read by this participant
  const transaction = writeClient.transaction();
  messages.forEach((msg) => {
    const readByEntry = {
      _key: `${key}-${Date.now()}`,
      participantKey: key,
      readAt: now,
    };
    transaction.patch(msg._id, (patch) =>
      patch.setIfMissing({ readBy: [] }).append("readBy", [readByEntry])
    );
  });

  await transaction.commit();
  return { ok: true };
}
