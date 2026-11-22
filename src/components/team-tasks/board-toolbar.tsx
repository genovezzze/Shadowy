"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLE_PILL } from "@/components/dashboard/apple";

export function BoardToolbar({
  period,
  label,
  prev,
  next,
  isCurrent,
  people,
  assignee,
}: {
  period: string;
  label: string;
  prev: string;
  /** null when the next month has not started yet. */
  next: string | null;
  isCurrent: boolean;
  people?: { id: string; name: string }[];
  assignee?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefWith(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams?.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        <Link href={hrefWith({ m: prev })} className={cn(APPLE_PILL, "px-2")} aria-label="Iepriekšējais mēnesis">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-[140px] px-2 text-center font-display text-[15px] font-medium" aria-live="polite">
          {label}
        </div>
        {next ? (
          <Link href={hrefWith({ m: next })} className={cn(APPLE_PILL, "px-2")} aria-label="Nākamais mēnesis">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className={cn(APPLE_PILL, "cursor-not-allowed px-2 opacity-40")} aria-hidden>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
        {!isCurrent && (
          <Link href={hrefWith({ m: null })} className={APPLE_PILL}>
            Šis mēnesis
          </Link>
        )}
      </div>

      {people && people.length > 0 && (
        <div className="relative">
        <select
          value={assignee ?? ""}
          onChange={(e) => router.push(hrefWith({ darbinieks: e.target.value || null }))}
          // Own chevron: the browser's arrow sits flush against the pill's edge.
          className="h-8 appearance-none rounded-full border border-black/[0.08] bg-white pl-3.5 pr-9 text-[13px] dark:border-white/[0.1] dark:bg-white/[0.04]"
          aria-label="Darbinieks"
          data-period={period}
        >
          <option value="">Visa komanda</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        />
        </div>
      )}
    </div>
  );
}
