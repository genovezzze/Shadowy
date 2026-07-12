import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { isTrialExpired, getTrialDaysLeft } from "@/lib/trial";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { getUnreadAnnouncementForUser } from "@/lib/announcements";
import { AnnouncementModal } from "@/components/employee/announcement-modal";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser(["EMPLOYEE"]);
  const [org, unreadNotificationCount, unreadAnnouncement] = await Promise.all([
    prisma.organization.findUnique({ where: { id: session.organizationId } }),
    getUnreadNotificationCount(session.userId),
    getUnreadAnnouncementForUser(session.userId, session.organizationId),
  ]);

  if (isTrialExpired(org?.trialEndsAt)) redirect("/trial-expired");

  return (
    <AppShell
      role="EMPLOYEE"
      userName={session.name}
      organizationName={org?.name ?? "Organizācija"}
      trialDaysLeft={getTrialDaysLeft(org?.trialEndsAt)}
      unreadNotificationCount={unreadNotificationCount}
    >
      <AnnouncementModal announcement={unreadAnnouncement} />
      {children}
    </AppShell>
  );
}
