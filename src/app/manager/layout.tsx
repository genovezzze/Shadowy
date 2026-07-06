import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { isTrialExpired, getTrialDaysLeft } from "@/lib/trial";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const [org, pendingCount, unreadNotificationCount] = await Promise.all([
    prisma.organization.findUnique({ where: { id: session.organizationId } }),
    prisma.invisibleWorkEntry.count({
      where: { organizationId: session.organizationId, managerId: session.userId, status: "RETURNED" },
    }),
    getUnreadNotificationCount(session.userId),
  ]);

  if (isTrialExpired(org?.trialEndsAt)) redirect("/trial-expired");

  return (
    <AppShell
      role={session.role}
      userName={session.name}
      organizationName={org?.name ?? "Organizācija"}
      trialDaysLeft={getTrialDaysLeft(org?.trialEndsAt)}
      pendingCount={pendingCount}
      unreadNotificationCount={unreadNotificationCount}
    >
      {children}
    </AppShell>
  );
}
