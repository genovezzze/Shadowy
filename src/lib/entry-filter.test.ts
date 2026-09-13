import { describe, it, expect } from "vitest";
import { buildEntryWhere, entryScopeForSession } from "./entry-filter";

// These tests guard the single most dangerous class of bug in a multi-tenant
// product: a crafted URL widening what a viewer may read, or an entry query
// escaping its organization. They run without a database — they assert the
// shape of the Prisma `where` clause, which is what actually enforces scope.

describe("entryScopeForSession", () => {
  const org = "org_1";

  it("pins an ADMIN to their organization only", () => {
    const scope = entryScopeForSession({ role: "ADMIN", organizationId: org, userId: "u_admin" });
    expect(scope).toEqual({ organizationId: org });
  });

  it("pins a MANAGER to entries they manage, within their org", () => {
    const scope = entryScopeForSession({ role: "MANAGER", organizationId: org, userId: "u_mgr" });
    expect(scope).toEqual({ organizationId: org, managerId: "u_mgr" });
  });

  it("pins an EMPLOYEE to their own entries, within their org", () => {
    const scope = entryScopeForSession({ role: "EMPLOYEE", organizationId: org, userId: "u_emp" });
    expect(scope).toEqual({ organizationId: org, employeeId: "u_emp" });
  });

  it("always carries organizationId for every role", () => {
    for (const role of ["ADMIN", "MANAGER", "EMPLOYEE"] as const) {
      const scope = entryScopeForSession({ role, organizationId: org, userId: "u" });
      expect(scope.organizationId).toBe(org);
    }
  });
});

describe("buildEntryWhere (attacker-controlled input)", () => {
  it("never sets organizationId itself — scoping is the caller's job", () => {
    const where = buildEntryWhere({ employee: "victim", client: "id:c1", status: "APPROVED" });
    expect("organizationId" in where).toBe(false);
  });

  it("always excludes soft-deleted rows", () => {
    expect(buildEntryWhere({}).deletedAt).toBeNull();
  });
});

describe("scope always wins over crafted filters", () => {
  const org = "org_1";

  it("an EMPLOYEE cannot read a colleague's entries by passing ?employee=", () => {
    const crafted = buildEntryWhere({ employee: "someone_else" });
    const where = { ...crafted, ...entryScopeForSession({ role: "EMPLOYEE", organizationId: org, userId: "me" }) };
    // Scope is spread last, so employeeId resolves to the session user, not the URL.
    expect(where.employeeId).toBe("me");
    expect(where.organizationId).toBe(org);
  });

  it("a MANAGER query is always constrained to entries they manage", () => {
    const crafted = buildEntryWhere({ employee: "not_my_report", status: "APPROVED" });
    const where = { ...crafted, ...entryScopeForSession({ role: "MANAGER", organizationId: org, userId: "mgr" }) };
    expect(where.managerId).toBe("mgr");
    expect(where.organizationId).toBe(org);
  });

  it("no role's scope can be dropped to leak across organizations", () => {
    const crafted = buildEntryWhere({ q: "'; --", client: "name:Acme" });
    const where = { ...crafted, ...entryScopeForSession({ role: "ADMIN", organizationId: org, userId: "a" }) };
    expect(where.organizationId).toBe(org);
  });
});
