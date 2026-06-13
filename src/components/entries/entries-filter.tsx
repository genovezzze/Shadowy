"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { statusLabel } from "@/lib/i18n";
import type { EntryStatus } from "@prisma/client";

const STATUSES: EntryStatus[] = ["PENDING", "APPROVED", "REJECTED", "RETURNED"];

// Radix Select doesn't allow an empty string as an item value, so use a sentinel
// for the "no filter" option and strip it back out when applying the filters.
const ALL_VALUE = "__all__";

interface EntriesFilterProps {
  categories: string[];
  employees?: { id: string; name: string }[];
  showStatus?: boolean;
}

export function EntriesFilter({
  categories,
  employees,
  showStatus = true,
}: EntriesFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const hasFilters = ["q", "status", "category", "employee", "from", "to"].some(
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
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    apply(e.currentTarget);
  }

  return (
    <form
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
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {employees ? (
        <div className="grid gap-1.5">
          <Label htmlFor="employee">Darbinieks</Label>
          <Select name="employee" defaultValue={params.get("employee") || ALL_VALUE}>
            <SelectTrigger id="employee">
              <SelectValue placeholder="Visi darbinieki" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Visi darbinieki</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            onClick={() => router.push(pathname)}
          >
            Notīrīt
          </Button>
        ) : null}
      </div>
    </form>
  );
}
