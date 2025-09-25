import { client as readClient } from "@/sanity/lib/client";
import { TENANT_REQUEST_EXISTS_QUERY } from "@/sanity/queries/tenantRequest";

export async function checkTenantRequestExists(id) {
  try {
    const result = await readClient.fetch(TENANT_REQUEST_EXISTS_QUERY, { id });
    return result;
  } catch (error) {
    console.error("Error checking tenant request existence:", error);
    return null;
  }
}
