import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { hasTenanMembership } from "@/lib/auth/authorization";
import { sendMessage } from "@/services/sanity/messaging";
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventRequestId = resolvedParams?.id;
    const body = await request.json();
    const { action, message: responseMessage } = body;

    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    // Get the event request
    const eventRequest = await writeClient.getDocument(eventRequestId);
    if (!eventRequest) {
      return NextResponse.json(
        { error: "Event request not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to respond (company member)
    const hasPermission = await hasTenanMembership(
      userId,
      "company",
      eventRequest.targetCompanyTenantId
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Unauthorized to respond to this event request" },
        { status: 403 }
      );
    }

    // Update event request status
    const newStatus = action === "accept" ? "accepted" : "declined";
    await writeClient
      .patch(eventRequestId)
      .set({
        status: newStatus,
        companyResponse: responseMessage || "",
        responseDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Find the conversation between the user and company
    const conversation = await writeClient.fetch(
      `*[_type == "conversation" && 
        (participants[0].clerkId == $userId || participants[1].clerkId == $userId) &&
        (participants[0].tenantId == $companyTenantId || participants[1].tenantId == $companyTenantId)
      ][0]`,
      {
        userId: eventRequest.requestedBy,
        companyTenantId: eventRequest.targetCompanyTenantId,
      }
    );

    if (conversation) {
      // Find the original event request message and update it
      const originalMessage = await writeClient.fetch(
        `*[_type == "message" && conversation._ref == $conversationId && eventRequestData.eventRequestId == $eventRequestId][0]`,
        {
          conversationId: conversation._id,
          eventRequestId: eventRequestId,
        }
      );

      if (originalMessage) {
        // Update the original message with the new status
        await writeClient
          .patch(originalMessage._id)
          .set({
            "eventRequestData.status": newStatus,
            "eventRequestData.companyResponse": responseMessage || "",
          })
          .commit();
      }

      // Send a response message
      const actionText = action === "accept" ? "accepted" : "declined";
      const responseText = responseMessage
        ? `Event request ${actionText}: ${responseMessage}`
        : `Event request ${actionText}`;

      await sendMessage({
        conversationId: conversation._id,
        sender: {
          kind: "company",
          tenantId: eventRequest.targetCompanyTenantId,
        },
        text: responseText,
      });
    }

    return NextResponse.json({
      success: true,
      eventRequest: {
        ...eventRequest,
        status: newStatus,
        companyResponse: responseMessage || "",
        responseDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing event request action:", error);
    return NextResponse.json(
      { error: "Failed to process event request action" },
      { status: 500 }
    );
  }
}
