import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createBillingPortalSession } from "@/services/stripe";
import { getCurrentSubscription } from "@/services/sanity/subscriptions";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantType, tenantId } = await request.json();

    if (!tenantType || !tenantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Creating billing portal

    // Get current subscription
    const subscription = await getCurrentSubscription(tenantType, tenantId);

    if (!subscription || !subscription.stripeCustomerId) {
      // No subscription found
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Create billing portal session with proper URL handling
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://billing.stripe.com/p/login/test_6oU3cwa3DbGM5jjd0Q93y00";
    const returnUrl = new URL(
      `/business/${tenantType}/packages`,
      baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`
    ).href;

    const session = await createBillingPortalSession(
      subscription.stripeCustomerId,
      returnUrl
    );

    return NextResponse.json({
      success: true,
      portalUrl: session.url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
