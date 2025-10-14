import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { USER_BY_ID_OR_CLERKID_QUERY } from "@/sanity/queries/user";
import { uuid } from "@sanity/uuid";
import { safeUpdateClerkRole } from "@/services/clerk";
import {
  sendOrderRequestApprovalEmail,
  sendOrderRequestRejectionEmail,
} from "@/services/email";
import {
  createCompanyDocument,
  createSupplierDocument,
} from "@/services/sanity/entities";
import { ensureUserMembership } from "@/services/sanity/memberships";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const doc = body; // webhook sends the updated doc

    if (doc._type !== "tenantRequest") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Handle rejection emails
    if (doc.status === "rejected") {
      try {
        await sendOrderRequestRejectionEmail(doc);
      } catch (emailError) {
        // Silent fail - email is not critical
      }
      return NextResponse.json({ ok: true, rejectionEmailSent: true });
    }

    // Only proceed with entity creation for approved requests
    if (doc.status !== "approved") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // avoid duplicate entities
    if (doc.createdCompanyId) {
      return NextResponse.json({ ok: true, alreadyExists: true });
    }

    const tenantId = uuid();
    const entityType = doc.tenantType || "company";

    // Parallelize independent operations with timeout protection
    const operations = await Promise.allSettled([
      // Clerk role update (independent)
      Promise.race([
        safeUpdateClerkRole(doc.requestedBy, doc.tenantType),
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ ok: false, skipped: true, reason: "timeout" }),
            5000
          )
        ),
      ]),
      // Sanity user role update (independent)
      (async () => {
        try {
          const clerkId = doc.requestedBy;
          const deterministicUserId = `user.${clerkId}`;
          const existing = await writeClient.fetch(
            USER_BY_ID_OR_CLERKID_QUERY,
            {
              id: deterministicUserId,
              clerkId,
            }
          );
          const targetId = existing?._id || deterministicUserId;
          await writeClient
            .patch(targetId)
            .set({ role: doc.tenantType })
            .commit({ autoGenerateArrayKeys: true });
          return { ok: true };
        } catch (e) {
          return { ok: false, error: String(e) };
        }
      })(),
      // Entity creation (core operation)
      entityType === "supplier"
        ? createSupplierDocument(doc, tenantId)
        : createCompanyDocument(doc, tenantId),
      // User membership (depends on tenantId but can run concurrently with entity creation)
      ensureUserMembership(doc.requestedBy, entityType, tenantId),
    ]);

    // Handle results
    const [clerkResult, sanityUserResult, entityResult, membershipResult] =
      operations;

    // Role update results available if needed (non-blocking)

    // Entity creation is critical - must succeed
    if (entityResult.status === "rejected") {
      throw new Error(`Entity creation failed: ${entityResult.reason}`);
    }
    const created = entityResult.value;

    // User membership is important but not critical for webhook success (non-blocking)

    // patch tenantRequest with createdCompanyId
    await writeClient
      .patch(doc._id)
      .set({ createdCompanyId: created._id })
      .commit();

    // Send approval email notification
    try {
      await sendOrderRequestApprovalEmail(doc);
    } catch (emailError) {
      // Don't fail the webhook if email fails
    }

    return NextResponse.json({ ok: true, created: created._id, tenantId });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
