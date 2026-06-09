"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PERIODS = [
  { label: "7 d.", value: "7d" },
  { label: "30 d.", value: "30d" },
  { label: "90 d.", value: "90d" },
  { label: "Viss", value: "all" },
];

export function PeriodTabs({ current }: { current: string }) {
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
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
      {PERIODS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => navigate(value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            active === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
