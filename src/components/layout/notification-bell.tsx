"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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

export function NotificationBell({ initialUnreadCount }: { initialUnreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && items === null) {
      startTransition(async () => {
        const data = await listNotifications();
        setItems(data);
      });
    }
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
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <Button
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

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover shadow-lg">
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
      )}
    </div>
  );
}
