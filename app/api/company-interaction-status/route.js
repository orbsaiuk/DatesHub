import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyTenantId = searchParams.get("companyTenantId");

    if (!companyTenantId) {
      return NextResponse.json(
        { error: "Company tenant ID is required" },
        { status: 400 }
      );
    }

    // Check for accepted order requests from this user to this company
    const acceptedOrderRequestQuery = `*[
      _type == "orderRequest" && 
      requestedBy == $userId && 
      targetCompanyTenantId == $companyTenantId && 
      status == "accepted"
    ][0]`;

    const acceptedOrderRequest = await writeClient.fetch(
      acceptedOrderRequestQuery,
      { userId, companyTenantId }
    );

    // Check for pending order requests from this user to this company
    const pendingOrderRequestQuery = `*[
      _type == "orderRequest" && 
      requestedBy == $userId && 
      targetCompanyTenantId == $companyTenantId && 
      status == "pending"
    ][0]`;

    const pendingOrderRequest = await writeClient.fetch(
      pendingOrderRequestQuery,
      { userId, companyTenantId }
    );

    // Check for existing conversations between this user and company
    const userDoc = await writeClient.fetch(
      `*[_type == "user" && clerkId == $userId][0]._id`,
      { userId }
    );

    const companyDoc = await writeClient.fetch(
      `*[_type == "company" && tenantId == $companyTenantId][0]._id`,
      { companyTenantId }
    );

    let existingConversation = null;
    if (userDoc && companyDoc) {
      existingConversation = await writeClient.fetch(
        `*[_type == "conversation" && 
          ((participant1._ref == $userDoc && participant2._ref == $companyDoc) ||
           (participant1._ref == $companyDoc && participant2._ref == $userDoc))][0]`,
        { userDoc, companyDoc }
      );
    }

    return NextResponse.json({
      hasAcceptedRequest: !!acceptedOrderRequest,
      hasPendingRequest: !!pendingOrderRequest,
      hasConversation: !!existingConversation,
      canMessage: !!(acceptedOrderRequest || existingConversation),
    });
  } catch (error) {
    console.error("Error checking company interaction status:", error);
    return NextResponse.json(
      { error: "Failed to check interaction status" },
      { status: 500 }
    );
  }
}
