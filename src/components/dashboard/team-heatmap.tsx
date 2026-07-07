interface HeatmapRow {
  id: string;
  name: string;
  weeks: boolean[];
}

interface TeamHeatmapProps {
  rows: HeatmapRow[];
  weekLabels: string[];
}

export function TeamHeatmap({ rows, weekLabels }: TeamHeatmapProps) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nav darbinieku.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="text-xs min-w-max">
        <thead>
          <tr>
            <th className="text-left pr-4 pb-2 font-normal text-muted-foreground w-28" />
            {weekLabels.map((label, i) => (
              <th key={i} className="text-center pb-2 font-normal text-muted-foreground px-0.5 w-7">
                {i === weekLabels.length - 1 ? <span className="font-semibold text-foreground">{label}</span> : label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="pr-4 py-0.5 text-sm truncate max-w-[112px]" title={row.name}>{row.name}</td>
              {row.weeks.map((active, i) => (
                <td key={i} className="text-center py-0.5 px-0.5">
                  <div
                    title={`${weekLabels[i]}: ${active ? "aktīvs" : "nav ierakstu"}`}
                    className={`inline-block h-5 w-5 rounded-sm ${active ? "bg-emerald-500/70" : "bg-muted"}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
