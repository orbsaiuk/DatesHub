import { client as readClient } from "@/sanity/lib/client";
import {
  TENANT_REQUEST_EXISTS_QUERY,
  USER_PENDING_TENANT_REQUEST_QUERY,
} from "@/sanity/queries/tenantRequest";

export async function checkTenantRequestExists(id) {
  try {
    const result = await readClient.fetch(TENANT_REQUEST_EXISTS_QUERY, { id });
    return result;
  } catch (error) {
    console.error("Error checking tenant request existence:", error);
    return null;
  }
}

export async function getUserPendingTenantRequest(userId) {
  try {
    const result = await readClient.fetch(USER_PENDING_TENANT_REQUEST_QUERY, {
      userId,
    });
    return result;
  } catch (error) {
    console.error("Error checking user pending tenant request:", error);
    return null;
  }
}
