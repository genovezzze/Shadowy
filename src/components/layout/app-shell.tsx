import { MobileShell } from "./mobile-shell";
import type { Role } from "@prisma/client";
import type { ReactNode } from "react";

interface AppShellProps {
  role: Role;
  userName: string;
  organizationName: string;
  trialDaysLeft?: number | null;
  pendingCount?: number;
  unreadNotificationCount?: number;
  children: ReactNode;
}

export function AppShell(props: AppShellProps) {
  return <MobileShell {...props} />;
}
