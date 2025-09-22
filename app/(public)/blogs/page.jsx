import { writeClient } from "@/sanity/lib/serverClient";
import { PUBLISHED_BLOGS_QUERY } from "@/sanity/queries/blogs";
import { ALL_CATEGORIES_QUERY } from "@/sanity/queries/categories";
import BlogHero from "./_components/BlogHero";
import BlogsClient from "./_components/BlogsClient";

export const metadata = {
  title: "Our Blog - OrbsAI",
  description:
    "Stay inspired with tips, trends, and guides to make every event unforgettable. Whether you're an event planner, a business, or just planning a one-off celebration, we've got you covered.",
};

export default async function BlogPage() {
  // Fetch all blogs and categories without any filters
  const [blogs, categories] = await Promise.all([
    writeClient.fetch(PUBLISHED_BLOGS_QUERY),
    writeClient.fetch(ALL_CATEGORIES_QUERY),
  ]);

  console.log(blogs);

  return (
    <>
      <BlogHero />
      <BlogsClient blogs={blogs} categories={categories} />
    </>
  );
}
