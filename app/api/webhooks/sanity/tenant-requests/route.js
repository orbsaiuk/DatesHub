import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { USER_BY_ID_OR_CLERKID_QUERY } from "@/sanity/queries/user";
import { uuid } from "@sanity/uuid";
import { safeUpdateClerkRole } from "@/services/clerk";
import { sendApprovalEmail, sendRejectionEmail } from "@/services/email";
import {
  createCompanyDocument,
  createSupplierDocument,
} from "@/services/sanity/entities";
import { ensureUserMembership } from "@/services/sanity/memberships";
import {
  getPlanBySlug,
  getAllPlans,
  createSubscription,
} from "@/services/sanity/subscriptions";

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
        const emailResult = await sendRejectionEmail(doc);
        if (emailResult.ok) {
          console.log("Rejection email sent successfully");
        } else {
          console.warn(
            "Rejection email failed:",
            emailResult.error || emailResult.reason
          );
        }
      } catch (emailError) {
        console.error("Rejection email notification error:", emailError);
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

    // Log Clerk role update result (non-blocking)
    if (
      clerkResult.status === "fulfilled" &&
      !clerkResult.value?.ok &&
      !clerkResult.value?.skipped
    ) {
      console.error("Clerk role update failed", clerkResult.value);
    } else if (clerkResult.status === "rejected") {
      console.error("Clerk role update error", clerkResult.reason);
    }

    // Log Sanity user role update result (non-blocking)
    if (
      sanityUserResult.status === "fulfilled" &&
      !sanityUserResult.value?.ok
    ) {
      console.error("Sanity user role update failed", sanityUserResult.value);
    } else if (sanityUserResult.status === "rejected") {
      console.error("Sanity user role update error", sanityUserResult.reason);
    }

    // Entity creation is critical - must succeed
    if (entityResult.status === "rejected") {
      throw new Error(`Entity creation failed: ${entityResult.reason}`);
    }
    const created = entityResult.value;

    // Create default Free subscription for the new tenant (best-effort)
    try {
      let freePlan = await getPlanBySlug("free");
      if (!freePlan) {
        const plans = await getAllPlans();
        freePlan = (plans || []).find((p) => {
          try {
            const amt = p?.price?.amount;
            return Number(amt) === 0;
          } catch (_) {
            return false;
          }
        });
      }

      if (freePlan?._id) {
        await createSubscription({
          tenantType: entityType,
          tenantId,
          plan: { _type: "reference", _ref: freePlan._id },
          status: "active",
          startDate: new Date().toISOString(),
        });
      }
    } catch (subErr) {
      console.error("Failed to create default Free subscription:", subErr);
      // Non-blocking
    }

    // User membership is important but not critical for webhook success
    if (membershipResult.status === "rejected") {
      console.error("User membership creation failed", membershipResult.reason);
    }

    // patch tenantRequest with createdCompanyId
    await writeClient
      .patch(doc._id)
      .set({ createdCompanyId: created._id })
      .commit();

    // Send approval email notification
    try {
      const emailResult = await sendApprovalEmail(doc);
      if (emailResult.ok) {
        console.log("Approval email sent successfully");
      } else {
        console.warn(
          "Approval email failed:",
          emailResult.error || emailResult.reason
        );
      }
    } catch (emailError) {
      console.error("Email notification error:", emailError);
      // Don't fail the webhook if email fails
    }

    return NextResponse.json({ ok: true, created: created._id, tenantId });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
