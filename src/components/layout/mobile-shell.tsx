"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, PlusCircle } from "lucide-react";
import { Sidebar, pageTitleFor } from "./sidebar";
import { TOP_BAR_SLOT_ID } from "./top-bar-slot";
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
  // Desktop rail: starts collapsed, remembers the viewer's last choice.
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem("shadowy_sidebar_collapsed") === "0") setCollapsed(false);
    } catch {}
  }, []);

  // Hovering the collapsed rail peeks the full panel over the page; a short
  // open delay keeps it from flashing when the pointer just passes by.
  const [peeking, setPeeking] = useState(false);
  const peekTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (peekTimer.current !== null) window.clearTimeout(peekTimer.current);
  }, []);

  function startPeek() {
    if (!collapsed || !window.matchMedia("(min-width: 768px) and (hover: hover)").matches) return;
    if (peekTimer.current !== null) window.clearTimeout(peekTimer.current);
    peekTimer.current = window.setTimeout(() => setPeeking(true), 120);
  }

  function endPeek() {
    if (peekTimer.current !== null) window.clearTimeout(peekTimer.current);
    peekTimer.current = null;
    setPeeking(false);
  }

  function toggleCollapsed() {
    setPeeking(false);
    setCollapsed((v) => {
      try {
        localStorage.setItem("shadowy_sidebar_collapsed", v ? "0" : "1");
      } catch {}
      return !v;
    });
  }

  return (
    <div className="app-shell flex h-screen bg-background font-app">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed drawer on mobile, static column on desktop */}
      <div
        data-print="hide"
        className={[
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Collapsed: the column keeps the rail's width, the panel floats above it.
          collapsed ? "md:w-[68px] md:shrink-0" : "",
        ].join(" ")}
      >
        <div
          onMouseEnter={startPeek}
          onMouseLeave={endPeek}
          className={[
            "h-full",
            collapsed ? "md:absolute md:inset-y-0 md:left-0 md:z-50" : "",
            peeking ? "md:shadow-[12px_0_40px_rgba(0,0,0,0.28)]" : "",
          ].join(" ")}
        >
        <Sidebar
          role={role}
          userName={userName}
          organizationName={organizationName}
          pendingCount={pendingCount}
          unreadNotificationCount={unreadNotificationCount}
          onClose={() => setSidebarOpen(false)}
          // The mobile drawer always opens with labels.
          collapsed={collapsed && !sidebarOpen}
          peeking={peeking}
          onToggleCollapsed={toggleCollapsed}
        />
        </div>
      </div>

      {/* Main content */}
      <div data-app-main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div data-print="hide" className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Atvērt izvēlni"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Image src="/shadowy.svg" alt="Shadowy" width={22} height={22} className="shrink-0 invert dark:invert-0" />
          <span className="flex-1 text-sm font-semibold">Shadowy</span>
          <NotificationBell initialUnreadCount={unreadNotificationCount ?? 0} />
        </div>

        {trialDaysLeft != null && role !== "EMPLOYEE" && (
          <div data-print="hide">
            <TrialBanner daysLeft={trialDaysLeft} />
          </div>
        )}

        {/* Desktop top bar: where you are on the left, the main action on the right. */}
        <TopBar role={role} organizationName={organizationName} />

        <main className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          <div className="w-full px-4 py-4 sm:px-8 sm:pb-8 sm:pt-6 xl:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

function TopBar({ role, organizationName }: { role: Role; organizationName: string }) {
  const pathname = usePathname();
  const title = pageTitleFor(pathname);

  return (
    <div
      data-print="hide"
      className="hidden h-14 shrink-0 items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-8 md:flex xl:px-10 dark:border-white/[0.07]"
    >
      <nav aria-label="Atrašanās vieta" className="flex min-w-0 items-center gap-2 text-[14px]">
        <span className="truncate font-display text-[15px] font-medium">{organizationName}</span>
        {title && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate rounded-full bg-black/[0.05] px-3 py-1 font-medium dark:bg-white/[0.08]">{title}</span>
          </>
        )}
      </nav>
      <div className="flex shrink-0 items-center gap-2">
      {/* Pages portal their own controls in here (see TopBarSlot). */}
      <div id={TOP_BAR_SLOT_ID} className="flex items-center gap-2" />
      {role === "EMPLOYEE" && (
        <Link
          href="/employee/new-entry"
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#007AFF] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#0062CC] dark:bg-[#0A84FF] dark:hover:bg-[#0A74E0]"
        >
          <PlusCircle className="h-4 w-4" />
          Jauns ieraksts
        </Link>
      )}
      </div>
    </div>
  );
}
