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
    console.error("Error fetching published blogs:", error);
    return [];
  }
}

export async function getFeaturedBlogs() {
  try {
    return await readClient.fetch(FEATURED_BLOGS_QUERY);
  } catch (error) {
    console.error("Error fetching featured blogs:", error);
    return [];
  }
}

export async function getBlogBySlug(slug) {
  try {
    if (!slug) return null;
    return await readClient.fetch(BLOG_BY_SLUG_QUERY, { slug });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return null;
  }
}

export async function getBlogById(id) {
  try {
    if (!id) return null;
    return await readClient.fetch(BLOG_BY_ID_QUERY, { id });
  } catch (error) {
    console.error("Error fetching blog by id:", error);
    return null;
  }
}

export async function getBlogsByAuthor(authorId) {
  try {
    if (!authorId) return [];
    return await readClient.fetch(BLOGS_BY_AUTHOR_QUERY, { authorId });
  } catch (error) {
    console.error("Error fetching blogs by author:", error);
    return [];
  }
}

export async function getRecentBlogs(limit = 5) {
  try {
    return await readClient.fetch(RECENT_BLOGS_QUERY, { limit });
  } catch (error) {
    console.error("Error fetching recent blogs:", error);
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
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export async function getRelatedBlogs(currentBlogId, categoryId = null) {
  try {
    if (!currentBlogId || !categoryId) {
      // Fallback to recent blogs if no category
      return await readClient.fetch(RECENT_BLOGS_QUERY, { limit: 5 });
    }
    return await readClient.fetch(RELATED_BLOGS_QUERY, {
      currentBlogId,
      categoryId,
    });
  } catch (error) {
    console.error("Error fetching related blogs:", error);
    return [];
  }
}

export async function searchBlogs(options = {}) {
  try {
    const { query, params } = buildBlogsQuery(options);
    return await readClient.fetch(query, params);
  } catch (error) {
    console.error("Error searching blogs:", error);
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
    console.error("Error fetching blogs for tenant:", error);
    return [];
  }
}

export async function getPopularBlogTags() {
  try {
    return await readClient.fetch(POPULAR_BLOG_TAGS_QUERY);
  } catch (error) {
    console.error("Error fetching popular blog tags:", error);
    return [];
  }
}

export async function getBlogArchive() {
  try {
    return await readClient.fetch(BLOG_ARCHIVE_QUERY);
  } catch (error) {
    console.error("Error fetching blog archive:", error);
    return [];
  }
}

export async function incrementBlogViews(blogId) {
  try {
    if (!blogId) return false;

    await writeClient.patch(blogId).inc({ views: 1 }).commit();

    return true;
  } catch (error) {
    console.error("Error incrementing blog views:", error);
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
    console.error("Error creating blog post:", error);
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
    console.error("Error updating blog post:", error);
    throw error;
  }
}

export async function deleteBlogPost(blogId) {
  try {
    if (!blogId) throw new Error("Blog ID is required");

    await writeClient.delete(blogId);
    return true;
  } catch (error) {
    console.error("Error deleting blog post:", error);
    throw error;
  }
}

export async function getBlogsByStatus(status = "pending") {
  try {
    const { query, params } = buildBlogsQuery({ status });
    return await readClient.fetch(query, params);
  } catch (error) {
    console.error("Error fetching blogs by status:", error);
    return [];
  }
}
