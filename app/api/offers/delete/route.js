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
  if (!id) return NextResponse.json({ error: "Missing" }, { status: 400 });
  try {
    // Load offer to determine tenant and parent
    const offer = await writeClient.fetch(
      `*[_type == "offers" && _id == $id][0]{
        _id,
        tenantType,
        tenantId,
        company->{ _id },
        supplier->{ _id }
      }`,
      { id }
    );
    if (!offer?._id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Authorization: ensure user is a member of the same tenant
    const allowedType =
      offer.tenantType === "company" || offer.tenantType === "supplier";
    if (!allowedType) {
      return NextResponse.json({ error: "Invalid tenant" }, { status: 400 });
    }
    const hasAccess = await ensureUserMembership(
      userId,
      offer.tenantType,
      offer.tenantId
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Remove back-reference from parent document (if exists), then delete the offer
    const parentId =
      offer.tenantType === "company" ? offer.company?._id : offer.supplier?._id;
    const tx = writeClient.transaction();
    if (parentId) {
      tx.patch(parentId, (p) => p.unset([`offers[_ref == "${id}"]`]));
    }
    tx.delete(id);
    await tx.commit().catch((e) => {
      throw new Error(
        `Sanity transaction failed: ${e?.message || "unknown error"}`
      );
    });

    // Revalidate the corresponding business offers page
    try {
      const path = `/business/${offer.tenantType}/offers`;
      revalidatePath(path);
    } catch (_) {
      // ignore
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        error: e?.message
          ? `Failed to delete offer: ${e.message}`
          : "Failed to delete offer",
      },
      { status: 500 }
    );
  }
}
