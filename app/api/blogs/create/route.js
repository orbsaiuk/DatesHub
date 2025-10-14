import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { hasTenanMembership } from "@/lib/auth/authorization";
import { COMPANY_BY_TENANT_QUERY } from "@/sanity/queries/company";
import { SUPPLIER_BY_TENANT_QUERY } from "@/sanity/queries/supplier";

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
      tenantType, // "company" | "supplier"
      tenantId,
      title,
      excerpt,
      content,
      contentHtml,
      contentText,
      blogImage,
      tags = [],
      readingTime,
      status = "pending",
    } = body || {};

    if (!tenantType || !tenantId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowedType = tenantType === "company" || tenantType === "supplier";
    if (!allowedType) {
      return NextResponse.json(
        { error: "Invalid tenantType" },
        { status: 400 }
      );
    }

    const hasAccess = await hasTenanMembership(userId, tenantType, tenantId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Resolve parent document by tenant
    const parent = await writeClient.fetch(
      tenantType === "company"
        ? COMPANY_BY_TENANT_QUERY
        : SUPPLIER_BY_TENANT_QUERY,
      { tenantType, tenantId }
    );
    if (!parent?._id) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    // Use new content structure - prioritize contentHtml over legacy content
    const finalContentHtml = contentHtml || content || "";
    const finalContentText = contentText || "";

    const blogDoc = {
      _type: "blog",
      title: String(title).slice(0, 200),
      slug: {
        _type: "slug",
        current:
          String(title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
            .slice(0, 96) || "blog-post",
      },
      excerpt: excerpt ? String(excerpt).slice(0, 500) : undefined,
      contentHtml: finalContentHtml ? String(finalContentHtml) : undefined,
      contentText: finalContentText ? String(finalContentText) : undefined,
      blogImage: fileImageRef || blogImage,
      tags: Array.isArray(tags) ? tags : [],
      readingTime: readingTime ? Number(readingTime) : undefined,
      status: ["pending", "published", "rejected"].includes(status)
        ? status
        : "pending",
      author: {
        authorType: tenantType,
        [tenantType]: { _type: "reference", _ref: parent._id },
      },
      views: 0,
      featured: false,
      createdAt: new Date().toISOString(),
    };

    const created = await writeClient.create(blogDoc);

    return NextResponse.json({ ok: true, blog: created });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
