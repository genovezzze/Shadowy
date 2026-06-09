import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { isTrialExpired, getTrialDaysLeft } from "@/lib/trial";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser(["EMPLOYEE"]);
  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
  });

  if (isTrialExpired(org?.trialEndsAt)) redirect("/trial-expired");

  return (
    <AppShell
      role="EMPLOYEE"
      userName={session.name}
      organizationName={org?.name ?? "Organizācija"}
      trialDaysLeft={getTrialDaysLeft(org?.trialEndsAt)}
    >
      {children}
    </AppShell>
  );
}
