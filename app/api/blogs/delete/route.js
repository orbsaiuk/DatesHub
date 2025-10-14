import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { revalidatePath } from "next/cache";

async function ensureUserMembership(userId, tenantType, tenantId) {
  const user = await writeClient.fetch(
    `*[_type == "user" && clerkId == $userId][0]{
      memberships[tenantType == $tenantType && tenantId == $tenantId]{ tenantId }
    }`,
    { userId, tenantType, tenantId }
  );
  return Boolean(user?.memberships?.length);
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id)
    return NextResponse.json({ error: "Blog ID required" }, { status: 400 });

  try {
    // Load blog to determine tenant and verify ownership
    const blog = await writeClient.fetch(
      `*[_type == "blog" && _id == $id][0]{
        _id,
        author { authorType, company->{ tenantId }, supplier->{ tenantId } }
      }`,
      { id }
    );

    if (!blog?._id) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const tenantType = blog.author?.authorType;
    const tenantId = blog.author?.[tenantType]?.tenantId;

    if (!tenantType || !tenantId) {
      return NextResponse.json(
        { error: "Invalid blog author" },
        { status: 400 }
      );
    }

    const hasAccess = await ensureUserMembership(userId, tenantType, tenantId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the blog
    await writeClient.delete(id);

    // Revalidate the corresponding business blogs page
    try {
      const path = `/business/${tenantType}/blogs`;
      revalidatePath(path);
    } catch (_) {
      // ignore
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        error: e?.message
          ? `Failed to delete blog: ${e.message}`
          : "Failed to delete blog",
      },
      { status: 500 }
    );
  }
}
