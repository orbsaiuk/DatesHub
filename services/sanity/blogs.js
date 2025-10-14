import { writeClient } from "@/sanity/lib/serverClient";
import { client as readClient } from "@/sanity/lib/client";
import {
  PUBLISHED_BLOGS_QUERY,
  FEATURED_BLOGS_QUERY,
  BLOG_BY_SLUG_QUERY,
  BLOGS_BY_AUTHOR_QUERY,
  RECENT_BLOGS_QUERY,
  RELATED_BLOGS_QUERY,
  buildBlogsQuery,
  POPULAR_BLOG_TAGS_QUERY,
  BLOG_ARCHIVE_QUERY,
  BLOG_CARD_PROJECTION,
  BLOG_BY_ID_QUERY,
} from "@/sanity/queries/blogs";

export async function getPublishedBlogs() {
  try {
    return await readClient.fetch(PUBLISHED_BLOGS_QUERY);
  } catch (error) {
    return [];
  }
}

export async function getFeaturedBlogs() {
  try {
    return await readClient.fetch(FEATURED_BLOGS_QUERY);
  } catch (error) {
    return [];
  }
}

export async function getBlogBySlug(slug) {
  try {
    if (!slug) return null;
    return await readClient.fetch(BLOG_BY_SLUG_QUERY, { slug });
  } catch (error) {
    return null;
  }
}

export async function getBlogById(id) {
  try {
    if (!id) return null;
    return await readClient.fetch(BLOG_BY_ID_QUERY, { id });
  } catch (error) {
    return null;
  }
}

export async function getBlogsByAuthor(authorId) {
  try {
    if (!authorId) return [];
    return await readClient.fetch(BLOGS_BY_AUTHOR_QUERY, { authorId });
  } catch (error) {
    return [];
  }
}

export async function getRecentBlogs(limit = 5) {
  try {
    return await readClient.fetch(RECENT_BLOGS_QUERY, { limit });
  } catch (error) {
    return [];
  }
}

export async function getRecentCompanyBlogs(limit = 5) {
  return getBlogsByQuery({ authorType: "company", limit });
}

export async function getRecentSupplierBlogs(limit = 5) {
  return getBlogsByQuery({ authorType: "supplier", limit });
}

// Unified blog fetching function
export async function getBlogsByQuery(options = {}) {
  try {
    const { query, params } = buildBlogsQuery({
      status: "published",
      sortBy: "newest",
      ...options,
    });
    return await readClient.fetch(query, params);
  } catch (error) {
    return [];
  }
}

export async function getRelatedBlogs(currentBlogId, authorId = null) {
  try {
    if (!currentBlogId) {
      // Fallback to recent blogs if no current blog ID
      return await readClient.fetch(RECENT_BLOGS_QUERY, { limit: 5 });
    }

    // If we have an authorId, try to get blogs by the same author
    if (authorId) {
      const relatedBlogs = await readClient.fetch(RELATED_BLOGS_QUERY, {
        currentBlogId,
        authorId,
      });

      // If we found related blogs by author, return them
      if (relatedBlogs && relatedBlogs.length > 0) {
        return relatedBlogs;
      }
    }

    // Fallback to recent blogs if no author-based results
    return await readClient.fetch(RECENT_BLOGS_QUERY, { limit: 5 });
  } catch (error) {
    return [];
  }
}

export async function searchBlogs(options = {}) {
  try {
    const { query, params } = buildBlogsQuery(options);
    return await readClient.fetch(query, params);
  } catch (error) {
    return [];
  }
}

// Fetch all blogs for a tenant (company or supplier) regardless of status
export async function getBlogsForTenant(tenantType, tenantId) {
  try {
    if (!tenantType || !tenantId) return [];
    const filter =
      tenantType === "company"
        ? "author.authorType == 'company' && author.company->tenantId == $tenantId"
        : "author.authorType == 'supplier' && author.supplier->tenantId == $tenantId";
    const query = `*[_type == "blog" && (${filter})] | order(_createdAt desc) ${BLOG_CARD_PROJECTION}`;
    // Use authenticated client to read private datasets
    return await writeClient.fetch(query, { tenantId });
  } catch (error) {
    return [];
  }
}

export async function getPopularBlogTags() {
  try {
    return await readClient.fetch(POPULAR_BLOG_TAGS_QUERY);
  } catch (error) {
    return [];
  }
}

export async function getBlogArchive() {
  try {
    return await readClient.fetch(BLOG_ARCHIVE_QUERY);
  } catch (error) {
    return [];
  }
}

export async function incrementBlogViews(blogId) {
  try {
    if (!blogId) return false;

    await writeClient.patch(blogId).inc({ views: 1 }).commit();

    return true;
  } catch (error) {
    return false;
  }
}

export async function createBlogPost(blogData) {
  try {
    if (!blogData) throw new Error("Blog data is required");

    const blog = await writeClient.create({
      _type: "blog",
      ...blogData,
      status: "pending",
      views: 0,
      featured: false,
      createdAt: new Date().toISOString(),
    });

    return blog;
  } catch (error) {
    throw error;
  }
}

export async function updateBlogPost(blogId, updates) {
  try {
    if (!blogId) throw new Error("Blog ID is required");
    if (!updates) throw new Error("Updates are required");

    const blog = await writeClient
      .patch(blogId)
      .set({
        ...updates,
        _updatedAt: new Date().toISOString(),
      })
      .commit();

    return blog;
  } catch (error) {
    throw error;
  }
}

export async function deleteBlogPost(blogId) {
  try {
    if (!blogId) throw new Error("Blog ID is required");

    await writeClient.delete(blogId);
    return true;
  } catch (error) {
    throw error;
  }
}

export async function getBlogsByStatus(status = "pending") {
  try {
    const { query, params } = buildBlogsQuery({ status });
    return await readClient.fetch(query, params);
  } catch (error) {
    return [];
  }
}
