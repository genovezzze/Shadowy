"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  History,
  LogOut,
  Briefcase,
  Gift,
  Inbox,
  UserCircle,
  BarChart2,
  Building2,
  Settings,
  Megaphone,
  ScanSearch,
  ShieldCheck,
  PanelLeftClose,
  PlusCircle,
  PanelLeftOpen,
  Pin,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "./notification-bell";

type NavMotion =
  | "dashboard"
  | "manager"
  | "users"
  | "building"
  | "document"
  | "gift"
  | "chart"
  | "megaphone"
  | "settings"
  | "profile"
  | "briefcase"
  | "inbox"
  | "history"
  | "ai"
  | "plus"
  | "badge";

type NavItem = { href: string; label: string; icon: any; motion: NavMotion };

function ShadowyNavIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      {...props}
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

// Settings live in the footer, just above "Iziet", not in the main list.
const ADMIN_SETTINGS: NavItem = { href: "/admin/settings", label: "Iestatījumi", icon: Settings, motion: "settings" };

const ADMIN_ONLY_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Pārskats", icon: LayoutDashboard, motion: "dashboard" },
  { href: "/admin/managers", label: "Vadītāji", icon: UserCog, motion: "manager" },
  { href: "/admin/employees", label: "Darbinieki", icon: Users, motion: "users" },
  { href: "/manager/clients", label: "Klienti", icon: Building2, motion: "building" },
  { href: "/admin/entries", label: "Visi ieraksti", icon: FileText, motion: "document" },
  { href: "/admin/insights", label: "Procesu analīze", icon: ScanSearch, motion: "chart" },
  { href: "/admin/bonuses", label: "Bonusu pārskats", icon: Gift, motion: "gift" },
  { href: "/admin/report", label: "Pilota atskaite", icon: BarChart2, motion: "chart" },
  { href: "/admin/announcements", label: "Paziņojumi", icon: Megaphone, motion: "megaphone" },
  { href: "/admin/profile", label: "Mans profils", icon: UserCircle, motion: "profile" },
];

const ADMIN_MANAGER_NAV: NavItem[] = [
  { href: "/admin/lomas", label: "Lomas", icon: Briefcase, motion: "briefcase" },
  { href: "/admin/atzinibas", label: "Atzinības noteikumi", icon: Gift, motion: "gift" },
  { href: "/admin/bonus-requests", label: "Bonusu pieprasījumi", icon: Inbox, motion: "inbox" },
  { href: "/admin/komandas-ieraksti", label: "Komandas ieraksti", icon: FileText, motion: "document" },
];

const MANAGER_NAV: NavItem[] = [
  { href: "/manager/dashboard", label: "Pārskats", icon: LayoutDashboard, motion: "dashboard" },
  { href: "/manager/employees", label: "Mana komanda", icon: Users, motion: "users" },
  { href: "/manager/entries", label: "Komandas ieraksti", icon: FileText, motion: "document" },
  { href: "/manager/insights", label: "Procesu analīze", icon: ScanSearch, motion: "chart" },
  { href: "/manager/clients", label: "Klienti", icon: Building2, motion: "building" },
  { href: "/manager/profile", label: "Mans profils", icon: UserCircle, motion: "profile" },
];

const EMPLOYEE_NAV: NavItem[] = [
  { href: "/employee/dashboard", label: "Pārskats", icon: LayoutDashboard, motion: "dashboard" },
  {
    href: "/employee/smart-log",
    label: "Shadowy AI ieraksts",
    icon: ShadowyNavIcon,
    motion: "ai",
  },
  { href: "/employee/new-entry", label: "Jauns ieraksts", icon: PlusCircle, motion: "plus" },
  { href: "/employee/history", label: "Vēsture", icon: History, motion: "history" },
  { href: "/employee/profile", label: "Mans profils", icon: UserCircle, motion: "profile" },
  { href: "/employee/privatums", label: "Mani dati", icon: ShieldCheck, motion: "badge" },
];

