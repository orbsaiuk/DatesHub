import { writeClient } from "@/sanity/lib/serverClient";
import { PUBLISHED_BLOGS_QUERY } from "@/sanity/queries/blogs";
import { ALL_CATEGORIES_QUERY } from "@/sanity/queries/categories";
import BlogHero from "./_components/BlogHero";
import BlogsClient from "./_components/BlogsClient";

export const metadata = {
  title: "المدونة",
  description:
    "ابقَ ملهمًا بالنصائح والاتجاهات والأدلة لجعل كل حدث لا يُنسى. سواء كنت منظم فعاليات أو شركة أو تخطط لاحتفال لمرة واحدة، نحن نوفر لك كل ما تحتاجه.",
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
