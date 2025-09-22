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

    // Check for accepted event requests from this user to this company
    const acceptedEventRequestQuery = `*[
      _type == "eventRequest" && 
      requestedBy == $userId && 
      targetCompanyTenantId == $companyTenantId && 
      status == "accepted"
    ][0]`;

    const acceptedEventRequest = await writeClient.fetch(
      acceptedEventRequestQuery,
      { userId, companyTenantId }
    );

    // Check for pending event requests from this user to this company
    const pendingEventRequestQuery = `*[
      _type == "eventRequest" && 
      requestedBy == $userId && 
      targetCompanyTenantId == $companyTenantId && 
      status == "pending"
    ][0]`;

    const pendingEventRequest = await writeClient.fetch(
      pendingEventRequestQuery,
      { userId, companyTenantId }
    );

    // Check for existing conversations between this user and company
    const conversationQuery = `*[
      _type == "conversation" && 
      "user" in participants[]._ref &&
      participants[]._ref match $userId &&
      companyTenantId == $companyTenantId
    ][0]`;

    const existingConversation = await writeClient.fetch(conversationQuery, {
      userId,
      companyTenantId,
    });

    return NextResponse.json({
      hasAcceptedRequest: !!acceptedEventRequest,
      hasPendingRequest: !!pendingEventRequest,
      hasConversation: !!existingConversation,
      canMessage: !!(acceptedEventRequest || existingConversation),
    });
  } catch (error) {
    console.error("Error checking company interaction status:", error);
    return NextResponse.json(
      { error: "Failed to check interaction status" },
      { status: 500 }
    );
  }
}