function NavLink({
  item,
  pathname,
  pendingCount,
  onClose,
  rail,
  showLabel,
}: {
  item: NavItem;
  pathname: string;
  pendingCount?: number;
  onClose?: () => void;
  /** Icon-rail geometry: fixed icon box, label appended to its right. */
  rail?: boolean;
  showLabel?: boolean;
}) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;
  const showBadge = (item.href === "/manager/entries" || item.href === "/admin/komandas-ieraksti") && (pendingCount ?? 0) > 0;
  const [iconAnimating, setIconAnimating] = useState(false);
  const hoverTimer = useRef<number | null>(null);
  const finishTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
  }, []);

  const scheduleIconAnimation = () => {
    if (iconAnimating || hoverTimer.current !== null) return;
    hoverTimer.current = window.setTimeout(() => {
      hoverTimer.current = null;
      setIconAnimating(true);
      finishTimer.current = window.setTimeout(() => {
        finishTimer.current = null;
        setIconAnimating(false);
      }, 720);
    }, 75);
  };

  const cancelScheduledAnimation = () => {
    if (hoverTimer.current === null) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };

  return (
    <Link
      href={item.href}
      onClick={onClose}
      onMouseEnter={scheduleIconAnimation}
      onMouseLeave={cancelScheduledAnimation}
      title={rail && !showLabel ? item.label : undefined}
      aria-label={rail && !showLabel ? item.label : undefined}
      className={cn(
        "sidebar-nav-link group relative flex h-9 items-center overflow-hidden rounded-lg text-[15px] transition-colors duration-150",
        rail ? (showLabel ? "w-full" : "w-10") : "gap-2.5 px-3",
        active
          ? "bg-[#007AFF]/10 font-medium text-[#007AFF] dark:bg-[#0A84FF]/20 dark:text-[#4DA3FF]"
          : "text-muted-foreground hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.05]"
      )}
    >
      <span className={cn("relative z-10 flex shrink-0 items-center justify-center", rail ? "h-9 w-10" : "h-[18px] w-[18px]")}>
        <Icon
          data-nav-motion={item.motion}
          className={cn(
            "sidebar-nav-icon h-[18px] w-[18px] transition-colors duration-150",
            iconAnimating && "is-animating",
            active ? "text-current" : "group-hover:text-foreground",
          )}
        />
      </span>
      {(!rail || showLabel) && (
        <span className={cn("relative z-10 flex-1", rail && "truncate whitespace-nowrap pr-3")}>
          {item.label}
        </span>
      )}
      {showBadge && (rail && !showLabel ? (
        <span className="absolute right-1.5 top-1.5 z-10 h-2 w-2 rounded-full bg-[#007AFF] ring-2 ring-sidebar dark:bg-[#0A84FF]" />
      ) : (
        <span className="relative z-10 ml-auto mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#007AFF] px-1.5 text-[11px] font-medium tabular-nums text-white dark:bg-[#0A84FF]">
          {pendingCount! > 99 ? "99+" : pendingCount}
        </span>
      ))}
    </Link>
  );
}

// Pages that are not in the menu but still deserve a name in the top bar.
const EXTRA_TITLES: { href: string; label: string }[] = [
  { href: "/employee/clients", label: "Klients" },
  { href: "/employee/bonuses", label: "Atzinība" },
  { href: "/employee/my-role", label: "Mana loma" },
  { href: "/manager/employee", label: "Darbinieks" },
  { href: "/manager/roles", label: "Lomas" },
  { href: "/manager/bonus-rules", label: "Atzinības noteikumi" },
  { href: "/manager/bonus-requests", label: "Bonusu pieprasījumi" },
  { href: "/manager/report", label: "Pilota atskaite" },
  { href: "/notifications", label: "Paziņojumi" },
  { href: "/account", label: "Konts" },
];

/** The current page's name for the top bar: the longest menu entry the path falls under. */
export function pageTitleFor(pathname: string): string {
  const all = [
    ...ADMIN_ONLY_NAV,
    ADMIN_SETTINGS,
    ...ADMIN_MANAGER_NAV,
    ...MANAGER_NAV,
    ...EMPLOYEE_NAV,
    ...EXTRA_TITLES,
  ];
  let best: { href: string; label: string } | undefined;
  for (const item of all) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.href.length) best = item;
    }
  }
  return best?.label ?? "";
}

