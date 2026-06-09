// Centralized Latvian translations for enums + status labels.
// All user-facing UI strings live in the components themselves (in Latvian).
// This file is only for things that map from DB enums to Latvian.

import type { EntryStatus, Role } from "@prisma/client";

export const roleLabel: Record<Role, string> = {
  ADMIN: "Administrators",
  MANAGER: "Vadītājs",
  EMPLOYEE: "Darbinieks",
};

export const statusLabel: Record<EntryStatus, string> = {
  PENDING: "Gaida izskatīšanu",
  APPROVED: "Apstiprināts",
  REJECTED: "Noraidīts",
  RETURNED: "Nosūtīts atpakaļ",
};

export const statusTone: Record<
  EntryStatus,
  "warning" | "success" | "destructive" | "muted"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  RETURNED: "muted",
};
