import type { Prisma, EntryStatus } from "@prisma/client";
import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";

const STATUSES = new Set<EntryStatus>([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "RETURNED",
]);

export interface EntrySearchParams {
  q?: string;
  status?: string;
  category?: string;
  employee?: string;
  client?: string;
  from?: string;
  to?: string;
}

/**
 * Build the filter portion of a Prisma where clause from URL search params.
 * Tenant/role scoping (organizationId, managerId, employeeId) is added by the caller.
 */
export function buildEntryWhere(
  sp: EntrySearchParams
): Prisma.InvisibleWorkEntryWhereInput {
  const where: Prisma.InvisibleWorkEntryWhereInput = { deletedAt: null };

  const q = sp.q?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { clientName: { contains: q, mode: "insensitive" } },
    ];
  }

  if (sp.status && STATUSES.has(sp.status as EntryStatus)) {
    where.status = sp.status as EntryStatus;
  }

  const categoryFilter = sp.category?.trim();
  if (categoryFilter) {
    // Older entries can store the category as its Latvian label instead of the
    // canonical key (or vice versa) — match either form so the filter doesn't
    // silently miss half the matching rows.
    const key = normalizeCategoryKey(categoryFilter);
    const label = categoryLabel(key);
    const variants = Array.from(new Set([categoryFilter, key, label]));
    where.category = variants.length > 1 ? { in: variants } : variants[0];
  }

  if (sp.employee?.trim()) {
    where.employeeId = sp.employee;
  }

  const client = sp.client?.trim();
  if (client?.startsWith("id:")) {
    where.clientId = client.slice(3);
  } else if (client?.startsWith("name:")) {
    where.clientName = { equals: client.slice(5), mode: "insensitive" };
  }

  const dateFilter: Prisma.DateTimeFilter = {};
  if (sp.from) {
    const d = new Date(sp.from);
    const y = d.getFullYear();
    if (!Number.isNaN(d.getTime()) && y >= 2000 && y <= 2100) dateFilter.gte = d;
  }
  if (sp.to) {
    const d = new Date(sp.to);
    const y = d.getFullYear();
    if (!Number.isNaN(d.getTime()) && y >= 2000 && y <= 2100) {
      d.setHours(23, 59, 59, 999);
      dateFilter.lte = d;
    }
  }
  if (dateFilter.gte || dateFilter.lte) {
    where.workDate = dateFilter;
  }

  return where;
}

export function hasActiveFilters(sp: EntrySearchParams): boolean {
  return Boolean(
    sp.q || sp.status || sp.category || sp.employee || sp.client || sp.from || sp.to
  );
}

/** Build the CSV export URL, preserving active filters but dropping pagination. */
export function buildExportHref(
  sp: EntrySearchParams & { page?: string }
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key !== "page" && typeof value === "string" && value) {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `/api/export/entries?${qs}` : "/api/export/entries";
}

export const PAGE_SIZE = 20;

/** Parse a 1-based page number from a URL param, clamped to >= 1. */
export function parsePage(value?: string): number {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}
