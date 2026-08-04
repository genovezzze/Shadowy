"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { confirmImport } from "./actions";
import { Upload, Check, AlertTriangle, FileSpreadsheet, ChevronDown } from "lucide-react";
import type { ImportMatch } from "@/app/api/clients/import/route";

interface OrgEmployee { id: string; name: string }
interface OrgClient { id: string; name: string }

interface ApiResponse {
  matches: ImportMatch[];
  clients: OrgClient[];
  employees: OrgEmployee[];
}

export function ImportClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ApiResponse | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Record<number, string>>>({});
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPreview(null);
    setOverrides({});
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/clients/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Kļūda."); return; }
      setPreview(json as ApiResponse);
    } catch {
      setError("Neizdevās augšupielādēt failu.");
    } finally {
      setUploading(false);
    }
  }

  function setOverride(clientName: string, empIndex: number, employeeId: string) {
    setOverrides((prev) => ({
      ...prev,
      [clientName]: { ...(prev[clientName] ?? {}), [empIndex]: employeeId },
    }));
  }

  function handleConfirm() {
    if (!preview) return;
    const assignments: { clientId: string | null; clientName?: string; employeeIds: string[] }[] = [];

    for (const match of preview.matches) {
      const empIds: string[] = [];
      match.employees.forEach((emp, i) => {
        const override = overrides[match.clientName]?.[i];
        const id = override ?? emp.employeeId;
        if (id && id !== "__skip__") empIds.push(id);
      });
      // Include even unmatched clients - they will be created by the action
      assignments.push({
        clientId: match.clientId ?? null,
        clientName: match.clientId ? undefined : match.clientName,
        employeeIds: empIds,
      });
    }

    if (assignments.length === 0) {
      setError("Nav sarakstu, ko saglabāt.");
      return;
    }

    startTransition(async () => {
      const result = await confirmImport({ assignments });
      if (result.ok) {
        setDone(true);
        setTimeout(() => router.push("/manager/clients"), 1500);
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <Check className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-sm font-medium">Saraksti saglabāti! Novirzīšana...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Upload zone */}
      <div
        className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-10 cursor-pointer hover:border-foreground/30 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Noklikšķini vai ievelc Excel failu</p>
          <p className="text-xs text-muted-foreground mt-1">
            Kolonna &ldquo;Uzņēmums&rdquo; + kolonna &ldquo;Grāmatvedis&rdquo; - tiek atpazīts automātiski
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={uploading}>
          <Upload className="h-4 w-4" />
          {uploading ? "Apstrādā..." : "Izvēlēties failu"}
        </Button>
      </div>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Preview table */}
      {preview && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">
            Priekšskatījums - {preview.matches.length} klienti
          </h2>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-1/3">Klients</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Darbinieki no faila</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {preview.matches.map((match) => (
                  <tr key={match.clientName} className={!match.clientId ? "bg-amber-500/5" : ""}>
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium">{match.clientName}</div>
                      {!match.clientId && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-500">
                          <AlertTriangle className="h-3 w-3" /> Tiks izveidots
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {match.employees.map((emp, i) => {
                          const override = overrides[match.clientName]?.[i];
                          const currentId = override ?? emp.employeeId;
                          const matched = currentId && currentId !== "__skip__";
                          return (
                            <div key={i} className="flex items-center gap-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${matched ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                {matched
                                  ? (preview.employees.find((e) => e.id === currentId)?.name ?? emp.rawName)
                                  : emp.rawName}
                              </span>
                              {/* Manual override dropdown */}
                              <div className="relative">
                                <select
                                  value={currentId ?? "__skip__"}
                                  onChange={(e) => setOverride(match.clientName, i, e.target.value)}
                                  className="appearance-none bg-transparent text-[10px] text-muted-foreground cursor-pointer pr-3 border-0 focus:outline-none"
                                  title="Labot atbilstību"
                                >
                                  <option value="__skip__">- izlaist</option>
                                  {preview.employees.map((e) => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-0 top-0.5 h-2.5 w-2.5 text-muted-foreground pointer-events-none" />
                              </div>
                            </div>
                          );
                        })}
                        {match.employees.length === 0 && (
                          <span className="text-xs text-muted-foreground">Nav darbinieku</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleConfirm} disabled={pending}>
              {pending ? "Saglabā..." : "Apstiprināt un saglabāt"}
            </Button>
            <p className="text-xs text-muted-foreground">
              <span className="text-amber-500">Dzeltens</span> - jauns klients, tiks izveidots automātiski.{" "}
              <span className="text-emerald-500">Zaļš</span> - atrasts sistēmā.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
