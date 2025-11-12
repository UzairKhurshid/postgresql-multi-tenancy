// tenantService.js

export async function getTenantByKey(tenantKey) {
  // Example in-memory tenant list
  const tenants = {
    'basic': {
      id: 'tenant-basic-001',
      is_premium: false,
      schema_name: 'public',
    },
    'premium1': {
      id: 'tenant-premium-001',
      is_premium: true,
      schema_name: 'premium1_schema',
    },
  };

  return tenants[tenantKey] || null;
}
