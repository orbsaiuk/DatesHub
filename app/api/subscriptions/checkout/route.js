import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createCheckoutSession, getOrCreateCustomer } from "@/services/stripe";
import { getUserCompany, getUserSupplier } from "@/services/sanity/entities";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantType, tenantId, planId, stripePriceId } =
      await request.json();

    if (!tenantType || !tenantId || !planId || !stripePriceId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: tenantType, tenantId, planId, stripePriceId",
        },
        { status: 400 }
      );
    }

    // Get tenant information
    let tenant;
    if (tenantType === "company") {
      tenant = await getUserCompany(userId);
    } else if (tenantType === "supplier") {
      tenant = await getUserSupplier(userId);
    }

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Derive effective tenant name from membership object shape
    const effectiveTenantName =
      tenantType === "company"
        ? tenant?.company?.name
        : tenantType === "supplier"
          ? tenant?.supplier?.name
          : undefined;

    // Fail fast if environment not configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured (missing STRIPE_SECRET_KEY)" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Fetch Clerk user to use real owner email for Stripe instead of synthetic fallback
    let derivedEmail = null;
    let derivedName = null;
    try {
      const user = await currentUser();
      derivedEmail =
        user?.primaryEmailAddress?.emailAddress ||
        user?.emailAddresses?.[0]?.emailAddress ||
        null;
    } catch (e) {
      // Non-fatal; we'll fallback below
    }

    derivedName = effectiveTenantName;

    // Create or get Stripe customer
    const customer = await getOrCreateCustomer({
      email: derivedEmail,
      name: derivedName,
      tenantType,
      tenantId,
    });

    // Create checkout session only for paid plans
    const session = await createCheckoutSession({
      priceId: stripePriceId,
      customerId: customer.id,
      tenantType,
      tenantId,
      tenantName: effectiveTenantName,
      successUrl: `${appUrl}/business/${tenantType}/packages?success=true`,
      cancelUrl: `${appUrl}/business/${tenantType}/packages?canceled=true`,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session?.url,
      sessionId: session?.id,
      plan: { id: planId },
    });
  } catch (error) {
    // Surface more diagnostic info in server logs while keeping response generic
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        detail:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
