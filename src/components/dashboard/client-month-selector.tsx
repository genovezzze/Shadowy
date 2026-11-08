"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import type { ClientMonthOption } from "@/lib/client-month";
import { startNavigationLoading } from "@/lib/navigation-loading";
import { cn } from "@/lib/utils";

interface DropdownProps {
  selectedMonth: string;
  options: ClientMonthOption[];
  compact?: boolean;
  apple?: boolean;
}

export function ClientMonthDropdown({ selectedMonth, options, compact, apple }: DropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = options.find((option) => option.value === selectedMonth) ?? options[0];

  function changeMonth(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("clientMonth", value);
    const destination = `${pathname}?${params.toString()}`;
    startNavigationLoading(destination);
    router.push(destination, { scroll: false });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            apple
              ? "inline-flex h-9 items-center justify-between gap-2 rounded-full bg-black/[0.05] px-4 text-[15px] font-medium text-[#007AFF] outline-none transition-colors hover:bg-black/[0.08] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/40 dark:bg-white/[0.1] dark:text-[#0A84FF] dark:hover:bg-white/[0.15]"
              : "inline-flex items-center justify-between gap-3 rounded-xl border border-border bg-background/80 font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-muted focus:ring-2 focus:ring-emerald-500/25 data-[state=open]:border-emerald-500/60 data-[state=open]:ring-2 data-[state=open]:ring-emerald-500/20",
            !apple && (compact ? "h-8 min-w-40 px-3 text-xs" : "h-10 min-w-56 px-4 text-sm"),
          )}
          aria-label="Izvēlēties klientu limitu periodu"
        >
          <span className="truncate">{selected?.label}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0", apple ? "" : "text-muted-foreground")} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            "z-[70] max-h-72 min-w-[14rem] overflow-y-auto text-foreground",
            apple
              ? "rounded-2xl bg-card p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:bg-[#2c2c2e] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
              : "rounded-xl border border-border bg-card p-1.5 shadow-2xl"
          )}
        >
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onSelect={() => changeMonth(option.value)}
              className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-muted focus:bg-muted"
            >
              <span>{option.label}</span>
              {option.value === selectedMonth && <Check className={cn("h-4 w-4", apple ? "text-[#007AFF] dark:text-[#0A84FF]" : "text-emerald-500")} />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface Props {
  selectedMonth: string;
  options: ClientMonthOption[];
  /** Grouped-list header look, used on the admin overview. */
  apple?: boolean;
}

export function ClientMonthSelector({ selectedMonth, options, apple = false }: Props) {
  if (apple) {
    return (
      <div className="mb-2 mt-10 flex flex-col gap-2 px-1 print:hidden sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[13px] text-muted-foreground">Klientu mēneša limiti</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground/70">
            Limits sākas no jauna katra mēneša 1. datumā, iepriekšējo mēnešu dati tiek saglabāti
          </p>
        </div>
        <ClientMonthDropdown selectedMonth={selectedMonth} options={options} apple />
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <div className="text-sm font-semibold">Klientu mēneša limiti</div>
          <p className="text-xs text-muted-foreground">
            Limits sākas no jauna katra mēneša 1. datumā. Iepriekšējo mēnešu dati tiek saglabāti.
          </p>
        </div>
      </div>
      <ClientMonthDropdown selectedMonth={selectedMonth} options={options} />
    </div>
  );
}
