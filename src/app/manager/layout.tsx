import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { isTrialExpired, getTrialDaysLeft } from "@/lib/trial";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser(["MANAGER"]);
  const [org, pendingCount] = await Promise.all([
    prisma.organization.findUnique({ where: { id: session.organizationId } }),
    prisma.invisibleWorkEntry.count({
      where: { organizationId: session.organizationId, managerId: session.userId, status: "PENDING" },
    }),
  ]);

  if (isTrialExpired(org?.trialEndsAt)) redirect("/trial-expired");

  return (
    <AppShell
      role="MANAGER"
      userName={session.name}
      organizationName={org?.name ?? "Organizācija"}
      trialDaysLeft={getTrialDaysLeft(org?.trialEndsAt)}
      pendingCount={pendingCount}
    >
      {children}
    </AppShell>
  );
}