function navFor(role: Role): NavItem[] {
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
  /** Desktop icon rail: labels hidden, expands with the toggle. */
  collapsed?: boolean;
  /** The collapsed rail is showing its full panel on hover. */
  peeking?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({
  role,
  userName,
  organizationName,
  pendingCount,
  unreadNotificationCount,
  onClose,
  collapsed = false,
  peeking = false,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";
  const mainItems = isAdmin ? ADMIN_ONLY_NAV : navFor(role);
  const managerItems = isAdmin ? ADMIN_MANAGER_NAV : [];
  const [unreadNotifications, setUnreadNotifications] = useState(unreadNotificationCount ?? 0);
  const rail = collapsed;
  const showLabel = collapsed && peeking;
  // One row of the rail: a 40px box for the icon, then the label when peeking.
  const railRow =
    "flex h-9 items-center rounded-lg text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.05]";
  const railBox = "flex h-9 w-10 shrink-0 items-center justify-center";
  const railLabel = "select-none truncate whitespace-nowrap pr-3 text-[15px]";
  // Rows that wrap a self-contained button (bell, theme): a click on the label
  // presses that button, so the whole row works like the nav links around it.
  const clickInnerButton = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const button = e.currentTarget.querySelector("button");
    if (!button) return;
    // Menu triggers (the theme picker) open on pointerdown, not on click.
    if (button.getAttribute("aria-haspopup") === "menu") {
      button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerType: "mouse" }));
    } else {
      button.click();
    }
  };

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar font-app transition-[width] duration-200 ease-out dark:border-white/[0.07]",
        collapsed && !peeking ? "w-[68px]" : "w-64"
      )}
    >
      {collapsed ? (
        /* Rail header: the mark, then a short inset divider (the long line
           belongs to the top bar only). The bell and the toggle open the
           nav group below, so the whole column reads as one block. */
        <div className="relative z-10">
          <div className="flex h-14 items-center px-3.5">
          {/* A plain link on purpose: the landing has its own layout, so it loads in full. */}
          <a href="/" className="flex h-10 items-center transition-opacity hover:opacity-75" aria-label="Shadowy">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
              <Image src="/shadowy.svg" alt="" width={24} height={24} className="shrink-0 invert dark:invert-0" />
            </span>
            {showLabel && (
              <span className="whitespace-nowrap font-display text-[24px] font-normal leading-none tracking-tight">Shadowy</span>
            )}
          </a>
          </div>
          <div aria-hidden className="mx-3.5 h-px bg-sidebar-border dark:bg-white/[0.07]" />
        </div>
      ) : (
      <>
      <div className="relative z-10 flex h-14 items-center justify-between px-5">
        <a
          href="/"
          className="flex items-center gap-1.5 transition-opacity hover:opacity-75"
        >
          <Image src="/shadowy.svg" alt="Shadowy" width={24} height={24} className="shrink-0 invert dark:invert-0" />
          {/* Matched to the landing nav lockup: mark and word share the same
              24px measure so the word stands as tall as the mark, not taller.
              The size is an arbitrary value on purpose - Tailwind's named steps
              ship their own line-height, which lands after leading-none and
              would put the word's box back out of step with the mark.

              `font-display` is named because the sidebar sits in a `font-accent`
              group, and that variable registers a 300 face alone - any weight
              asked for against it is synthesised rather than drawn. `font-normal`
              resolves to the regular face here. */}
          <div className="font-display text-[24px] font-normal leading-none tracking-tight">
            Shadowy
          </div>
        </a>
        <div className="flex items-center gap-1">
          <NotificationBell initialUnreadCount={unreadNotificationCount ?? 0} />
          {onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground md:flex dark:hover:bg-white/[0.05]"
              title="Sakļaut izvēlni"
              aria-label="Sakļaut izvēlni"
            >
              <PanelLeftClose className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </div>
      <div aria-hidden className="mx-3.5 h-px bg-sidebar-border dark:bg-white/[0.07]" />
      </>
      )}

      {/* Nav */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <nav className={cn("flex h-full flex-col overflow-y-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", rail ? "px-3.5 pt-3" : "px-3 pt-3")}>
          <div className="space-y-0.5">
          {rail && (
            <>
          <div className={cn(railRow, "[&_button]:!bg-transparent", showLabel ? "w-full cursor-pointer" : "w-10")} onClick={showLabel ? clickInnerButton : undefined}>
            <span className={railBox}>
              <NotificationBell initialUnreadCount={unreadNotificationCount ?? 0} onUnreadCountChange={setUnreadNotifications} />
            </span>
            {showLabel && <span className={cn(railLabel, "flex-1")}>Paziņojumi</span>}
            {showLabel && unreadNotifications > 0 && (
              <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#007AFF] px-1.5 text-[11px] font-medium tabular-nums text-white dark:bg-[#0A84FF]">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </div>
          {onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className={cn(railRow, showLabel ? "w-full" : "w-10")}
              title={showLabel ? "Piespraust izvēlni" : "Izvērst izvēlni"}
              aria-label={showLabel ? "Piespraust izvēlni" : "Izvērst izvēlni"}
            >
              <span className={railBox}>
                {showLabel ? <Pin className="h-[18px] w-[18px]" /> : <PanelLeftOpen className="h-[18px] w-[18px]" />}
              </span>
              {showLabel && <span className={railLabel}>Piespraust izvēlni</span>}
            </button>
          )}
              {/* Tools above, pages below. */}
              <div aria-hidden className="!my-3 h-px bg-sidebar-border dark:bg-white/[0.07]" />
            </>
          )}
          {mainItems.map((item) => <NavLink key={item.href} item={item} pathname={pathname} pendingCount={pendingCount} onClose={onClose} rail={rail} showLabel={showLabel} />)}

          {managerItems.length > 0 && (
            <>
              {rail ? null : (
                <div className="px-3 pb-2 pt-6 text-xs text-muted-foreground">
                  Vadītāja funkcijas
                </div>
              )}
              {managerItems.map((item) => <NavLink key={item.href} item={item} pathname={pathname} pendingCount={pendingCount} onClose={onClose} rail={rail} showLabel={showLabel} />)}
            </>
          )}
          </div>
        </nav>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-sidebar to-transparent" />
      </div>

      {/* Footer */}
      {rail ? (
        <div className="relative z-10">
        <div aria-hidden className="mx-3.5 h-px bg-sidebar-border dark:bg-white/[0.07]" />
        <div className="flex flex-col gap-1 px-3.5 py-3">
          <Link
            href={profileHref(role)}
            className={cn(railRow, showLabel ? "w-full" : "w-10")}
            title={`${userName} · ${organizationName}`}
            aria-label="Mans profils"
          >
            <span className={railBox}>
              <UserCircle className="h-[18px] w-[18px]" />
            </span>
            {showLabel && <span className={cn(railLabel, "text-foreground")}>{userName}</span>}
          </Link>
          <div className={cn(railRow, "[&_button]:!bg-transparent", showLabel ? "w-full cursor-pointer" : "w-10")} onClick={showLabel ? clickInnerButton : undefined}>
            <span className={railBox}>
              <ThemeToggle />
            </span>
            {showLabel && <span className={railLabel}>Tēma</span>}
          </div>
          {isAdmin && (
            <NavLink item={ADMIN_SETTINGS} pathname={pathname} onClose={onClose} rail={rail} showLabel={showLabel} />
          )}
          <a
            href="/api/auth/logout"
            className={cn(railRow, showLabel ? "w-full" : "w-10")}
            title="Iziet"
            aria-label="Iziet"
          >
            <span className={railBox}>
              <LogOut className="h-4 w-4" />
            </span>
            {showLabel && <span className={railLabel}>Iziet</span>}
          </a>
        </div>
        </div>
      ) : (
      <div className="relative z-10">
      <div aria-hidden className="mx-3.5 h-px bg-sidebar-border dark:bg-white/[0.07]" />
      <div className="p-4">
        <div className="mb-3 px-1">
          <div className="text-xs text-muted-foreground">Organizācija</div>
          <div className="mt-1 truncate text-[15px] font-medium">{organizationName}</div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            href={profileHref(role)}
            className="-mx-1 min-w-0 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent dark:hover:bg-white/[0.06]"
            title="Mans profils"
          >
            <div className="truncate text-[15px]">{userName}</div>
            <div className="text-[13px] text-muted-foreground">{roleLabels[role]}</div>
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isAdmin && (
              <Link
                href={ADMIN_SETTINGS.href}
                onClick={onClose}
                className={cn(
                  "inline-flex items-center rounded-md p-2 transition-colors hover:bg-sidebar-accent hover:text-foreground dark:hover:bg-white/[0.07]",
                  pathname.startsWith(ADMIN_SETTINGS.href) ? "text-[#007AFF] dark:text-[#4DA3FF]" : "text-muted-foreground"
                )}
                title="Iestatījumi"
                aria-label="Iestatījumi"
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
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
      </div>
      )}
    </aside>
  );
}
