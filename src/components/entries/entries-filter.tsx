"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { statusLabel } from "@/lib/i18n";
import type { EntryStatus } from "@prisma/client";

const STATUSES: EntryStatus[] = ["PENDING", "APPROVED", "REJECTED", "RETURNED"];

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
      if (v) next.set(key, v);
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
          <NativeSelect id="status" name="status" defaultValue={params.get("status") ?? ""}>
            <option value="">Visi statusi</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="category">Kategorija</Label>
        <NativeSelect id="category" name="category" defaultValue={params.get("category") ?? ""}>
          <option value="">Visas kategorijas</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect>
      </div>

      {employees ? (
        <div className="grid gap-1.5">
          <Label htmlFor="employee">Darbinieks</Label>
          <NativeSelect id="employee" name="employee" defaultValue={params.get("employee") ?? ""}>
            <option value="">Visi darbinieki</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </NativeSelect>
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
