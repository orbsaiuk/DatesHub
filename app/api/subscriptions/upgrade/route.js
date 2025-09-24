import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getCurrentSubscription,
  updateSubscription,
  createPayment,
} from "@/services/sanity/subscriptions";
import { getPlanById } from "@/services/sanity/subscriptions";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tenantType, tenantId, newPlanId, stripeSubscriptionId } = body;

    if (!tenantType || !tenantId || !newPlanId) {
      return NextResponse.json(
        { error: "tenantType, tenantId, and newPlanId are required" },
        { status: 400 }
      );
    }

    // Get current subscription
    const currentSubscription = await getCurrentSubscription(
      tenantType,
      tenantId
    );

    if (!currentSubscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Get the new plan details
    const newPlan = await getPlanById(newPlanId);
    if (!newPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Update the subscription with new plan
    const updates = {
      plan: { _type: "reference", _ref: newPlanId },
      stripeSubscriptionId:
        stripeSubscriptionId || currentSubscription.stripeSubscriptionId,
    };

    // If upgrading to a plan with better limits, we don't need to reset usage
    // If downgrading, we might want to check usage limits
    const currentPlan = currentSubscription.plan;
    const isUpgrade = newPlan.price.amount > (currentPlan?.price?.amount || 0);

    if (!isUpgrade) {
      // Check if current usage exceeds new plan limits
      const usage = currentSubscription.usage || {};
      const newLimits = newPlan.limits || {};

      const violations = [];

      if (newLimits.blogPosts !== -1 && usage.blogPosts > newLimits.blogPosts) {
        violations.push(
          `Blog posts: ${usage.blogPosts}/${newLimits.blogPosts}`
        );
      }

      if (
        newLimits.teamMembers !== -1 &&
        usage.teamMembers > newLimits.teamMembers
      ) {
        violations.push(
          `Team members: ${usage.teamMembers}/${newLimits.teamMembers}`
        );
      }

      if (violations.length > 0) {
        return NextResponse.json(
          {
            error: "Current usage exceeds new plan limits",
            violations,
          },
          { status: 400 }
        );
      }
    }

    const updatedSubscription = await updateSubscription(
      currentSubscription._id,
      updates
    );

    // Create a record of the plan change
    const changeRecord = {
      _type: "payment",
      subscription: { _type: "reference", _ref: currentSubscription._id },
      tenantType,
      tenantId,
      amount: {
        total: isUpgrade
          ? newPlan.price.amount - (currentPlan?.price?.amount || 0)
          : 0,
        currency: newPlan.price.currency,
        tax: 0,
        discount: 0,
      },
      status: "succeeded",
      paymentMethod: {
        type: "subscription_change",
      },
      transactionDate: new Date().toISOString(),
      periodCovered: {
        start: currentSubscription.startDate || new Date().toISOString(),
        end:
          currentSubscription.endDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      notes: `Plan ${isUpgrade ? "upgraded" : "downgraded"} from ${currentPlan?.name || "Unknown"} to ${newPlan.name}`,
    };

    await createPayment(changeRecord);

    return NextResponse.json({
      subscription: updatedSubscription,
      isUpgrade,
      message: `Successfully ${isUpgrade ? "upgraded" : "downgraded"} to ${newPlan.name} plan`,
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return NextResponse.json(
      { error: "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}
