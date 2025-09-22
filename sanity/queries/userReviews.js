export const USER_PUBLIC_PROFILE_BY_ID_OR_CLERKID = `
*[_type=="user" && (_id==$id || clerkId==$id)][0]{
  _id,
  clerkId,
  name,
  imageUrl,
  role,
  rating,
  ratingCount
}`;

export const USER_RESOLVE_TENANT_KEY = `
*[_type=="user" && (_id==$id || clerkId==$id)][0]{ clerkId }`;

export const USER_REVIEWS_PAGE = `
*[_type=="review" && tenantType=="user" && tenantId==$tenantId]
  | order(createdAt desc)[$start...$end]{
    _id,
    rating,
    title,
    content,
    authorName,
    createdAt
  }
`;

export const USER_REVIEWS_COUNT = `
count(*[_type=="review" && tenantType=="user" && tenantId==$tenantId])
`;
