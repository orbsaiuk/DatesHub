import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasTenanMembership } from "@/lib/auth/authorization";
import {
  getCurrentSubscription,
  createSubscription,
  updateSubscription,
} from "@/services/sanity/subscriptions";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantType = searchParams.get("tenantType");
    const tenantId = searchParams.get("tenantId");

    if (!tenantType || !tenantId) {
      return NextResponse.json(
        { error: "tenantType and tenantId are required" },
        { status: 400 }
      );
    }

    // Verify user has access to this tenant
    const hasAccess = await hasTenanMembership(userId, tenantType, tenantId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to tenant data" },
        { status: 403 }
      );
    }

    const subscription = await getCurrentSubscription(tenantType, tenantId);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      tenantType,
      tenantId,
      planId,
      stripeSubscriptionId,
      stripeCustomerId,
    } = body;

    if (!tenantType || !tenantId || !planId) {
      return NextResponse.json(
        { error: "tenantType, tenantId, and planId are required" },
        { status: 400 }
      );
    }

    // Verify user has access to this tenant
    const hasAccess = await hasTenanMembership(userId, tenantType, tenantId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to tenant data" },
        { status: 403 }
      );
    }

    const existingSubscription = await getCurrentSubscription(
      tenantType,
      tenantId
    );

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Active subscription already exists" },
        { status: 409 }
      );
    }

    // Create new subscription
    const subscriptionData = {
      tenantType,
      tenantId,
      plan: { _type: "reference", _ref: planId },
      tenant: {
        _type: "reference",
        _ref: await getTenantDocId(tenantType, tenantId),
      },
      status: "active",
      startDate: new Date().toISOString(),
      stripeSubscriptionId,
      stripeCustomerId,
    };

    const subscription = await createSubscription(subscriptionData);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, ...updates } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required" },
        { status: 400 }
      );
    }

    const subscription = await updateSubscription(subscriptionId, updates);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// Helper function to get tenant document ID
async function getTenantDocId(tenantType, tenantId) {
  const { writeClient } = await import("@/sanity/lib/serverClient");
  const query = `*[_type == "${tenantType}" && tenantId == $tenantId][0]._id`;
  const docId = await writeClient.fetch(query, { tenantId });

  if (!docId) {
    throw new Error(`${tenantType} with tenantId ${tenantId} not found`);
  }

  return docId;
}
