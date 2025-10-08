import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { hasTenanMembership } from "@/lib/auth/authorization";
import { sendMessage } from "@/services/sanity/messaging";
import { sendOrderRequestResponseToCustomer } from "@/services/email";
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const orderRequestId = resolvedParams?.id;
    const body = await request.json();
    const { action, message: responseMessage } = body;

    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    // Get the order request
    const orderRequest = await writeClient.getDocument(orderRequestId);
    if (!orderRequest) {
      return NextResponse.json(
        { error: "Order request not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to respond (company member)
    const hasPermission = await hasTenanMembership(
      userId,
      "company",
      orderRequest.targetCompanyTenantId
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Unauthorized to respond to this order request" },
        { status: 403 }
      );
    }

    // Update order request status
    const newStatus = action === "accept" ? "accepted" : "declined";
    const updatedOrderRequest = await writeClient
      .patch(orderRequestId)
      .set({
        status: newStatus,
        companyResponse: responseMessage || "",
        updatedAt: new Date().toISOString(),
        responseDate: new Date().toISOString(),
      })
      .commit();

    // Find the conversation between the user and company
    // First get the user and company document IDs
    const userDoc = await writeClient.fetch(
      `*[_type == "user" && clerkId == $userId][0]._id`,
      { userId: orderRequest.requestedBy }
    );

    const companyDoc = await writeClient.fetch(
      `*[_type == "company" && tenantId == $companyTenantId][0]._id`,
      { companyTenantId: orderRequest.targetCompanyTenantId }
    );

    let conversation = null;
    if (userDoc && companyDoc) {
      conversation = await writeClient.fetch(
        `*[_type == "conversation" && 
          ((participant1._ref == $userDoc && participant2._ref == $companyDoc) ||
           (participant1._ref == $companyDoc && participant2._ref == $userDoc))][0]`,
        { userDoc, companyDoc }
      );
    }

    if (conversation && action === "accept") {
      // Only send in-app message when order is accepted
      const responseText = responseMessage
        ? `✅ تم قبول طلبك!\n\n${responseMessage}`
        : `✅ تم قبول طلبك!`;

      await sendMessage({
        conversationId: conversation._id,
        sender: {
          kind: "company",
          tenantId: orderRequest.targetCompanyTenantId,
        },
        text: responseText,
      });
    }

    // Send email notification to customer
    try {
      await sendOrderRequestResponseToCustomer(updatedOrderRequest);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      orderRequest: {
        ...orderRequest,
        status: newStatus,
        companyResponse: responseMessage || "",
        responseDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process order request action" },
      { status: 500 }
    );
  }
}
