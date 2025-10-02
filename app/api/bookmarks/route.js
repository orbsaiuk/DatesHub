export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { USER_BOOKMARK_IDS_QUERY } from "@/sanity/queries/user";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  try {
    const res = await writeClient.fetch(USER_BOOKMARK_IDS_QUERY, {
      uid: userId,
    });

    const bookmarks = Array.isArray(res?.bookmarks)
      ? res.bookmarks.map((b) => b?.id).filter(Boolean)
      : [];

    return Response.json({ bookmarks });
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
}
