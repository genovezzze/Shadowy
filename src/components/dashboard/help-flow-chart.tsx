import { formatDurationLV } from "@/lib/utils";
import type { HelpPair } from "@/lib/work-nature";

function firstName(name: string): string {
  return name.split(" ")[0];
}
function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/**
 * A directed flow diagram of who helps whom: helpers on the left, recipients on
 * the right, each link's thickness scaled to time spent. Framed as mutual aid,
 * not a ranking of people.
 */
export function HelpFlowChart({ pairs }: { pairs: HelpPair[] }) {
  if (pairs.length === 0) return null;

  // Distinct nodes per side, weighted by total minutes through them.
  const leftMap = new Map<string, number>();
  const rightMap = new Map<string, number>();
  for (const p of pairs) {
    leftMap.set(p.from, (leftMap.get(p.from) ?? 0) + p.minutes);
    rightMap.set(p.to, (rightMap.get(p.to) ?? 0) + p.minutes);
  }
  const left = [...leftMap.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  const right = [...rightMap.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);

  const W = 680;
  const rowH = 56;
  const padY = 34;
  const rows = Math.max(left.length, right.length);
  const H = padY * 2 + Math.max(rows - 1, 1) * rowH;

  const leftX = 150;   // right edge of left nodes (circle centre)
  const rightX = W - 150;
  const midX = W / 2;

  const yFor = (i: number, count: number) =>
    count <= 1 ? H / 2 : padY + (i * (H - padY * 2)) / (count - 1);

  const leftY = new Map(left.map((n, i) => [n, yFor(i, left.length)]));
  const rightY = new Map(right.map((n, i) => [n, yFor(i, right.length)]));
  const maxMinutes = Math.max(...pairs.map((p) => p.minutes), 1);

  return (
    <div className="border-t border-border/40 bg-muted/10 px-4 py-4">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        Kas kuram palīdz
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="xMidYMid meet"
        className="max-w-full"
        role="img"
        aria-label="Diagramma: kurš darbinieks kuram palīdz"
      >
        {/* Links */}
        {pairs.map((p, i) => {
          const y1 = leftY.get(p.from)!;
          const y2 = rightY.get(p.to)!;
          const sw = 1.5 + (p.minutes / maxMinutes) * 12;
          const op = 0.2 + (p.minutes / maxMinutes) * 0.55;
          return (
            <path
              key={i}
              d={`M ${leftX + 32} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${rightX - 32} ${y2}`}
              fill="none"
              className="stroke-emerald-500"
              strokeWidth={sw}
              strokeOpacity={op}
              strokeLinecap="round"
            >
              <title>{`${p.from} → ${p.to}: ${p.count}×, ${formatDurationLV(p.minutes)}`}</title>
            </path>
          );
        })}

        {/* Left nodes (helpers) */}
        {left.map((name) => {
          const y = leftY.get(name)!;
          return (
            <g key={`l-${name}`}>
              <circle cx={leftX} cy={y} r={17} className="fill-emerald-500/15 stroke-emerald-500/50" strokeWidth={1.5} />
              <text x={leftX} y={y} dy="0.35em" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" fontSize="11" fontWeight="600">
                {initials(name)}
              </text>
              <text x={leftX - 26} y={y} dy="0.35em" textAnchor="end" className="fill-foreground" fontSize="13" fontWeight="500">
                {firstName(name)}
              </text>
            </g>
          );
        })}

        {/* Right nodes (recipients) */}
        {right.map((name) => {
          const y = rightY.get(name)!;
          const total = rightMap.get(name)!;
          return (
            <g key={`r-${name}`}>
              <circle cx={rightX} cy={y} r={17} className="fill-muted stroke-border" strokeWidth={1.5} />
              <text x={rightX} y={y} dy="0.35em" textAnchor="middle" className="fill-muted-foreground" fontSize="11" fontWeight="600">
                {initials(name)}
              </text>
              <text x={rightX + 26} y={y - 5} textAnchor="start" className="fill-foreground" fontSize="13" fontWeight="500">
                {firstName(name)}
              </text>
              <text x={rightX + 26} y={y + 11} textAnchor="start" className="fill-muted-foreground" fontSize="10.5">
                {formatDurationLV(total)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
