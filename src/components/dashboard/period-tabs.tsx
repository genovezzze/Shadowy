"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PERIODS = [
  { label: "7 d.", value: "7d" },
  { label: "30 d.", value: "30d" },
  { label: "90 d.", value: "90d" },
  { label: "Viss", value: "all" },
];

export function PeriodTabs({ current, className }: { current: string; className?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();

  function navigate(value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value === "all") params.delete("period");
    else params.set("period", value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const active = current || "all";

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-xl border border-border bg-muted/60 p-1 backdrop-blur-md dark:border-white/[0.09] dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        className
      )}
    >
      {PERIODS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => navigate(value)}
          className={cn(
            "flex-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all duration-150 sm:flex-initial sm:px-4 sm:text-xs",
            active === value
              ? "bg-card text-foreground shadow-sm dark:bg-white/[0.12] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
              : "text-muted-foreground hover:bg-card/60 hover:text-foreground dark:hover:bg-white/[0.06]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
