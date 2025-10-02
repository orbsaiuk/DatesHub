export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { randomUUID } from "crypto";
import {
  USER_ID_BY_CLERK_ID_QUERY,
  USER_HAS_BOOKMARK_QUERY,
} from "@/sanity/queries/user";
import { COMPANY_BY_TENANTID_OR_SLUG_QUERY } from "@/sanity/queries/company";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch (_) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const targetId = body?.id || body?.companyId || body?.targetId;
  if (!targetId || typeof targetId !== "string") {
    return new Response("Missing id", { status: 400 });
  }

  try {
    const userDoc = await writeClient.fetch(USER_ID_BY_CLERK_ID_QUERY, {
      uid: userId,
    });
    if (!userDoc?._id) return new Response("User not found", { status: 404 });

    const company = await writeClient.fetch(COMPANY_BY_TENANTID_OR_SLUG_QUERY, {
      id: targetId,
    });
    if (!company?._id)
      return new Response("Company not found", { status: 404 });

    // Get the full user document with bookmarks
    const fullUser = await writeClient.fetch(
      `*[_type == "user" && _id == $uid][0]`,
      { uid: userDoc._id }
    );

    // Check if bookmark exists
    const bookmarkExists = fullUser?.bookmarks?.some(
      (b) => b._ref === company._id
    );

    if (bookmarkExists) {
      // REMOVE: Get all bookmarks except the ones referencing this company
      const filteredBookmarks = (fullUser.bookmarks || []).filter(
        (bookmark) => bookmark._ref !== company._id
      );

      // Replace the entire bookmarks array
      await writeClient
        .patch(userDoc._id)
        .set({ bookmarks: filteredBookmarks })
        .commit();

      return Response.json({ bookmarked: false });
    } else {
      // ADD: Add new bookmark
      await writeClient
        .patch(userDoc._id)
        .setIfMissing({ bookmarks: [] })
        .append("bookmarks", [
          {
            _type: "reference",
            _ref: company._id,
            _weak: true,
            _key: randomUUID(),
          },
        ])
        .commit();

      return Response.json({ bookmarked: true });
    }
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
}
