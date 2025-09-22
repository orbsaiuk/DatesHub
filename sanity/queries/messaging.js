// Conversations and messages GROQ

export const CONVERSATION_BY_KEY_QUERY = `
*[_type == "conversation" && compositeKey == $key][0]{
  _id, conversationType, compositeKey, lastMessageAt, lastMessagePreview,
  participants, tenantType, tenantId, unread
}
`;

export const CONVERSATIONS_FOR_USER_QUERY = `
*[_type == "conversation" && count(participants[kind == "user" && clerkId == $clerkId]) > 0] 
  | order(lastMessageAt desc)[$offset...$end]{
  _id, conversationType, compositeKey, lastMessageAt, lastMessagePreview,
  tenantType, tenantId, unread,
  participants[]{
    kind, clerkId, tenantId,
    "displayName": select(
      kind == "company" => *[_type == "company" && tenantId == ^.tenantId][0].name,
      kind == "supplier" => *[_type == "supplier" && tenantId == ^.tenantId][0].name,
      kind == "user" => *[_type == "user" && clerkId == ^.clerkId][0].name
    ),
    "avatar": select(
      kind == "company" => *[_type == "company" && tenantId == ^.tenantId][0].logo,
      kind == "supplier" => *[_type == "supplier" && tenantId == ^.tenantId][0].logo,
      kind == "user" => *[_type == "user" && clerkId == ^.clerkId][0].image
    ),
  }
}
`;

export const CONVERSATIONS_FOR_TENANT_QUERY = `
*[_type == "conversation" && tenantType == $tenantType && tenantId == $tenantId] 
  | order(lastMessageAt desc)[$offset...$end]{
  _id, conversationType, compositeKey, lastMessageAt, lastMessagePreview,
  tenantType, tenantId, unread,
  participants[]{
    kind, clerkId, tenantId,
    "displayName": select(
      kind == "company" => *[_type == "company" && tenantId == ^.tenantId][0].name,
      kind == "supplier" => *[_type == "supplier" && tenantId == ^.tenantId][0].name,
      kind == "user" => *[_type == "user" && clerkId == ^.clerkId][0].name
    ),
    "avatar": select(
      kind == "company" => *[_type == "company" && tenantId == ^.tenantId][0].logo,
      kind == "supplier" => *[_type == "supplier" && tenantId == ^.tenantId][0].logo,
      kind == "user" => *[_type == "user" && clerkId == ^.clerkId][0].image
    )
  }
}
`;

export const MESSAGES_FOR_CONVERSATION_QUERY = `
*[_type == "message" && conversation._ref == $cid && createdAt <= $before]
  | order(createdAt desc)[$offset...$end]{
  _id, text, sender, createdAt, messageType, eventRequestData
}
`;

export const UNREAD_COUNT_FOR_TENANT_QUERY = `
*[_type == "conversation" && tenantType == $tenantType && tenantId == $tenantId]{
  "count": unread[participantKey == $participantKey][0].count
}[defined(count)].count
`;

export const UNREAD_COUNT_FOR_USER_QUERY = `
*[_type == "conversation" && participants[kind == "user" && clerkId == $clerkId]]{
  "count": unread[participantKey == $participantKey][0].count
}[defined(count)].count
`;
