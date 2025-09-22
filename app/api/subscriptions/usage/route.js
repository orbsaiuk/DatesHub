import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getSubscriptionUsage,
  checkUsageLimit,
  incrementUsage,
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
    const usageType = searchParams.get("usageType");

    if (!tenantType || !tenantId) {
      return NextResponse.json(
        { error: "tenantType and tenantId are required" },
        { status: 400 }
      );
    }

    if (usageType) {
      // Check specific usage limit
      const result = await checkUsageLimit(tenantType, tenantId, usageType);
      return NextResponse.json({ [usageType]: result });
    } else {
      // Get all usage information
      const subscription = await getSubscriptionUsage(tenantType, tenantId);

      if (!subscription) {
        return NextResponse.json(
          { error: "No active subscription found" },
          { status: 404 }
        );
      }

      const limits = subscription.plan?.limits || {};
      const usage = subscription.usage || {};

      const usageInfo = {};

      // Check all usage types
      const usageTypes = ["blogPosts", "teamMembers", "storage", "apiRequests"];

      for (const type of usageTypes) {
        const limit = limits[type];
        const current = usage[type] || 0;

        usageInfo[type] = {
          current,
          limit: limit === -1 ? "unlimited" : limit,
          allowed: limit === -1 || current < limit,
          remaining: limit === -1 ? "unlimited" : Math.max(0, limit - current),
          percentage: limit === -1 ? 0 : Math.min((current / limit) * 100, 100),
        };
      }

      // Add boolean features
      usageInfo.features = {
        customDomain: limits.customDomain || false,
        prioritySupport: limits.prioritySupport || false,
        analytics: limits.analytics || false,
      };

      return NextResponse.json({
        usage: usageInfo,
        subscription: {
          status: subscription.status,
          planName: subscription.plan?.name,
        },
      });
    }
  } catch (error) {
    console.error("Error checking usage:", error);
    return NextResponse.json(
      { error: "Failed to check usage" },
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
    const { tenantType, tenantId, usageType, increment = 1 } = body;

    if (!tenantType || !tenantId || !usageType) {
      return NextResponse.json(
        { error: "tenantType, tenantId, and usageType are required" },
        { status: 400 }
      );
    }

    // Check if the usage increment is allowed
    const check = await checkUsageLimit(tenantType, tenantId, usageType);

    if (!check.allowed && check.reason !== "Error checking limits") {
      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          current: check.current,
          limit: check.limit,
          remaining: check.remaining,
        },
        { status: 403 }
      );
    }

    // If we're incrementing and would exceed the limit
    if (
      check.limit !== "unlimited" &&
      check.current + increment > check.limit
    ) {
      return NextResponse.json(
        {
          error: "Usage increment would exceed limit",
          current: check.current,
          limit: check.limit,
          requested: increment,
          available: check.remaining,
        },
        { status: 403 }
      );
    }

    // Increment the usage
    const result = await incrementUsage(
      tenantType,
      tenantId,
      usageType,
      increment
    );

    return NextResponse.json({
      success: true,
      newUsage: result.usage[usageType],
      increment,
    });
  } catch (error) {
    console.error("Error updating usage:", error);
    return NextResponse.json(
      { error: "Failed to update usage" },
      { status: 500 }
    );
  }
}
