import { auth, clerkClient } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";

/**
 * Authorization utilities for API route protection
 * Addresses OWASP #1: Broken Access Control
 */

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

/**
 * Get authenticated user with role information
 * @returns {Promise<{userId: string, role: string, sessionClaims: object} | null>}
 */
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

/**
 * Check if user has required role
 * @param {string} userRole - Current user role
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean}
 */
export function hasRole(userRole, requiredRoles) {
  if (!userRole) return false;
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
}

/**
 * Check if user has membership in a tenant (company/supplier)
 * @param {string} userId - User ID
 * @param {string} tenantType - "company" or "supplier"
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>}
 */
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

/**
 * Check if user owns or has access to a resource
 * @param {string} userId - User ID
 * @param {string} resourceType - Type of resource (e.g., "company", "supplier", "offer")
 * @param {string} resourceId - Resource ID or tenantId
 * @returns {Promise<boolean>}
 */
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

/**
 * Authorization middleware wrapper for API routes
 * @param {Object} options - Authorization options
 * @param {string|string[]} options.roles - Required roles
 * @param {string} options.resourceType - Resource type for ownership check
 * @param {string} options.resourceParam - Parameter name containing resource ID
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with authorization
 */
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

/**
 * Simple authentication check for API routes
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with authentication
 */
export function requireAuth(handler) {
  return withAuthorization({}, handler);
}

/**
 * Require specific roles for API routes
 * @param {string|string[]} roles - Required roles
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with role check
 */
export function requireRoles(roles, handler) {
  return withAuthorization({ roles }, handler);
}

/**
 * Require resource ownership for API routes
 * @param {string} resourceType - Resource type
 * @param {string} resourceParam - Parameter name containing resource ID
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with ownership check
 */
export function requireResourceAccess(resourceType, resourceParam, handler) {
  return withAuthorization({ resourceType, resourceParam }, handler);
}

/**
 * Check if user can perform action on conversation (for messaging)
 * @param {string} userId - User ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>}
 */
export async function canAccessConversation(userId, conversationId) {
  try {
    const conv = await writeClient.getDocument(conversationId);
    if (!conv) return false;
    
    const participants = conv?.participants || [];
    
    // Check if user is direct participant
    const isDirectParticipant = participants.some(
      (p) => p.kind === "user" && p.clerkId === userId
    );
    
    if (isDirectParticipant) return true;
    
    // Check if user is member of business participant
    const userProfile = await writeClient.fetch(
      `*[_type=="user" && clerkId==$userId][0]{memberships}`,
      { userId }
    );
    
    const memberships = userProfile?.memberships || [];
    
    return participants.some(
      (p) =>
        p.kind !== "user" &&
        memberships.some(
          (m) => m.tenantType === p.kind && m.tenantId === p.tenantId
        )
    );
  } catch (error) {
    console.error("Error checking conversation access:", error);
    return false;
  }
}

/**
 * Rate limiting helper
 * @param {string} key - Rate limit key
 * @param {number} limit - Request limit
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} Rate limit result
 */
export function createRateLimit(key, limit = 100, windowMs = 60000) {
  // This would integrate with your existing rate limiting system
  // For now, returning a simple implementation
  return {
    allowed: true,
    remaining: limit,
    resetTime: Date.now() + windowMs
  };
}
