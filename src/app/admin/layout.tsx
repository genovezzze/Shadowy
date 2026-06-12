import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { isTrialExpired, getTrialDaysLeft } from "@/lib/trial";
import { isSuperAdmin } from "@/lib/superadmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser(["ADMIN"]);

  if (isSuperAdmin(session.email)) redirect("/superadmin");

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
  });

  if (isTrialExpired(org?.trialEndsAt)) redirect("/trial-expired");

  return (
    <AppShell
      role="ADMIN"
      userName={session.name}
      organizationName={org?.name ?? "Organizācija"}
      trialDaysLeft={getTrialDaysLeft(org?.trialEndsAt)}
    >
      {children}
    </AppShell>
  );
}
