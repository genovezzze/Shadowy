"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, CheckCircle2, Sparkles, Undo2, X, XCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHIP_GROUP, chipClass } from "@/components/dashboard/apple";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/notifications/actions";

type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

type Tab = "unread" | "all";

const shortDate = new Intl.DateTimeFormat("lv-LV", { day: "numeric", month: "short" });
const longDate = new Intl.DateTimeFormat("lv-LV", { day: "numeric", month: "short", year: "numeric" });

/** Relative time for the last week, a calendar date after that ("83 d" says little). */
function timeAgo(date: Date): string {
  const d = new Date(date);
  const minutes = Math.floor((Date.now() - d.getTime()) / 60000);
  if (minutes < 1) return "tagad";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return d.getFullYear() === new Date().getFullYear() ? shortDate.format(d) : longDate.format(d);
}

function getNotificationVisual(title: string): {
  icon: LucideIcon;
  iconCls: string;
} {
  if (title.includes("noraidīts")) {
    return { icon: XCircle, iconCls: "bg-[#FF3B30]/12 text-[#D70015] dark:bg-[#FF453A]/15 dark:text-[#FF453A]" };
  }
  if (title.includes("apstiprināts")) {
    return { icon: CheckCircle2, iconCls: "bg-[#34C759]/12 text-[#248A3D] dark:bg-[#30D158]/15 dark:text-[#30D158]" };
  }
  if (title.includes("atpakaļ")) {
    return { icon: Undo2, iconCls: "bg-[#FF9500]/12 text-[#C93400] dark:bg-[#FF9F0A]/15 dark:text-[#FF9F0A]" };
  }
  // "Jauns darba ieraksts" and "Jauni darba ieraksti" are the same event.
  if (title.startsWith("Jaun")) {
    return { icon: Sparkles, iconCls: "bg-[#007AFF]/12 text-[#007AFF] dark:bg-[#0A84FF]/15 dark:text-[#0A84FF]" };
  }
  return { icon: Bell, iconCls: "bg-muted text-muted-foreground" };
}

export function NotificationBell({
  initialUnreadCount,
  onUnreadCountChange,
}: {
  initialUnreadCount: number;
  /** Lets the host show the count next to its own label. */
  // eslint-disable-next-line no-unused-vars
  onUnreadCountChange?: (count: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const loading = useRef(false);
  const prefetch = useCallback(() => {
    if (loading.current) return;
    loading.current = true;
    listNotifications()
      .then((data) => setItems(data))
      .catch(() => {})
      .finally(() => {
        loading.current = false;
      });
  }, []);

  useEffect(() => {
    // Load the list in the background once the page has settled, so opening
    // the panel never waits on the server.
    const timer = window.setTimeout(prefetch, 600);
    return () => window.clearTimeout(timer);
  }, [prefetch]);

  // While open: Escape closes, the page behind doesn't scroll, focus starts on close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openPanel() {
    setTab(unreadCount > 0 ? "unread" : "all");
    setOpen(true);
    // Refresh in the background; whatever is already loaded shows at once.
    prefetch();
  }

  function handleMarkAllRead() {
    setUnreadCount(0);
    setItems((prev) => prev?.map((n) => ({ ...n, read: true })) ?? prev);
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  }

  function handleItemClick(item: NotificationItem) {
    if (!item.read) {
      setUnreadCount((c) => Math.max(0, c - 1));
      setItems((prev) =>
        prev?.map((n) => (n.id === item.id ? { ...n, read: true } : n)) ?? prev
      );
      startTransition(async () => {
        await markNotificationRead(item.id);
      });
    }
    if (item.link) setOpen(false);
  }

  const visible = items && (tab === "unread" ? items.filter((n) => !n.read) : items);

  const panel = open && (
    // React events bubble out of portals to the host; the sidebar row re-clicks
    // the bell on any click it receives, which would reopen the panel.
    <div data-notification-panel className="fixed inset-0 z-[100]" onClick={(e) => e.stopPropagation()}>
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className="animate-notif-backdrop-in absolute inset-0 bg-black/25 dark:bg-black/50"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Paziņojumi"
        className="animate-notif-drawer-in absolute inset-y-0 right-0 flex w-full flex-col border-l border-black/[0.07] bg-white shadow-[0_0_48px_rgba(0,0,0,0.16)] dark:border-white/[0.08] dark:bg-[#1c1c1e] dark:shadow-[0_0_48px_rgba(0,0,0,0.6)] sm:w-[400px]"
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="font-display text-[20px] font-medium">Paziņojumi</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Aizvērt"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-black/[0.07] px-5 pb-3 dark:border-white/[0.08]">
          <div className={CHIP_GROUP} role="tablist">
            <button type="button" role="tab" aria-selected={tab === "unread"} onClick={() => setTab("unread")} className={chipClass(tab === "unread")}>
              Nelasītie
              {unreadCount > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#007AFF] px-1 text-[10px] font-medium tabular-nums text-white dark:bg-[#0A84FF]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <button type="button" role="tab" aria-selected={tab === "all"} onClick={() => setTab("all")} className={chipClass(tab === "all")}>
              Visi
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={pending}
              className="text-[13px] font-medium text-[#007AFF] hover:underline disabled:opacity-50 dark:text-[#0A84FF]"
            >
              Atzīmēt visus kā lasītus
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {visible === null ? (
            // Placeholder rows while the very first load is still in flight.
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-black/[0.06] dark:bg-white/[0.08]" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-black/[0.04] dark:bg-white/[0.05]" />
                </div>
              </div>
            ))
          ) : visible.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 pb-16 text-center">
              {tab === "unread" ? (
                <CheckCircle2 className="h-6 w-6 text-muted-foreground/50" />
              ) : (
                <Bell className="h-6 w-6 text-muted-foreground/50" />
              )}
              <span className="text-sm text-muted-foreground">
                {tab === "unread" ? "Viss izlasīts." : "Nav paziņojumu."}
              </span>
              {tab === "unread" && items && items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTab("all")}
                  className="text-[13px] font-medium text-[#007AFF] hover:underline dark:text-[#0A84FF]"
                >
                  Rādīt visus
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {visible.map((item, i) => {
                const { icon: Icon, iconCls } = getNotificationVisual(item.title);
                const content = (
                  <div
                    className="animate-notif-in flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconCls}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className={item.read ? "text-[14px] text-foreground/80" : "text-[14px] font-medium"}>
                          {item.title}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      {item.body && (
                        <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-muted-foreground">{item.body}</p>
                      )}
                    </div>
                    <span
                      aria-label={item.read ? undefined : "Nelasīts"}
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-transparent" : "bg-[#007AFF] dark:bg-[#0A84FF]"}`}
                    />
                  </div>
                );

                return (
                  <li key={item.id}>
                    {item.link ? (
                      <Link href={item.link} onClick={() => handleItemClick(item)} className="block">
                        {content}
                      </Link>
                    ) : (
                      <button type="button" className="block w-full" onClick={() => handleItemClick(item)}>
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => (open ? setOpen(false) : openPanel())}
        onPointerEnter={prefetch}
        aria-label={unreadCount > 0 ? `Paziņojumi, nelasīti: ${unreadCount}` : "Paziņojumi"}
        aria-expanded={open}
        title="Paziņojumi"
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#007AFF] ring-2 ring-sidebar dark:bg-[#0A84FF]" />
        )}
      </Button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
