import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { writeClient } from "@/sanity/lib/serverClient";
import { clerkClient } from "@clerk/nextjs/server";
import { USER_BY_ID_OR_CLERKID_QUERY } from "@/sanity/queries/user";

export async function POST(req) {
  // Read dynamic headers first and synchronously from awaited headers()
  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTimestamp = h.get("svix-timestamp");
  const svixSignature = h.get("svix-signature");
  // Read the payload after capturing headers
  const payload = await req.text();

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing Svix headers" },
      { status: 400 }
    );
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not set" },
      { status: 500 }
    );
  }

  let evt;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const type = evt?.type;
  const data = evt?.data || {};

  // Upsert user on create/update
  if (type === "user.created" || type === "user.updated") {
    const isCreatedEvent = type === "user.created";
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address || "";
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const username = data.username || "";

    // Use username if first/last name are not available (manual signup case)
    let name = `${firstName} ${lastName}`.trim();
    if (!name && username) {
      name = username;
    }

    const imageUrl = data.image_url || "";

    const publicRole = data.public_metadata?.role;
    const unsafeRole = data.unsafe_metadata?.role;
    const resolvedRole =
      typeof publicRole === "string" && publicRole.trim()
        ? publicRole
        : typeof unsafeRole === "string" && unsafeRole.trim()
          ? unsafeRole
          : "user"; // default role

    // On user creation, ensure Clerk public metadata has a role set.
    // If role only exists in unsafe_metadata or is missing, copy/set it to public_metadata.
    if (isCreatedEvent && publicRole !== resolvedRole) {
      try {
        await clerkClient.users.updateUser(clerkId, {
          publicMetadata: {
            ...(data.public_metadata || {}),
            role: resolvedRole,
          },
        });
      } catch (err) {
        // Failed to set Clerk publicMetadata.role
      }
    }

    const deterministicId = `user.${clerkId}`;

    // Find existing by _id or clerkId to avoid duplicates
    const existing = await writeClient.fetch(USER_BY_ID_OR_CLERKID_QUERY, {
      id: deterministicId,
      clerkId,
    });

    const targetId = existing?._id || deterministicId;

    if (!existing) {
      await writeClient.create({
        _id: targetId,
        _type: "user",
        clerkId,
        email,
        name,
        imageUrl,
        role: resolvedRole,
      });
    }

    await writeClient
      .patch(targetId)
      .set({ clerkId, email, name, imageUrl, role: resolvedRole })
      .commit({ autoGenerateArrayKeys: true });
  }

  // Optional: handle user.deleted (soft delete or cleanup)
  // if (type === "user.deleted") {
  //   const clerkId = data.id;
  //   const _id = `user.${clerkId}`;
  //   // Example: do nothing or implement cleanup if desired
  // }

  return NextResponse.json({ ok: true });
}
