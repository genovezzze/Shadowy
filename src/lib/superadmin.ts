export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.SUPERADMIN_EMAIL ?? "";
  return raw.split(",").map((e) => e.trim().toLowerCase()).includes(email.toLowerCase());
}

/**
 * Super-admin rights are granted by e-mail address, so whoever ends up owning
 * that address owns the role. If the configured address has no account yet,
 * anyone could simply register it — or an administrator could create a member
 * with it. Account creation therefore refuses these addresses outright; the
 * real super-admin account has to be provisioned directly in the database.
 */
export function isReservedSuperAdminEmail(email: string): boolean {
  return isSuperAdmin(email);
}

export const RESERVED_EMAIL_MESSAGE = "Šo e-pasta adresi nav iespējams izmantot.";
