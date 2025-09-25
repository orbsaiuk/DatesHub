import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { hasTenanMembership } from "@/lib/auth/authorization";
import {
  sendEventRequestNotificationToCompany,
  sendEventRequestConfirmationToCustomer,
} from "@/services/email";
import {
  findOrCreateUserConversation,
  sendMessage,
} from "@/services/sanity/messaging";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const companyTenantId = searchParams.get("companyTenantId");

    let query = `*[_type == "eventRequest"`;
    let params = {};

    // Filter by user's requests or company's received requests
    if (companyTenantId) {
      // Verify user has access to this company
      const hasAccess = await hasTenanMembership(
        userId,
        "company",
        companyTenantId
      );
      if (!hasAccess) {
        return NextResponse.json(
          { error: "Access denied to company data" },
          { status: 403 }
        );
      }
      query += ` && targetCompanyTenantId == $companyTenantId`;
      params.companyTenantId = companyTenantId;
    } else {
      query += ` && requestedBy == $userId`;
      params.userId = userId;
    }

    // Filter by status if provided
    if (status) {
      query += ` && status == $status`;
      params.status = status;
    }

    query += `] | order(createdAt desc)`;

    const eventRequests = await writeClient.fetch(query, params);

    return NextResponse.json(eventRequests);
  } catch (error) {
    console.error("Error fetching event requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch event requests" },
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

    // Validate required fields for event request
    const {
      fullName,
      eventDate,
      eventTime,
      numberOfGuests,
      category,
      serviceRequired,
      eventLocation,
      eventDescription,
      targetCompanyTenantId,
    } = body;

    if (
      !fullName ||
      !eventDate ||
      !eventTime ||
      !numberOfGuests ||
      !category ||
      !serviceRequired ||
      !eventLocation ||
      !eventDescription ||
      !targetCompanyTenantId
    ) {
      return NextResponse.json(
        { error: "All event request fields are required" },
        { status: 400 }
      );
    }

    // Create event request document
    const eventRequestData = {
      _type: "eventRequest",
      title: body.title || `Event Request for ${serviceRequired}`,
      fullName,
      eventDate,
      eventTime,
      numberOfGuests: numberOfGuests, // Keep as string to support ranges like "10-20"
      category,
      serviceRequired,
      eventLocation,
      eventDescription,
      status: "pending",
      priority: body.priority || "medium",
      targetCompanyTenantId,
      requestedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await writeClient.create(eventRequestData);

    // Create or find conversation between user and company
    try {
      const conversation = await findOrCreateUserConversation({
        userId,
        companyTenantId: targetCompanyTenantId,
      });

      // Send event request as a message
      await sendMessage({
        conversationId: conversation._id,
        sender: {
          kind: "user",
          clerkId: userId,
        },
        text: `New Event Request: ${serviceRequired}`,
        messageType: "event_request",
        eventRequestData: {
          eventRequestId: result._id,
          fullName,
          eventDate,
          eventTime,
          numberOfGuests,
          category,
          serviceRequired,
          eventLocation,
          eventDescription,
          status: "pending",
        },
      });
    } catch (conversationError) {
      console.error("Error creating conversation/message:", conversationError);
      // Don't fail the request creation if messaging fails
    }

    // Send email notification to company (fire-and-forget)
    try {
      const emailResult =
        await sendEventRequestNotificationToCompany(eventRequestData);
      if (emailResult.ok) {
        console.log("Event request notification sent to company successfully");
      } else {
        console.warn(
          "Event request notification to company failed:",
          emailResult.error || emailResult.reason
        );
      }
    } catch (emailError) {
      console.error(
        "Error sending event request notification to company:",
        emailError
      );
      // Don't fail the request creation if email fails
    }

    // Send confirmation email to the customer (fire-and-forget)
    try {
      const customerEmailResult =
        await sendEventRequestConfirmationToCustomer(eventRequestData);
      if (!customerEmailResult.ok) {
        console.warn(
          "Event request confirmation to customer failed:",
          customerEmailResult.error || customerEmailResult.reason
        );
      }
    } catch (customerEmailError) {
      console.error(
        "Error sending event request confirmation to customer:",
        customerEmailError
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating event request:", error);
    return NextResponse.json(
      { error: "Failed to create event request" },
      { status: 500 }
    );
  }
}
