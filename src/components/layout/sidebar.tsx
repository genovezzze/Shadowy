"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  PlusCircle,
  History,
  LogOut,
  Briefcase,
  BadgeCheck,
  Gift,
  Inbox,
  UserCircle,
  BarChart2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "./notification-bell";

type NavItem = { href: string; label: string; icon: any };

function ShadowyNavIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block bg-current", className)}
      style={{
        WebkitMaskImage: "url('/shadowy.svg')",
        maskImage: "url('/shadowy.svg')",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Pārskats", icon: LayoutDashboard },
  { href: "/admin/managers", label: "Vadītāji", icon: UserCog },
  { href: "/admin/employees", label: "Darbinieki", icon: Users },
  { href: "/admin/entries", label: "Visi ieraksti", icon: FileText },
  { href: "/admin/bonuses", label: "Bonusu pārskats", icon: Gift },
  { href: "/admin/report", label: "Pilota atskaite", icon: BarChart2 },
  { href: "/admin/profile", label: "Mans profils", icon: UserCircle },
];

const MANAGER_NAV: NavItem[] = [
  { href: "/manager/dashboard", label: "Pārskats", icon: LayoutDashboard },
  { href: "/manager/employees", label: "Mana komanda", icon: Users },
  { href: "/manager/entries", label: "Komandas ieraksti", icon: FileText },
  { href: "/manager/roles", label: "Lomas", icon: Briefcase },
  { href: "/manager/bonus-rules", label: "Atzinības noteikumi", icon: Gift },
  { href: "/manager/bonus-requests", label: "Bonusu pieprasījumi", icon: Inbox },
  { href: "/manager/report", label: "Pilota atskaite", icon: BarChart2 },
  { href: "/manager/profile", label: "Mans profils", icon: UserCircle },
];

const EMPLOYEE_NAV: NavItem[] = [
  { href: "/employee/dashboard", label: "Pārskats", icon: LayoutDashboard },
  {
    href: "/employee/smart-log",
    label: "Shadowy AI ieraksts",
    icon: ShadowyNavIcon,
  },
  { href: "/employee/new-entry", label: "Jauns ieraksts", icon: PlusCircle },
  { href: "/employee/history", label: "Vēsture", icon: History },
  { href: "/employee/my-role", label: "Mana loma", icon: BadgeCheck },
  { href: "/employee/bonuses", label: "Atzinība", icon: Gift },
  { href: "/employee/profile", label: "Mans profils", icon: UserCircle },
];

function navFor(role: Role): NavItem[] {
  if (role === "ADMIN") return ADMIN_NAV;
  if (role === "MANAGER") return MANAGER_NAV;
  return EMPLOYEE_NAV;
}

function profileHref(role: Role): string {
  if (role === "ADMIN") return "/admin/profile";
  if (role === "MANAGER") return "/manager/profile";
  return "/employee/profile";
}

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrators",
  MANAGER: "Vadītājs",
  EMPLOYEE: "Darbinieks",
};

interface SidebarProps {
  role: Role;
  userName: string;
  organizationName: string;
  pendingCount?: number;
  unreadNotificationCount?: number;
  onClose?: () => void;
}

export function Sidebar({ role, userName, organizationName, pendingCount, unreadNotificationCount, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = navFor(role);

  return (
    <aside className="relative flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar font-accent backdrop-blur-md shadow-[1px_0_24px_rgba(15,23,42,0.05)] dark:border-white/[0.07] dark:bg-white/[0.02] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.04),1px_0_40px_rgba(0,0,0,0.35)]"
    >
      {/* Dot-grid texture (dark mode only) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center justify-between border-b border-sidebar-border px-5 py-5 dark:border-white/[0.07]">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-75"
        >
          <img src="/shadowy.svg" alt="Shadowy" width={30} height={30} className="shrink-0 invert dark:invert-0" />
          <div className="text-lg font-semibold leading-none tracking-tight">Shadowy</div>
        </Link>
        <NotificationBell initialUnreadCount={unreadNotificationCount ?? 0} alignLeft />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 space-y-0.5 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const showBadge = item.href === "/manager/entries" && (pendingCount ?? 0) > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-[17px] font-medium transition-colors duration-150",
                active
                  ? "bg-sidebar-accent text-foreground dark:bg-white/[0.09]"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground dark:hover:bg-white/[0.05]"
              )}
            >
              {/* Active left accent bar */}
              {active && (
                <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-full bg-foreground dark:bg-white/80" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-foreground" : "group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-semibold text-white">
                  {pendingCount! > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative z-10 border-t border-sidebar-border p-4 dark:border-white/[0.07] dark:bg-[linear-gradient(to_top,rgba(255,255,255,0.02),transparent)]">
        <div className="mb-3 px-1">
          <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 dark:text-muted-foreground/50">
            Organizācija
          </div>
          <div className="mt-1 truncate text-base font-semibold">{organizationName}</div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            href={profileHref(role)}
            className="-mx-1 min-w-0 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent dark:hover:bg-white/[0.06]"
            title="Mans profils"
          >
            <div className="truncate text-base font-medium">{userName}</div>
            <div className="text-sm text-muted-foreground/70">{roleLabels[role]}</div>
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <a
              href="/api/auth/logout"
              className="inline-flex items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground dark:hover:bg-white/[0.07]"
              title="Iziet"
              aria-label="Iziet"
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
