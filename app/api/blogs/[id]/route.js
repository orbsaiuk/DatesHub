import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    // Fetch blog title by ID
    const blog = await writeClient.fetch(
      `*[_type == "blog" && _id == $id][0]{ _id, title }`,
      { id }
    );

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: blog._id,
      title: blog.title,
    });
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
