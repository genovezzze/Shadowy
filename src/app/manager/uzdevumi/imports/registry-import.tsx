"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { FileSpreadsheet, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { METRIC_SURFACE } from "@/components/dashboard/apple";
import type { RegistryImportPreview } from "@/app/api/team-tasks/import/route";
import { confirmRegistryImport } from "./actions";

const selectClass =
  "h-9 rounded-lg border border-black/[0.1] bg-white px-2 text-[14px] dark:border-white/[0.12] dark:bg-white/[0.04]";

export function RegistryImport({ people }: { people: { id: string; name: string }[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [preview, setPreview] = useState<RegistryImportPreview | null>(null);
  const [needed, setNeeded] = useState<boolean[][]>([]);
  const [included, setIncluded] = useState<boolean[]>([]);
  const [responsible, setResponsible] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  async function load(f: File, sheet?: string) {
    setError(null);
    setDone(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      if (sheet) fd.append("sheet", sheet);
      const res = await fetch("/api/team-tasks/import", { method: "POST", body: fd });
      const json = await res.json();
      if (json.sheetNames) setSheetNames(json.sheetNames);
      if (!res.ok) {
        setPreview(null);
        setError(json.error ?? "Kļūda.");
        return;
      }
      const p = json as RegistryImportPreview;
      setPreview(p);
      setNeeded(p.rows.map((r) => [...r.needed]));
      setIncluded(p.rows.map(() => true));
    } catch {
      setError("Neizdevās augšupielādēt failu.");
    } finally {
      setUploading(false);
    }
  }

  function toggleCell(r: number, c: number) {
    setNeeded((prev) => prev.map((row, i) => (i === r ? row.map((v, j) => (j === c ? !v : v)) : row)));
  }

  function confirm() {
    if (!preview) return;
    const rows = preview.rows
      .map((row, i) => ({ name: row.name, clientId: row.clientId, needed: needed[i] }))
      .filter((_, i) => included[i]);
    if (rows.length === 0) {
      setError("Atzīmējiet vismaz vienu klientu.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await confirmRegistryImport({
        columns: preview.columns.map((c) => c.name),
        rows,
        responsibleUserId: responsible || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(
        `Saglabāts: ${result.clients} klienti (${result.created} jauni), ${result.columns} jaunas kolonnas. Šī mēneša uzdevumi ir atjaunināti.`,
      );
      setPreview(null);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  const newClients = preview ? preview.rows.filter((r, i) => included[i] && !r.clientId).length : 0;

  return (
    <div className="space-y-5">
      <section className={cn(METRIC_SURFACE, "p-5")}>
        <div className="flex flex-wrap items-end gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFile(f);
              setSheetNames([]);
              load(f);
            }}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading || pending} className="gap-1.5">
            <Upload className="h-4 w-4" />
            {uploading ? "Nolasa..." : file ? "Izvēlēties citu failu" : "Izvēlēties Excel failu"}
          </Button>
          {file && (
            <span className="flex items-center gap-1.5 pb-2 text-[13px] text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              {file.name}
            </span>
          )}
          {file && sheetNames.length > 1 && (
            <label className="grid gap-1 text-[12px] text-muted-foreground">
              Lapa (mēnesis)
              <select
                value={preview?.sheet ?? ""}
                onChange={(e) => load(file, e.target.value)}
                className={selectClass}
                disabled={uploading}
              >
                {sheetNames.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">
          Pēc noklusējuma tiek ņemta pēdējā lapa (jaunākais mēnesis). Atzīmes šūnās (+, datumi) netiek importētas - tikai tas,
          kuras atskaites katram klientam vajadzīgas.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">{error}</div>
      )}
      {done && (
        <div className="rounded-xl border border-black/[0.08] bg-black/[0.03] px-4 py-3 text-sm dark:border-white/[0.1] dark:bg-white/[0.04]">
          {done}{" "}
          <Link href="/manager/clients/atskaites" className="font-medium underline underline-offset-4">
            Atvērt atskaites
          </Link>
        </div>
      )}

      {preview && (
        <section className={cn(METRIC_SURFACE, "overflow-hidden")}>
          <div className="flex flex-wrap items-end gap-3 border-b border-black/[0.07] px-4 py-3 dark:border-white/[0.07]">
            <div className="mr-auto">
              <div className="font-display text-[15px] font-medium">Pārbaudiet pirms saglabāšanas</div>
              <div className="text-[12px] text-muted-foreground">
                {preview.rows.length} klienti, {preview.columns.length} kolonnas
                {newClients > 0 && ` · ${newClients} jauni klienti tiks izveidoti`}. Klikšķis uz šūnas pārslēdz.
              </div>
            </div>
            <label className="grid gap-1 text-[12px] text-muted-foreground">
              Atbildīgais par šiem klientiem
              <select value={responsible} onChange={(e) => setResponsible(e.target.value)} className={selectClass}>
                <option value="">Nemainīt</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={confirm} disabled={pending}>
              {pending ? "Saglabā..." : "Saglabāt reģistrā"}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 min-w-[200px] border-b border-r border-black/[0.08] bg-white px-3 py-2 text-left font-medium text-muted-foreground dark:border-white/[0.08] dark:bg-card">
                    Klients
                  </th>
                  {preview.columns.map((col) => (
                    <th
                      key={col.name}
                      className="min-w-[60px] border-b border-r border-black/[0.08] px-1.5 py-2 text-center text-[12px] font-medium leading-tight text-muted-foreground dark:border-white/[0.08]"
                    >
                      {col.name}
                      {!col.existingId && <span className="block text-[10px] font-normal">jauna</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, r) => (
                  <tr key={row.name} className={cn(!included[r] && "opacity-40")}>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-b border-r border-black/[0.08] bg-white px-3 py-1.5 text-left font-medium dark:border-white/[0.08] dark:bg-card"
                    >
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={included[r]}
                          onChange={() => setIncluded((prev) => prev.map((v, i) => (i === r ? !v : v)))}
                        />
                        <span className="min-w-0">
                          <span className="block truncate">{row.name}</span>
                          <span className="block text-[11px] font-normal text-muted-foreground">
                            {row.clientId
                              ? row.clientName !== row.name
                                ? `= ${row.clientName}`
                                : "esošs klients"
                              : "jauns klients"}
                          </span>
                        </span>
                      </label>
                    </th>
                    {preview.columns.map((col, c) => (
                      <td key={col.name} className="border-b border-r border-black/[0.08] p-0 dark:border-white/[0.08]">
                        <button
                          type="button"
                          disabled={!included[r]}
                          onClick={() => toggleCell(r, c)}
                          aria-pressed={needed[r]?.[c]}
                          aria-label={`${row.name} ${col.name}: ${needed[r]?.[c] ? "vajag" : "nevajag"}`}
                          className={cn(
                            "block h-9 w-full",
                            needed[r]?.[c] ? "bg-white dark:bg-transparent" : "bg-black/[0.12] dark:bg-white/[0.12]",
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
