import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
// Avoid calling Sanity from middleware (Edge). Use Clerk session claims instead.

const isProtectedRoute = createRouteMatcher([
  "/bookmarks(.*)",
  "/become(.*)",
  "/api/bookmarks(.*)",
  "/api/tenant-requests(.*)",
  "/api/messaging(.*)",
  "/api/event-requests(.*)",
  "/api/subscriptions(.*)",
  "/api/offers(.*)",
  "/api/blogs(.*)",
  "/api/company/update(.*)",
  "/api/supplier/update(.*)",
  "/messages(.*)",
]);

const isBusinessRoute = createRouteMatcher(["/business(.*)"]);
const isBecomeRoute = createRouteMatcher(["/become(.*)"]);
const isMessagesRoute = createRouteMatcher(["/messages(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Allow public offers endpoints without authentication
  if (req.nextUrl.pathname.startsWith("/api/offers/public")) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      const isAPI = req.nextUrl.pathname.startsWith("/api");
      if (isAPI) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Check if route requires business role (company or supplier)
  if (isBusinessRoute(req)) {
    if (!userId) {
      // Not authenticated - redirect to sign in
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Read role from Clerk session claims to avoid Edge -> Sanity calls
    let userRole = sessionClaims?.role;

    // Fallback: fetch from Clerk if not present in JWT claims
    if (!userRole && userId) {
      try {
        const user = await clerkClient.users.getUser(userId);
        userRole = user?.publicMetadata?.role ?? null;
      } catch (_) {
        // ignore and proceed to redirect
      }
    }
    if (!userRole || (userRole !== "company" && userRole !== "supplier")) {
      return NextResponse.redirect(new URL("/become", req.url));
    }
  }

  // Prevent existing business users from accessing the become flow
  if (isBecomeRoute(req)) {
    if (!userId) {
      return; // unauthenticated users can access become flow
    }
    let userRole = sessionClaims?.role;
    if (!userRole && userId) {
      try {
        const user = await clerkClient.users.getUser(userId);
        userRole = user?.publicMetadata?.role ?? null;
      } catch (_) {
        // allow access to become flow on error
      }
    }
    if (userRole === "company" || userRole === "supplier") {
      return NextResponse.redirect(
        new URL(`/business/${userRole}/dashboard`, req.url)
      );
    }
  }

  // Prevent business users (company/supplier) from accessing public messages
  if (isMessagesRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    let userRole = sessionClaims?.role;
    if (!userRole && userId) {
      try {
        const user = await clerkClient.users.getUser(userId);
        userRole = user?.publicMetadata?.role ?? null;
      } catch (_) {
        // allow access on error
      }
    }

    if (userRole === "company" || userRole === "supplier") {
      return notFound();
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
