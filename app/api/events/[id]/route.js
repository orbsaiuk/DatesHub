import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { EVENT_BY_ID_QUERY } from "@/sanity/queries/event";
import { getUserCompany, getUserSupplier } from "@/services/sanity/entities";

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const event = await writeClient.fetch(EVENT_BY_ID_QUERY, { eventId: id });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify user has access to this event
    let tenantId = null;
    const company = await getUserCompany(userId);
    if (company) {
      tenantId = company.tenantId;
    } else {
      const supplier = await getUserSupplier(userId);
      if (supplier) {
        tenantId = supplier.tenantId;
      }
    }

    if (event.tenantId !== tenantId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Verify event exists and user has access
    const existingEvent = await writeClient.fetch(EVENT_BY_ID_QUERY, {
      eventId: id,
    });
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let tenantId = null;
    const company = await getUserCompany(userId);
    if (company) {
      tenantId = company.tenantId;
    } else {
      const supplier = await getUserSupplier(userId);
      if (supplier) {
        tenantId = supplier.tenantId;
      }
    }

    if (existingEvent.tenantId !== tenantId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update event
    const updateData = {
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      location: body.location,
      status: body.status,
      priority: body.priority,
      clientContact: body.clientContact,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await writeClient.patch(id).set(updateData).commit();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify event exists and user has access
    const existingEvent = await writeClient.fetch(EVENT_BY_ID_QUERY, {
      eventId: id,
    });
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let tenantId = null;
    const company = await getUserCompany(userId);
    if (company) {
      tenantId = company.tenantId;
    } else {
      const supplier = await getUserSupplier(userId);
      if (supplier) {
        tenantId = supplier.tenantId;
      }
    }

    if (existingEvent.tenantId !== tenantId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
