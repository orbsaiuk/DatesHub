import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventRequestId, action, companyResponse } = body;

    if (
      !eventRequestId ||
      !action ||
      !["accepted", "declined"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Verify the user has permission to respond to this event request
    const eventRequest = await writeClient.getDocument(eventRequestId);
    if (!eventRequest) {
      return NextResponse.json(
        { error: "Event request not found" },
        { status: 404 }
      );
    }

    // Check if user belongs to the target company
    const userProfile = await writeClient.fetch(
      `*[_type=="user" && clerkId==$uid][0]{memberships}`,
      { uid: userId }
    );
    const memberships = userProfile?.memberships || [];
    const hasPermission = memberships.some(
      (m) =>
        m.tenantType === "company" &&
        m.tenantId === eventRequest.targetCompanyTenantId
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to respond to this request" },
        { status: 403 }
      );
    }

    // Update the event request status
    const updatedEventRequest = await writeClient
      .patch(eventRequestId)
      .set({
        status: action,
        companyResponse: companyResponse || "",
        responseDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Find and update the corresponding message
    const messageQuery = `*[_type == "message" && eventRequestData.eventRequestId == $eventRequestId][0]`;
    const message = await writeClient.fetch(messageQuery, { eventRequestId });

    if (message) {
      await writeClient
        .patch(message._id)
        .set({
          "eventRequestData.status": action,
          "eventRequestData.companyResponse": companyResponse || "",
        })
        .commit();

      // Send a follow-up message in the conversation
      const followUpText =
        action === "accepted"
          ? `✅ تم قبول طلب الفعالية! ${companyResponse ? `\n\n${companyResponse}` : ""}`
          : `❌ تم رفض طلب الفعالية. ${companyResponse ? `\n\nالسبب: ${companyResponse}` : ""}`;

      const followUpMessage = {
        _type: "message",
        conversation: message.conversation,
        sender: {
          kind: "company",
          tenantId: eventRequest.targetCompanyTenantId,
        },
        text: followUpText,
        messageType: "text",
        createdAt: new Date().toISOString(),
      };

      await writeClient.create(followUpMessage);

      // Update conversation's last message info
      await writeClient
        .patch(message.conversation._ref)
        .set({
          lastMessageAt: new Date().toISOString(),
          lastMessagePreview: followUpText,
        })
        .commit();
    }

    return NextResponse.json({
      success: true,
      eventRequest: updatedEventRequest,
    });
  } catch (error) {
    console.error("Error handling event request action:", error);
    return NextResponse.json(
      { error: "Failed to process event request action" },
      { status: 500 }
    );
  }
}
