export function isSuperAdmin(email: string | null | undefined): boolean {
  const superAdminEmail = process.env.SUPERADMIN_EMAIL;
  return Boolean(superAdminEmail) && email === superAdminEmail;
}
