export const USER_ROLE_AND_MEMBERSHIPS_BY_CLERK_ID_QUERY = `
*[_type == "user" && clerkId == $userId][0]{ role, memberships }
`;

import { COMPANY_CARD_PROJECTION } from "./companies";

export const USER_BOOKMARKS_QUERY = `
*[_type == "user" && clerkId == $uid][0]{
  bookmarks[]->${COMPANY_CARD_PROJECTION}
}
`;

export const USER_BOOKMARK_IDS_QUERY = `
*[_type == "user" && clerkId == $uid][0]{
  "bookmarks": bookmarks[]->{
    "id": coalesce(tenantId, slug.current)
  }
}
`;

export const USER_ID_BY_CLERK_ID_QUERY = `
*[_type == "user" && clerkId == $uid][0]{ _id }
`;

export const USER_BY_ID_OR_CLERKID_QUERY = `
*[_type == "user" && (_id == $id || clerkId == $clerkId)][0]{ _id }
`;

export const USER_HAS_BOOKMARK_QUERY = `
count(*[_type == "user" && _id == $uid && bookmarks[_ref == $cid]]) > 0
`;

export const USER_ID_AND_BOOKMARKS_BY_CLERK_ID_QUERY = `
*[_type == "user" && clerkId == $uid][0]{ _id, bookmarks }
`;
