"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
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

function timeAgo(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "tagad";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

export function NotificationBell({
  initialUnreadCount,
  openUpward,
  alignLeft,
}: {
  initialUnreadCount: number;
  openUpward?: boolean;
  alignLeft?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [pending, startTransition] = useTransition();
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !(e.target as Element)?.closest?.("[data-notification-panel]")
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function updatePanelPosition() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const panelWidth = Math.min(320, window.innerWidth - 32);
    let left = alignLeft ? rect.left : rect.right - panelWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));

    const style: React.CSSProperties = { left, width: panelWidth };
    if (openUpward) {
      style.bottom = window.innerHeight - rect.top + 8;
    } else {
      style.top = rect.bottom + 8;
    }
    setPanelStyle(style);
  }

  function toggleOpen() {
    const next = !open;
    if (next) updatePanelPosition();
    setOpen(next);
    if (next && items === null) {
      startTransition(async () => {
        const data = await listNotifications();
        setItems(data);
      });
    }
  }

  useEffect(() => {
    if (!open) return;
    function onReposition() {
      updatePanelPosition();
    }
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

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
    setOpen(false);
  }

  const panel = open && (
    <div
      data-notification-panel
      className="glass fixed z-[100] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-card dark:rounded-2xl dark:border-white/[0.07] dark:bg-gradient-to-b dark:from-white/[0.06] dark:via-white/[0.035] dark:to-white/[0.015] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_16px_40px_-16px_rgba(0,0,0,0.6)]"
      style={panelStyle}
    >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-semibold">Paziņojumi</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={pending}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                Atzīmēt visus kā lasītus
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items === null ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">Ielādē...</div>
            ) : items.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Nav paziņojumu.
              </div>
            ) : (
              items.map((item) => {
                const content = (
                  <div
                    className={`flex flex-col gap-0.5 px-3 py-2.5 text-sm transition-colors hover:bg-accent ${
                      item.read ? "" : "bg-accent/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{item.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                    {item.body && (
                      <span className="text-xs text-muted-foreground">{item.body}</span>
                    )}
                  </div>
                );

                return item.link ? (
                  <Link key={item.id} href={item.link} onClick={() => handleItemClick(item)}>
                    {content}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    className="block w-full text-left"
                    onClick={() => handleItemClick(item)}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
    </div>
  );

  return (
    <div ref={ref} className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggleOpen}
        aria-label="Paziņojumi"
        title="Paziņojumi"
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
