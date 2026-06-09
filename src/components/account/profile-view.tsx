import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { roleLabel } from "@/lib/i18n";
import type { Role } from "@prisma/client";

interface ProfileViewProps {
  name: string;
  email: string;
  role: Role;
  title?: string | null;
}

export function ProfileView({ name, email, role, title }: ProfileViewProps) {
  return (
    <>
      <PageHeader
        title="Mans profils"
        description="Pārvaldiet sava konta informāciju un paroli."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Konta informācija</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Vārds un uzvārds</div>
              <div className="font-medium">{name}</div>
            </div>
            {title ? (
              <div>
                <div className="text-xs text-muted-foreground">Amats</div>
                <div className="font-medium">{title}</div>
              </div>
            ) : null}
            <div>
              <div className="text-xs text-muted-foreground">E-pasts</div>
              <div className="font-medium">{email}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Loma</div>
              <div className="font-medium">{roleLabel[role]}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mainīt paroli</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
