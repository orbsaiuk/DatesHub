import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { sendOrderRequestResponseToCustomer } from "@/services/email";

export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, companyResponse } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Verify the order request exists and user has permission to update it
    const orderRequest = await writeClient.fetch(
      `*[_type == "orderRequest" && _id == $id][0]`,
      { id }
    );

    if (!orderRequest) {
      return NextResponse.json(
        { error: "Order request not found" },
        { status: 404 }
      );
    }

    // Check if user is the company owner or the request creator
    // For now, we'll allow any authenticated user to update (you may want to add more validation)

    // Update the event request
    const result = await writeClient
      .patch(id)
      .set({
        status,
        companyResponse: companyResponse || "",
        responseDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Send email notification to customer about the company's response (fire-and-forget)
    try {
      const updatedOrderRequest = { ...orderRequest };
      const emailResult = await sendOrderRequestResponseToCustomer(
        updatedOrderRequest,
        { companyResponse }
      );
    } catch (emailError) {
      // Don't fail the update if email fails
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order request" },
      { status: 500 }
    );
  }
}
