import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { uuid } from "@sanity/uuid";
import htmlToPortableText from "@/lib/htmlToPortableText";

function toPortableText(content) {
  if (!content) return undefined;
  if (Array.isArray(content) && content.every((b) => b && b._type)) {
    return content.map((block) => ({
      _key: block._key || uuid(),
      _type: block._type || "block",
      style: block.style || "normal",
      markDefs: Array.isArray(block.markDefs) ? block.markDefs : [],
      children: Array.isArray(block.children)
        ? block.children.map((ch) => ({
            _key: ch._key || uuid(),
            _type: ch._type || "span",
            text: ch.text || "",
            marks: Array.isArray(ch.marks) ? ch.marks : [],
          }))
        : [{ _key: uuid(), _type: "span", text: "", marks: [] }],
    }));
  }
  const html = typeof content === "string" ? content : JSON.stringify(content);
  const blocks = htmlToPortableText(html);
  return blocks.map((b) => ({
    _key: b._key || uuid(),
    ...b,
    children: (b.children || []).map((c) => ({ ...c, _key: c._key || uuid() })),
  }));
}

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
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Parse body once based on Content-Type
    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    let body = {};
    let fileImageRef = undefined;
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const json = form.get("json");
      const file = form.get("file");
      body = json ? JSON.parse(json) : {};
      if (file && typeof file !== "string") {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const asset = await writeClient.assets.upload("image", buffer, {
          filename: file.name || "blog.jpg",
          contentType: file.type || "image/jpeg",
        });
        fileImageRef = {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        };
      }
    } else {
      body = await req.json().catch(() => ({}));
    }

    const {
      id,
      title,
      excerpt,
      content,
      blogImage,
      category,
      tags = [],
      readingTime,
      status,
    } = body || {};

    if (!id) {
      return NextResponse.json({ error: "Blog ID required" }, { status: 400 });
    }

    // Load blog to verify ownership
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

    // Build updates object
    const updates = {};
    if (title !== undefined) updates.title = String(title).slice(0, 200);
    if (excerpt !== undefined) updates.excerpt = String(excerpt).slice(0, 500);
    if (content !== undefined) {
      // Convert and upload any data URL images embedded in content
      let contentBlocks = toPortableText(content);
      async function resolveContentImages(blocks) {
        if (!Array.isArray(blocks)) return [];
        const resolved = [];
        for (const b of blocks) {
          if (
            b?._type === "image" &&
            b?.asset?._ref &&
            typeof b.asset._ref === "string"
          ) {
            const src = b.asset._ref;
            if (src.startsWith("data:")) {
              const match = src.match(/^data:(.*?);base64,(.*)$/);
              if (match) {
                const contentType = match[1] || "image/jpeg";
                const base64 = match[2];
                const buffer = Buffer.from(base64, "base64");
                const asset = await writeClient.assets.upload("image", buffer, {
                  filename: `content-${Date.now()}.jpg`,
                  contentType,
                });
                resolved.push({
                  ...b,
                  asset: { _type: "reference", _ref: asset._id },
                });
                continue;
              }
            }
          }
          resolved.push(b);
        }
        return resolved;
      }
      contentBlocks = await resolveContentImages(contentBlocks);
      updates.content = contentBlocks;
    }
    if (fileImageRef) updates.blogImage = fileImageRef;
    else if (blogImage !== undefined) updates.blogImage = blogImage;
    if (category !== undefined) {
      updates.category = category
        ? { _type: "reference", _ref: category }
        : null;
    }
    if (Array.isArray(tags)) updates.tags = tags;
    if (readingTime !== undefined)
      updates.readingTime = readingTime ? Number(readingTime) : null;
    if (
      status !== undefined &&
      ["pending", "published", "rejected"].includes(status)
    ) {
      updates.status = status;
    }
    updates._updatedAt = new Date().toISOString();

    if (Object.keys(updates).length === 1) {
      // Only _updatedAt
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const updated = await writeClient.patch(id).set(updates).commit();

    return NextResponse.json({ ok: true, blog: updated });
  } catch (err) {
    console.error("/api/blogs/update error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
