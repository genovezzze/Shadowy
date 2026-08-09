import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { SignOutEverywhere } from "@/components/account/sign-out-everywhere";
import { roleLabel } from "@/lib/i18n";
import type { Role } from "@prisma/client";
import { UserCircle, KeyRound, LogOut } from "lucide-react";

interface ProfileViewProps {
  name: string;
  email: string;
  role: Role;
  title?: string | null;
}

const glassInner = "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:block hidden";

export function ProfileView({ name, email, role, title }: ProfileViewProps) {
  return (
    <>
      <PageHeader
        title="Mans profils"
        description="Pārvaldiet sava konta informāciju un paroli."
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card className="relative min-w-0 overflow-hidden p-0">
          <div className={glassInner} />
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border dark:border-white/[0.07]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
              <UserCircle className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold">Konta informācija</div>
          </div>
          <div className="divide-y divide-white/[0.04]">
            <div className="flex items-center justify-between gap-4 px-6 py-3.5">
              <span className="shrink-0 text-sm text-muted-foreground">Vārds un uzvārds</span>
              <span className="truncate text-sm font-medium">{name}</span>
            </div>
            {title ? (
              <div className="flex items-center justify-between gap-4 px-6 py-3.5">
                <span className="shrink-0 text-sm text-muted-foreground">Amats</span>
                <span className="truncate text-sm font-medium">{title}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 px-6 py-3.5">
              <span className="shrink-0 text-sm text-muted-foreground">E-pasts</span>
              <span className="truncate text-sm font-medium">{email}</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-3.5">
              <span className="shrink-0 text-sm text-muted-foreground">Loma</span>
              <span className="truncate text-sm font-medium">{roleLabel[role]}</span>
            </div>
          </div>
        </Card>

        <Card className="relative min-w-0 overflow-hidden p-0">
          <div className={glassInner} />
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border dark:border-white/[0.07]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <KeyRound className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold">Mainīt paroli</div>
          </div>
          <div className="px-6 py-5">
            <ChangePasswordForm />
          </div>
        </Card>

        <Card className="relative min-w-0 overflow-hidden p-0 lg:col-span-2">
          <div className={glassInner} />
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border dark:border-white/[0.07]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
              <LogOut className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold">Aktīvās sesijas</div>
          </div>
          <div className="px-6 py-5">
            <SignOutEverywhere />
          </div>
        </Card>
      </div>
    </>
  );
}
