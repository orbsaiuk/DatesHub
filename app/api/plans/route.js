import { NextResponse } from "next/server";
import { getAllPlans, createPlan } from "@/services/sanity/subscriptions";

const defaultPlans = [
  {
    _type: "plan",
    name: "Free",
    slug: { _type: "slug", current: "free" },
    description: "Perfect for getting started with basic features",
    price: {
      amount: 0,
      currency: "usd",
      interval: "month",
    },
    features: [
      {
        name: "Basic Blog Posts",
        description: "Create and publish blog posts",
        included: true,
        limit: 5,
      },
      {
        name: "Basic Analytics",
        description: "View basic performance metrics",
        included: true,
      },
    ],
    limits: {
      blogPosts: 5,
      teamMembers: 1,
      storage: 100, // 100MB
      apiRequests: 1000,
      customDomain: false,
      prioritySupport: false,
      analytics: false,
    },
    isActive: true,
    isPopular: false,
    order: 1,
  },
  {
    _type: "plan",
    name: "Pro",
    slug: { _type: "slug", current: "pro" },
    description: "Ideal for growing businesses with advanced features",
    price: {
      amount: 29, // $29.00
      currency: "usd",
      interval: "month",
    },
    features: [
      {
        name: "Unlimited Blog Posts",
        description: "Create unlimited blog posts",
        included: true,
      },
    ],
    limits: {
      blogPosts: -1, // Unlimited
    },
    isActive: true,
    isPopular: true,
    order: 2,
  },
];

export async function POST(request) {
  try {
    // Check if plans already exist
    const existingPlans = await getAllPlans();

    if (existingPlans.length > 0) {
      return NextResponse.json({
        message: "Plans already exist",
        count: existingPlans.length,
      });
    }

    // Create the plans
    const createdPlans = [];
    for (const plan of defaultPlans) {
      const created = await createPlan(plan);
      createdPlans.push(created);
    }

    return NextResponse.json({
      message: "Default plans created successfully",
      plans: createdPlans,
    });
  } catch (error) {
    console.error("Error creating default plans:", error);
    return NextResponse.json(
      { error: "Failed to create default plans" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const plans = await getAllPlans();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
