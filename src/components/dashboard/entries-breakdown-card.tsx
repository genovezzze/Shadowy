"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BreakdownItem {
  label: string;
  value: number;
}

interface Props {
  label: string;
  value: number;
  icon?: ReactNode;
  breakdown: BreakdownItem[];
  className?: string;
}

export function EntriesBreakdownCard({ label, value, icon, breakdown, className }: Props) {
  const [open, setOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const openPopup = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const POPUP_WIDTH = 240;
    const spaceRight = window.innerWidth - rect.left;
    const left = spaceRight >= POPUP_WIDTH ? rect.left : Math.max(8, rect.right - POPUP_WIDTH);
    setPopupStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left,
      width: POPUP_WIDTH,
    });
    setOpen((v) => !v);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={openPopup}
        className={cn(
          "glass w-full rounded-xl border border-border bg-card p-5 text-left text-card-foreground transition-colors hover:border-foreground/20",
          "dark:border-white/[0.08] dark:bg-gradient-to-b dark:from-white/[0.05] dark:via-white/[0.03] dark:to-white/[0.01] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_-16px_rgba(0,0,0,0.6)] dark:hover:border-white/[0.16]",
          className
        )}
      >
        {icon ? (
          <div className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white/70">
            {icon}
          </div>
        ) : null}
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        <div className="mt-1.5 text-xs text-muted-foreground/50">Detalizēti →</div>
      </button>

      {open && (
        <div
          ref={popupRef}
          style={popupStyle}
          className="z-[200] rounded-xl border border-border bg-card p-2 shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark:border-white/[0.12] dark:shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
        >
          {breakdown.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted/40"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-semibold tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
