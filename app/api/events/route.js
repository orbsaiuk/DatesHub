import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import {
  EVENTS_BY_TENANT_QUERY,
  EVENTS_BY_DATE_RANGE_QUERY,
  EVENT_STATS_QUERY,
} from "@/sanity/queries/event";
import { getUserCompany, getUserSupplier } from "@/services/sanity/entities";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const stats = searchParams.get("stats") === "true";

    // Get user's tenant ID
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

    if (!tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Return stats if requested
    if (stats) {
      const now = new Date();
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();

      const eventStats = await writeClient.fetch(EVENT_STATS_QUERY, {
        tenantId,
        monthStart,
        monthEnd,
      });

      return NextResponse.json(eventStats);
    }

    // Get events by date range or all events
    let events;
    if (startDate && endDate) {
      events = await writeClient.fetch(EVENTS_BY_DATE_RANGE_QUERY, {
        tenantId,
        startDate,
        endDate,
      });
    } else {
      events = await writeClient.fetch(EVENTS_BY_TENANT_QUERY, {
        tenantId,
      });
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
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

    // Get user's tenant ID
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

    if (!tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Validate required fields
    const { title, startDate, endDate } = body;
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, start date, and end date are required" },
        { status: 400 }
      );
    }

    // Create event document
    const eventData = {
      _type: "event",
      title,
      description: body.description || "",
      startDate,
      endDate,
      location: body.location || "",
      status: body.status || "planned",
      priority: body.priority || "medium",
      clientContact: body.clientContact || null,
      tenantId,
      createdBy: userId,
    };

    const result = await writeClient.create(eventData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
