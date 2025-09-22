export const PUBLIC_TENANT = { tenantType: "user", tenantId: "public" };

export function assertTenant(tenant) {
  if (!tenant || !tenant.tenantType || !tenant.tenantId) {
    throw new Error(
      "Tenant is required and must include tenantType and tenantId"
    );
  }
  return tenant;
}

export function withTenantParams(params = {}, tenant) {
  const t = assertTenant(tenant);
  return { ...params, tenantType: t.tenantType, tenantId: t.tenantId };
}
