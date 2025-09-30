// Reusable projections
export const BLOG_CARD_PROJECTION = `{
  _id,
  title,
  slug,
  excerpt,
  status,
  blogImage{
    asset->{
      url
    },
    alt
  },
  category->{
    _id,
    title,
    "slug": slug.current
  },
  author{
    authorType,
    company->{
      _id,
      name,
      logo{
        asset->{
          url
        }
      }
    },
    supplier->{
      _id,
      name,
      logo{
        asset->{
          url
        }
      }
    }
  },
  contentHtml,
  createdAt,
  _createdAt,
  featured
}`;

export const BLOG_DETAIL_PROJECTION = `{
  _id,
  title,
  slug,
  excerpt,
  status,
  contentHtml,
  blogImage{
    asset->{
      url
    },
    alt
  },
  category->{
    _id,
    title,
    "slug": slug.current
  },
  seo
}`;

// Get all published blogs
export const PUBLISHED_BLOGS_QUERY = `
*[_type == "blog" && status == "published"] | order(coalesce(createdAt, _createdAt) desc) ${BLOG_CARD_PROJECTION}
`;

// Get featured published blogs
export const FEATURED_BLOGS_QUERY = `
*[_type == "blog" && status == "published" && featured == true] | order(coalesce(createdAt, _createdAt) desc) ${BLOG_CARD_PROJECTION}
`;

// Get blog by slug
export const BLOG_BY_SLUG_QUERY = `
*[_type == "blog" && slug.current == $slug][0] ${BLOG_DETAIL_PROJECTION}
`;

export const BLOG_BY_ID_QUERY = `
*[_type == "blog" && _id == $id][0] ${BLOG_DETAIL_PROJECTION}
`;

// Get blogs by author (company or supplier)
export const BLOGS_BY_AUTHOR_QUERY = `
*[_type == "blog" && status == "published" && (
  (author.authorType == "company" && author.company._ref == $authorId) ||
  (author.authorType == "supplier" && author.supplier._ref == $authorId)
)] | order(coalesce(createdAt, _createdAt) desc) ${BLOG_CARD_PROJECTION}
`;

// Get recent blogs (limit)
export const RECENT_BLOGS_QUERY = `
*[_type == "blog" && status == "published"] | order(coalesce(createdAt, _createdAt) desc)[0...$limit] ${BLOG_CARD_PROJECTION}
`;

// Get recent company-authored blogs (limit)
export const RECENT_COMPANY_BLOGS_QUERY = `
*[_type == "blog" && status == "published" && author.authorType == "company"]
  | order(coalesce(createdAt, _createdAt) desc)[0...$limit]
  ${BLOG_CARD_PROJECTION}
`;

// Get recent supplier-authored blogs (limit)
export const RECENT_SUPPLIER_BLOGS_QUERY = `
*[_type == "blog" && status == "published" && author.authorType == "supplier"]
  | order(coalesce(createdAt, _createdAt) desc)[0...$limit]
  ${BLOG_CARD_PROJECTION}
`;

// Get related blogs (same category, excluding current blog)
export const RELATED_BLOGS_QUERY = `
*[_type == "blog" && status == "published" && _id != $currentBlogId && category._ref == $categoryId] | order(coalesce(createdAt, _createdAt) desc)[0...5] ${BLOG_CARD_PROJECTION}
`;

// Build a filtered/sorted blog query dynamically. Returns { query, params }
export function buildBlogsQuery({
  authorType, // 'company' | 'supplier'
  authorId, // company or supplier ID
  categoryId, // specific category ID

  search, // text matches title, excerpt, or content
  sortBy, // 'newest' | 'oldest' | 'most-viewed' | 'featured'
  status = "published", // filter by status, defaults to published
  featured, // boolean to filter featured posts
} = {}) {
  const filters = ["_type == 'blog'"];
  const params = {};

  // Always filter by status
  if (status && status !== "all") {
    filters.push("status == $status");
    params.status = status;
  }

  if (authorType && authorId) {
    if (authorType === "company") {
      filters.push(
        "author.authorType == 'company' && author.company._ref == $authorId"
      );
    } else if (authorType === "supplier") {
      filters.push(
        "author.authorType == 'supplier' && author.supplier._ref == $authorId"
      );
    }
    params.authorId = authorId;
  }

  if (categoryId) {
    filters.push("category._ref == $categoryId");
    params.categoryId = categoryId;
  }

  if (search) {
    // Search in title, excerpt, and content (HTML string)
    filters.push("(title match $q || excerpt match $q || content match $q)");
    params.q = `${search}*`;
  }

  if (featured !== undefined) {
    filters.push("featured == $featured");
    params.featured = featured;
  }

  let order = "| order(coalesce(createdAt, _createdAt) desc)";
  switch (sortBy) {
    case "oldest":
      order = "| order(coalesce(createdAt, _createdAt) asc)";
      break;
    case "most-viewed":
      order =
        "| order(views desc nulls last, coalesce(createdAt, _createdAt) desc)";
      break;
    case "featured":
      order = "| order(featured desc, coalesce(createdAt, _createdAt) desc)";
      break;
    case "newest":
    default:
      order = "| order(coalesce(createdAt, _createdAt) desc)";
  }

  const where = filters.length ? filters.join(" && ") : "_type == 'blog'";
  const query = `* [ ${where} ] ${order} ${BLOG_CARD_PROJECTION}`;

  return { query, params };
}

// Get popular tags with usage counts
export const POPULAR_BLOG_TAGS_QUERY = `
array::unique(
  *[_type == "blog" && status == "published"].tags[]
) | order(@) | {
  "tag": @,
  "count": count(*[_type == "blog" && status == "published" && @ in tags])
} | order(count desc)
`;

// Get blog archive (grouped by year/month)
export const BLOG_ARCHIVE_QUERY = `
*[_type == "blog" && status == "published" && defined(coalesce(createdAt, _createdAt))] {
  "year": dateTime(coalesce(createdAt, _createdAt)).year,
  "month": dateTime(coalesce(createdAt, _createdAt)).month,
  "createdAt": coalesce(createdAt, _createdAt)
} | group(year) | {
  "year": @.year,
  "months": group(@.month) | {
    "month": @.month,
    "count": count(@)
  } | order(month desc)
} | order(year desc)
`;
