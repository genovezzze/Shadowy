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

type NavItem = { href: string; label: string; icon: any };

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
  onClose?: () => void;
}

export function Sidebar({ role, userName, organizationName, pendingCount, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = navFor(role);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <Link href="/" className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border hover:opacity-80 transition-opacity">
        <img src="/logo.png" alt="Shadowy" width={40} height={40} className="rounded-xl" />
        <div className="text-lg font-semibold leading-none">Shadowy</div>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const showBadge = item.href === "/manager/entries" && (pendingCount ?? 0) > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
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

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3">
          <div className="text-xs text-muted-foreground">Organizācija</div>
          <div className="text-sm font-medium truncate">{organizationName}</div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            href={profileHref(role)}
            className="min-w-0 rounded-md -mx-1 px-1 py-0.5 hover:bg-sidebar-accent transition-colors"
            title="Mans profils"
          >
            <div className="text-sm font-medium truncate">{userName}</div>
            <div className="text-xs text-muted-foreground">
              {roleLabels[role]}
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <a
              href="/api/auth/logout"
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center"
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