import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { isTrialExpired, getTrialDaysLeft } from "@/lib/trial";

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? "artemijlucin@gmail.com";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser(["ADMIN"]);

  if (session.email === SUPERADMIN_EMAIL) redirect("/superadmin");

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
