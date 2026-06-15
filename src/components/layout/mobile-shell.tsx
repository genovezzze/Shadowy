"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { TrialBanner } from "./trial-banner";
import { NotificationBell } from "./notification-bell";
import type { Role } from "@prisma/client";

interface MobileShellProps {
  role: Role;
  userName: string;
  organizationName: string;
  trialDaysLeft?: number | null;
  pendingCount?: number;
  unreadNotificationCount?: number;
  children: React.ReactNode;
}

export function MobileShell({
  role,
  userName,
  organizationName,
  trialDaysLeft,
  pendingCount,
  unreadNotificationCount,
  children,
}: MobileShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell flex h-screen bg-background">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static column on desktop */}
      <div
        className={[
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar
          role={role}
          userName={userName}
          organizationName={organizationName}
          pendingCount={pendingCount}
          unreadNotificationCount={unreadNotificationCount}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Atvērt izvēlni"
          >
            <Menu className="h-5 w-5" />
          </button>
          <img src="/shadowy.svg" alt="Shadowy" width={22} height={22} className="shrink-0 invert dark:invert-0" />
          <span className="flex-1 text-sm font-semibold">Shadowy</span>
          <NotificationBell initialUnreadCount={unreadNotificationCount ?? 0} />
        </div>

        {trialDaysLeft != null && <TrialBanner daysLeft={trialDaysLeft} />}

        <main className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-8 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
