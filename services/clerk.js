import { clerkClient } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";

// Prefer a backend admin client for server-to-server calls to avoid any env-specific proxies
const adminClerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

export async function safeUpdateClerkRole(userId, role) {
  try {
    if (!userId || typeof userId !== "string" || !userId.startsWith("user_")) {
      return { ok: false, skipped: true, reason: "invalid user id" };
    }

    const client =
      adminClerkClient || (clerkClient?.users ? clerkClient : null);
    if (!client) return { ok: false, skipped: true, reason: "no clerk client" };

    // Verify user exists first
    try {
      await client.users.getUser(userId);
    } catch (e) {
      return { ok: false, skipped: true, reason: "user not found" };
    }

    // Timeout guard so webhook never stalls
    const update = client.users.updateUser(userId, {
      publicMetadata: { role },
    });
    const result = await Promise.race([
      update,
      new Promise((resolve) => setTimeout(() => resolve("timeout"), 4000)),
    ]);
    if (result === "timeout")
      return { ok: false, skipped: true, reason: "timeout" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
