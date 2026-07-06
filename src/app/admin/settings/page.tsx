import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmailSettingsForm } from "./email-settings-form";

export default async function AdminSettingsPage() {
  const session = await requireUser(["ADMIN"]);

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: {
      emailOnNewEntry: true,
      emailOnEntryApproved: true,
      emailWeeklySummary: true,
    },
  });

  return (
    <>
      <PageHeader
        title="Iestatījumi"
        description="Konfigurējiet organizācijas paziņojumu preferences."
      />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold mb-1">E-pasta paziņojumi</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Izvēlieties, kuri e-pasta paziņojumi tiek sūtīti jūsu organizācijā.
          </p>
          <EmailSettingsForm
            emailOnNewEntry={org?.emailOnNewEntry ?? true}
            emailOnEntryApproved={org?.emailOnEntryApproved ?? false}
            emailWeeklySummary={org?.emailWeeklySummary ?? true}
          />
        </CardContent>
      </Card>
    </>
  );
}
