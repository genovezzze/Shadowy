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
    <aside className="relative flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-white/[0.07] bg-white/[0.03] backdrop-blur-md"
      style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04), 1px 0 40px rgba(0,0,0,0.35)" }}
    >
      {/* Emerald glow blob — top center */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(160 65% 35% / 0.22), transparent 68%)" }}
      />

      {/* Subtle bottom glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(220 80% 40% / 0.10), transparent 70%)" }}
      />

      {/* Dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        className="relative z-10 flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-5 transition-opacity hover:opacity-75"
      >
        <img src="/logo.png" alt="Shadowy" width={38} height={38} className="rounded-xl" />
        <div className="text-lg font-semibold leading-none tracking-tight">Shadowy</div>
      </Link>

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
                "group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors duration-150",
                active
                  ? "bg-white/[0.09] text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
              )}
            >
              {/* Active left accent bar */}
              {active && (
                <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-full bg-emerald-400/90" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-emerald-400" : "group-hover:text-foreground"
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
      <div className="relative z-10 border-t border-white/[0.07] p-4"
        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.02), transparent)" }}
      >
        <div className="mb-3 px-1">
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
            Organizācija
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold">{organizationName}</div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            href={profileHref(role)}
            className="-mx-1 min-w-0 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.06]"
            title="Mans profils"
          >
            <div className="truncate text-sm font-medium">{userName}</div>
            <div className="text-xs text-muted-foreground/70">{roleLabels[role]}</div>
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <a
              href="/api/auth/logout"
              className="inline-flex items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground"
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
