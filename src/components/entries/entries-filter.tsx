"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { statusLabel } from "@/lib/i18n";
import type { EntryStatus } from "@prisma/client";
import { categoryLabel } from "@/lib/work-insights";
import { parseEmployeeIds } from "@/lib/entry-filter";
import { startNavigationLoading } from "@/lib/navigation-loading";

const STATUSES: EntryStatus[] = ["PENDING", "APPROVED", "REJECTED", "RETURNED"];

// Radix Select doesn't allow an empty string as an item value, so use a sentinel
// for the "no filter" option and strip it back out when applying the filters.
const ALL_VALUE = "__all__";

interface EntriesFilterProps {
  categories: string[];
  employees?: { id: string; name: string }[];
  clients?: { value: string; label: string }[];
  showStatus?: boolean;
}

export function EntriesFilter({
  categories,
  employees,
  clients,
  showStatus = true,
}: EntriesFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  // The employee filter holds several ids, comma separated in the URL. Keep it
  // in state so ticking boxes doesn't navigate on every click, and re-sync it
  // whenever the URL changes underneath us (back button, "Notīrīt").
  const employeeParam = params.get("employee") ?? "";
  const [employeeIds, setEmployeeIds] = useState(() => parseEmployeeIds(employeeParam));
  const [syncedParam, setSyncedParam] = useState(employeeParam);
  if (syncedParam !== employeeParam) {
    setSyncedParam(employeeParam);
    setEmployeeIds(parseEmployeeIds(employeeParam));
  }

  const hasFilters = ["q", "status", "category", "employee", "client", "from", "to"].some(
    (k) => params.get(k)
  );

  function apply(form: HTMLFormElement) {
    const data = new FormData(form);
    const next = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      const v = String(value).trim();
      if (v && v !== ALL_VALUE) next.set(key, v);
    }
    const qs = next.toString();
    const destination = qs ? `${pathname}?${qs}` : pathname;
    startNavigationLoading(destination);
    router.push(destination);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    apply(e.currentTarget);
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={(e) => {
        // Auto-apply when a dropdown or date changes; free-text waits for submit.
        const target = e.target as HTMLElement;
        if (target.tagName === "SELECT" || (target as HTMLInputElement).type === "date") {
          apply(e.currentTarget);
        }
      }}
      className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="grid gap-1.5 sm:col-span-2 lg:col-span-1">
        <Label htmlFor="q">Meklēt</Label>
        <Input
          id="q"
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="Nosaukums vai apraksts"
        />
      </div>

      {showStatus ? (
        <div className="grid gap-1.5">
          <Label htmlFor="status">Statuss</Label>
          <Select name="status" defaultValue={params.get("status") || ALL_VALUE}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Visi statusi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Visi statusi</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="category">Kategorija</Label>
        <Select name="category" defaultValue={params.get("category") || ALL_VALUE}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Visas kategorijas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Visas kategorijas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {clients && clients.length > 0 ? (
        <div className="grid gap-1.5">
          <Label htmlFor="client">Klients</Label>
          <Select name="client" defaultValue={params.get("client") || ALL_VALUE}>
            <SelectTrigger id="client">
              <SelectValue placeholder="Visi klienti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Visi klienti</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {employees ? (
        <div className="grid gap-1.5">
          <Label htmlFor="employee">Darbinieki</Label>
          <input type="hidden" name="employee" value={employeeIds.join(",")} />
          <MultiSelect
            id="employee"
            options={employees.map((e) => ({ value: e.id, label: e.name }))}
            value={employeeIds}
            onChange={setEmployeeIds}
            onClose={() => {
              // Apply once the dropdown closes, not on every tick.
              if (employeeIds.join(",") !== employeeParam && formRef.current) {
                apply(formRef.current);
              }
            }}
            placeholder="Visi darbinieki"
            allLabel="Visi darbinieki"
            searchPlaceholder="Meklēt darbinieku..."
          />
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="from">No datuma</Label>
        <Input id="from" name="from" type="date" defaultValue={params.get("from") ?? ""} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="to">Līdz datumam</Label>
        <Input id="to" name="to" type="date" defaultValue={params.get("to") ?? ""} />
      </div>

      <div className="flex items-end gap-2">
        <Button type="submit" className="flex-1">
          Filtrēt
        </Button>
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              startNavigationLoading(pathname);
              router.push(pathname);
            }}
          >
            Notīrīt
          </Button>
        ) : null}
      </div>
    </form>
  );
}
