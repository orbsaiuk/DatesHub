import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { hasTenanMembership } from "@/lib/auth/authorization";
import {
  sendOrderRequestNotificationToCompany,
  sendOrderRequestConfirmationToCustomer,
} from "@/services/email";
import {
  findOrCreateUserConversation,
  sendMessage,
} from "@/services/sanity/messaging";
import { COMPANY_BY_TENANT_QUERY } from "@/sanity/queries/company";
import { USER_ID_BY_CLERK_ID_QUERY } from "@/sanity/queries/user";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const companyTenantId = searchParams.get("companyTenantId");

    let query = `*[_type == "orderRequest"`;
    let params = {};

    // Filter by user's order requests or company's received requests
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

    const orderRequests = await writeClient.fetch(query, params);

    return NextResponse.json(orderRequests);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch order requests" },
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

    // Validate required fields for order request
    const {
      fullName,
      deliveryDate,
      quantity,
      category,
      deliveryAddress,
      additionalNotes,
      targetCompanyTenantId,
    } = body;

    if (
      !fullName ||
      !deliveryDate ||
      !quantity ||
      !category ||
      !deliveryAddress ||
      !targetCompanyTenantId
    ) {
      return NextResponse.json(
        { error: "Required order request fields are missing" },
        { status: 400 }
      );
    }

    // Fetch the company document to create a reference
    const company = await writeClient.fetch(COMPANY_BY_TENANT_QUERY, {
      tenantType: "company",
      tenantId: targetCompanyTenantId,
    });

    if (!company?._id) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Fetch the user document to create a reference
    const user = await writeClient.fetch(USER_ID_BY_CLERK_ID_QUERY, {
      uid: userId,
    });

    if (!user?._id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create order request document
    const orderRequestData = {
      _type: "orderRequest",
      title: body.title || `طلب ${category} - ${quantity}`,
      business: {
        _type: "reference",
        _ref: company._id,
      },
      user: {
        _type: "reference",
        _ref: user._id,
      },
      fullName,
      deliveryDate,
      quantity,
      category,
      deliveryAddress,
      status: "pending",
      targetCompanyTenantId,
      requestedBy: userId,
      createdAt: new Date().toISOString(),
    };

    // Only add additionalNotes if it's provided
    if (additionalNotes) {
      orderRequestData.additionalNotes = additionalNotes;
    }

    const result = await writeClient.create(orderRequestData);

    // Create or find conversation between user and company
    try {
      const conversation = await findOrCreateUserConversation({
        userId,
        companyTenantId: targetCompanyTenantId,
      });

      // Send order request as a message
      await sendMessage({
        conversationId: conversation._id,
        sender: {
          kind: "user",
          clerkId: userId,
        },
        text: "طلب جديد",
        messageType: "order_request",
        orderRequest: {
          _type: "reference",
          _ref: result._id,
        },
      });
    } catch (conversationError) {
      // Don't fail the request creation if messaging fails
    }

    // CRITICAL: Send emails in parallel and WAIT before returning (serverless requirement)
    const emailPromises = [
      sendOrderRequestNotificationToCompany(orderRequestData),
      sendOrderRequestConfirmationToCustomer(orderRequestData),
    ];

    const emailResults = await Promise.allSettled(emailPromises);

    // Emails sent - results available in emailResults if needed

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order request" },
      { status: 500 }
    );
  }
}
