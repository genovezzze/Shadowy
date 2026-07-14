import { Card, CardContent } from "@/components/ui/card";

export interface MatrixAxis {
  key: string;
  label: string;
}

interface CategoryMatrixProps {
  title: string;
  description: string;
  rows: MatrixAxis[];
  cols: MatrixAxis[];
  minutes: Record<string, Record<string, number>>;
}

function cellClasses(minutes: number, rowMax: number): string {
  if (!minutes || !rowMax) return "";
  const r = minutes / rowMax;
  if (r < 0.25) return "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300";
  if (r < 0.5) return "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200";
  if (r < 0.75) return "bg-teal-200 text-teal-900 dark:bg-teal-800/50 dark:text-teal-100";
  return "bg-teal-300 text-teal-950 dark:bg-teal-700/60 dark:text-teal-50";
}

function fmtHours(minutes: number): string {
  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

export function CategoryMatrix({ title, description, rows, cols, minutes }: CategoryMatrixProps) {
  if (rows.length === 0 || cols.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold mb-1">{title}</h2>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-card px-2 py-2 text-left text-xs font-medium text-muted-foreground">
                  Kategorija
                </th>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    className="px-2 py-2 text-center text-xs font-medium text-muted-foreground min-w-[64px]"
                  >
                    <span className="mx-auto block max-w-[76px] truncate" title={c.label}>
                      {c.label}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Kopā</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const rowVals = cols.map((c) => minutes[r.key]?.[c.key] ?? 0);
                const rowMax = Math.max(...rowVals, 1);
                const rowTotal = rowVals.reduce((s, v) => s + v, 0);
                if (rowTotal === 0) return null;
                return (
                  <tr key={r.key} className="transition-colors hover:bg-muted/20">
                    <td
                      className="sticky left-0 z-10 truncate bg-card px-2 py-2 font-medium max-w-[120px]"
                      title={r.label}
                    >
                      {r.label}
                    </td>
                    {cols.map((c) => {
                      const min = minutes[r.key]?.[c.key] ?? 0;
                      const cls = cellClasses(min, rowMax);
                      return (
                        <td key={c.key} className="px-2 py-2 text-center">
                          {min > 0 ? (
                            <span
                              className={`inline-block rounded px-1.5 py-0.5 text-xs tabular-nums font-medium ${cls}`}
                            >
                              {fmtHours(min)}
                            </span>
                          ) : (
                            <span className="select-none text-xs text-muted-foreground/25">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums">
                      {fmtHours(rowTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {(["bg-teal-50", "bg-teal-100", "bg-teal-200", "bg-teal-300"] as const).map((c, i) => (
              <div key={i} className={`h-2.5 w-2.5 rounded-sm ${c} dark:opacity-60`} />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">
            maz → daudz (relatīvi katrai kategorijai)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
