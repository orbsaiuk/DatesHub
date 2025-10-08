import { auth, clerkClient } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";

// User roles enum
export const USER_ROLES = {
  USER: "user",
  COMPANY: "company",
  SUPPLIER: "supplier",
  ADMIN: "admin"
};

// Permission levels
export const PERMISSIONS = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  ADMIN: "admin"
};

export async function getAuthenticatedUser() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return null;
    }

    // Get role from session claims first (faster)
    let userRole = sessionClaims?.role;

    // Fallback to Clerk metadata if not in claims
    if (!userRole) {
      try {
        const user = await clerkClient.users.getUser(userId);
        userRole = user?.publicMetadata?.role || USER_ROLES.USER;
      } catch (error) {
        console.error("Error fetching user role:", error);
        userRole = USER_ROLES.USER;
      }
    }

    return {
      userId,
      role: userRole,
      sessionClaims
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}


export function hasRole(userRole, requiredRoles) {
  if (!userRole) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
}


export async function hasTenanMembership(userId, tenantType, tenantId) {
  try {
    const user = await writeClient.fetch(
      `*[_type == "user" && clerkId == $userId][0]{
        memberships[tenantType == $tenantType && tenantId == $tenantId]{ tenantId, role }
      }`,
      { userId, tenantType, tenantId }
    );

    return Boolean(user?.memberships?.length);
  } catch (error) {
    console.error("Error checking tenant membership:", error);
    return false;
  }
}


export async function hasResourceAccess(userId, resourceType, resourceId) {
  try {
    switch (resourceType) {
      case "company":
      case "supplier":
        return await hasTenanMembership(userId, resourceType, resourceId);

      case "offer":
        // Check if user has access to the tenant that owns the offer
        const offer = await writeClient.fetch(
          `*[_type == "offers" && _id == $resourceId][0]{ tenantType, tenantId }`,
          { resourceId }
        );

        if (!offer) return false;
        return await hasTenanMembership(userId, offer.tenantType, offer.tenantId);

      case "blog":
        // Check if user has access to the company/supplier that owns the blog
        const blog = await writeClient.fetch(
          `*[_type == "blog" && _id == $resourceId][0]{ 
            "authorType": select(
              defined(company) => "company",
              defined(supplier) => "supplier",
              "none"
            ),
            "authorId": select(
              defined(company) => company->tenantId,
              defined(supplier) => supplier->tenantId,
              null
            )
          }`,
          { resourceId }
        );

        if (!blog || !blog.authorId) return false;
        return await hasTenanMembership(userId, blog.authorType, blog.authorId);

      case "event-request":
        // Check if user created the event request or is the target company
        const eventRequest = await writeClient.fetch(
          `*[_type == "eventRequest" && _id == $resourceId][0]{ 
            createdBy, 
            company->tenantId 
          }`,
          { resourceId }
        );

        if (!eventRequest) return false;

        // User created the request
        if (eventRequest.createdBy === userId) return true;

        // User is member of target company
        if (eventRequest.company?.tenantId) {
          return await hasTenanMembership(userId, "company", eventRequest.company.tenantId);
        }

        return false;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking resource access for ${resourceType}:`, error);
    return false;
  }
}

export function withAuthorization(options = {}, handler) {
  return async (req, context) => {
    try {
      // Get authenticated user
      const user = await getAuthenticatedUser();

      if (!user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check role requirements
      if (options.roles && !hasRole(user.role, options.roles)) {
        return new Response(
          JSON.stringify({ error: "Insufficient permissions" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check resource ownership
      if (options.resourceType && options.resourceParam) {
        const params = await context.params;
        const resourceId = params[options.resourceParam];

        if (resourceId) {
          const hasAccess = await hasResourceAccess(user.userId, options.resourceType, resourceId);

          if (!hasAccess) {
            return new Response(
              JSON.stringify({ error: "Access denied" }),
              { status: 403, headers: { "Content-Type": "application/json" } }
            );
          }
        }
      }

      // Add user context to request
      req.user = user;

      // Call original handler
      return await handler(req, context);

    } catch (error) {
      console.error("Authorization error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}

export function requireAuth(handler) {
  return withAuthorization({}, handler);
}


export function requireRoles(roles, handler) {
  return withAuthorization({ roles }, handler);
}

export function requireResourceAccess(resourceType, resourceParam, handler) {
  return withAuthorization({ resourceType, resourceParam }, handler);
}

export async function canAccessConversation(userId, conversationId) {
  try {
    // Fetch conversation with participant details
    const conv = await writeClient.fetch(
      `*[_type == "conversation" && _id == $conversationId][0]{
        _id,
        "participant1Data": participant1->{_id, _type, clerkId, tenantId},
        "participant2Data": participant2->{_id, _type, clerkId, tenantId}
      }`,
      { conversationId }
    );

    if (!conv) return false;

    // Check if user is direct participant (user type)
    if (
      (conv.participant1Data?._type === "user" &&
        conv.participant1Data?.clerkId === userId) ||
      (conv.participant2Data?._type === "user" &&
        conv.participant2Data?.clerkId === userId)
    ) {
      return true;
    }

    // Check if user is member of business participant
    const userProfile = await writeClient.fetch(
      `*[_type=="user" && clerkId==$userId][0]{memberships}`,
      { userId }
    );

    const memberships = userProfile?.memberships || [];

    // Check if user is member of participant1 business
    if (
      conv.participant1Data?._type !== "user" &&
      memberships.some(
        (m) =>
          m.tenantType === conv.participant1Data._type &&
          m.tenantId === conv.participant1Data.tenantId
      )
    ) {
      return true;
    }

    // Check if user is member of participant2 business
    if (
      conv.participant2Data?._type !== "user" &&
      memberships.some(
        (m) =>
          m.tenantType === conv.participant2Data._type &&
          m.tenantId === conv.participant2Data.tenantId
      )
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking conversation access:", error);
    return false;
  }
}


export function createRateLimit(key, limit = 100, windowMs = 60000) {
  // This would integrate with your existing rate limiting system
  // For now, returning a simple implementation
  return {
    allowed: true,
    remaining: limit,
    resetTime: Date.now() + windowMs
  };
}
