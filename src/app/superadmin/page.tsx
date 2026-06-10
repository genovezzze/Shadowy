import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getTrialDaysLeft, isTrialExpired } from "@/lib/trial";
import { OrgRow } from "./org-row";

const SUPERADMIN_EMAIL =
  process.env.SUPERADMIN_EMAIL ?? "artemijlucin@gmail.com";

export default async function SuperAdminPage() {
  const session = await getSession();
  if (!session || session.email !== SUPERADMIN_EMAIL) redirect("/login");

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { entries: true },
      },
      users: {
        select: { role: true },
      },
    },
  });

  const totalOrgs = orgs.length;
  const activeTrials = orgs.filter(
    (o) => o.trialEndsAt && !isTrialExpired(o.trialEndsAt)
  ).length;
  const expiredTrials = orgs.filter((o) => isTrialExpired(o.trialEndsAt)).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Shadowy" width={32} height={32} />
          <span className="font-semibold">Shadowy</span>
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
            Super Admin
          </span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/superadmin" className="text-foreground font-medium">
            Organizācijas
          </a>
          <a href="/superadmin/pilot-leads" className="text-muted-foreground hover:text-foreground transition-colors">
            Pilot pieteikumi
          </a>
          <a href="/api/auth/logout" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            Iziet
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Organizācijas kopā" value={totalOrgs} />
          <StatCard label="Aktīvie izmēģinājumi" value={activeTrials} tone="success" />
          <StatCard label="Izmēģinājums beidzies" value={expiredTrials} tone="danger" />
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Organizācija</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Reģistrēta</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Izmēģinājums</th>
                <th className="text-center font-medium text-muted-foreground px-5 py-3">Lietotāji</th>
                <th className="text-center font-medium text-muted-foreground px-5 py-3">Ieraksti</th>
                <th className="text-right font-medium text-muted-foreground px-5 py-3">Darbības</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orgs.map((org) => {
                const admins = org.users.filter((u) => u.role === "ADMIN").length;
                const managers = org.users.filter((u) => u.role === "MANAGER").length;
                const employees = org.users.filter((u) => u.role === "EMPLOYEE").length;
                const daysLeft = getTrialDaysLeft(org.trialEndsAt);
                const expired = isTrialExpired(org.trialEndsAt);

                return (
                  <OrgRow
                    key={org.id}
                    id={org.id}
                    name={org.name}
                    slug={org.slug}
                    createdAt={org.createdAt}
                    trialEndsAt={org.trialEndsAt}
                    daysLeft={daysLeft}
                    expired={expired}
                    admins={admins}
                    managers={managers}
                    employees={employees}
                    entryCount={org._count.entries}
                  />
                );
              })}
            </tbody>
          </table>

          {orgs.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Nav reģistrētu organizāciju.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "danger";
}) {
  const color =
    tone === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "danger"
      ? "text-red-600 dark:text-red-400"
      : "text-foreground";

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-3xl font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
