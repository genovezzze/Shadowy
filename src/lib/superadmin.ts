export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.SUPERADMIN_EMAIL ?? "";
  return raw.split(",").map((e) => e.trim().toLowerCase()).includes(email.toLowerCase());
}
