import { client } from "@/sanity/lib/client";
import { PUBLISHED_BLOGS_QUERY } from "@/sanity/queries/blogs";
import BlogHero from "./_components/BlogHero";
import BlogsClient from "./_components/BlogsClient";

export const metadata = {
  title: "المدونة",
  description:
    "ابقَ ملهمًا بالنصائح والاتجاهات والأدلة لجعل كل حدث لا يُنسى. سواء كنت منظم فعاليات أو شركة أو تخطط لاحتفال لمرة واحدة، نحن نوفر لك كل ما تحتاجه.",
};

export default async function BlogPage() {
  // Fetch all published blogs
  const blogs = await client.fetch(PUBLISHED_BLOGS_QUERY);

  return (
    <>
      <BlogHero />
      <BlogsClient blogs={blogs} />
    </>
  );
}
