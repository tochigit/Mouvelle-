// Development-only admin access shim.
// Production handoff should replace this with Supabase Auth session checks and role claims.
export async function assertAdminAccess() {
  if (process.env.ADMIN_AUTH_ENFORCED === 'true') {
    throw new Error('Admin authentication is not connected yet');
  }

  return {
    id: 'development-admin',
    role: 'admin',
  };
}
