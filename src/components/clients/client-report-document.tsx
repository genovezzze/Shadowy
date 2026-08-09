import { cn, formatDurationLV } from "@/lib/utils";
import { formatSavingRangeLV } from "@/lib/insights-format";
import type { ProcessRecommendation } from "@/lib/process-insights";

export type ReportMonth = { label: string; minutes: number };
export type ReportCategory = { key: string; label: string; minutes: number; sharePercent: number };
export type ReportEmployee = { id: string; name: string; minutes: number; count: number; topArea: string };
export type ReportCause = { label: string; minutes: number; count: number };
export type ReportWorkExample = { id: string; title: string; date: string; minutes: number; employee: string };
export type ReportWorkGroup = {
  key: string;
  label: string;
  minutes: number;
  count: number;
  employeeCount: number;
  examples: ReportWorkExample[];
};

function Rule({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} aria-hidden />;
}

/**
 * A restrained share indicator: no colour, only weight. Drawn with borders
 * rather than fills, so it still prints when the browser is set to leave out
 * background graphics — the usual setting for a document.
 */
function ShareRule({ value, max }: { value: number; max: number }) {
  return (
    <span className="block w-full border-t-4 border-border" aria-hidden>
      <span
        className="-mt-1 block border-t-4 border-foreground/70"
        style={{ width: `${Math.max(2, (value / max) * 100)}%` }}
      />
    </span>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
        <span className="mr-3 tabular-nums text-muted-foreground">{number}</span>
        {title}
      </h2>
      <Rule className="mt-2 bg-foreground/40" />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TableHead({ columns }: { columns: { label: string; align?: "left" | "right" }[] }) {
  return (
    <thead>
      <tr className="border-b border-foreground/25">
        {columns.map((column) => (
          <th
            key={column.label}
            scope="col"
            className={cn(
              "py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
              column.align === "right" ? "text-right" : "text-left",
            )}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function ClientReportDocument({
  organizationName,
  clientName,
  documentNumber,
  periodLabel,
  generatedAt,
  totalMinutes,
  entryCount,
  includedLabel,
  additionalLabel,
  additionalValueLabel,
  months,
  categories,
  employees,
  workGroups,
  causes,
  recommendations,
}: {
  organizationName: string;
  clientName: string;
  documentNumber: string;
  periodLabel: string;
  generatedAt: string;
  totalMinutes: number;
  entryCount: number;
  includedLabel: string;
  additionalLabel: string;
  additionalValueLabel: string;
  months: ReportMonth[];
  categories: ReportCategory[];
  employees: ReportEmployee[];
  workGroups: ReportWorkGroup[];
  causes: ReportCause[];
  recommendations: ProcessRecommendation[];
}) {
  const maxMonthMinutes = Math.max(...months.map((month) => month.minutes), 1);
  const maxCategoryMinutes = categories[0]?.minutes ?? 1;
  const maxEmployeeMinutes = employees[0]?.minutes ?? 1;
  const maxCauseMinutes = causes[0]?.minutes ?? 1;

  return (
    <article className="report-document rounded-xl border border-border bg-card p-6 text-card-foreground sm:p-10 print:rounded-none print:border-0">
      <div className="report-page">
        {/* Repeating top and bottom margins for every printed sheet. */}
        <div className="report-page-head hidden">
          <div className="report-page-spacer" aria-hidden />
        </div>
        <div className="report-page-foot hidden">
          <div className="report-page-spacer" aria-hidden />
        </div>

        <div className="report-page-body">
      <header className="report-section">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em]">{organizationName}</div>
            <h1 className="mt-4 font-display text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl">
              Sadarbības pārskats
            </h1>
            <div className="mt-1.5 font-mono text-xs text-muted-foreground">Nr. {documentNumber}</div>
          </div>

          <table className="shrink-0 text-xs">
            <tbody>
              <tr>
                <th scope="row" className="py-0.5 pr-4 text-left font-normal uppercase tracking-wide text-muted-foreground">
                  Klients
                </th>
                <td className="py-0.5 text-right font-medium">{clientName}</td>
              </tr>
              <tr>
                <th scope="row" className="py-0.5 pr-4 text-left font-normal uppercase tracking-wide text-muted-foreground">
                  Periods
                </th>
                <td className="py-0.5 text-right font-medium tabular-nums">{periodLabel}</td>
              </tr>
              <tr>
                <th scope="row" className="py-0.5 pr-4 text-left font-normal uppercase tracking-wide text-muted-foreground">
                  Sagatavots
                </th>
                <td className="py-0.5 text-right font-medium tabular-nums">{generatedAt}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Rule className="mt-5 h-0.5 bg-foreground/70" />
        <Rule className="mt-0.5 bg-foreground/40" />
      </header>

      <p className="mt-6 max-w-3xl text-sm leading-6">
        Pārskatā apkopots komandas darbs, kas veikts saistībā ar klientu norādītajā periodā: ieguldītais laiks,
        darba jomas, iesaistītie darbinieki un situācijas, kas atkārtojas. Iekļauti tikai apstiprinātie darba
        ieraksti.
      </p>

      <Section number="1." title="Kopsavilkums">
        <table className="w-full border-collapse text-sm">
          <TableHead columns={[{ label: "Rādītājs" }, { label: "Vērtība", align: "right" }]} />
          <tbody>
            {[
              { label: "Komandas ieguldījums", value: formatDurationLV(totalMinutes), note: `${entryCount} darba situācijas` },
              { label: "Sadarbības apjoms", value: includedLabel, note: "Norādītais mēneša apjoms" },
              { label: "Papildu ieguldījums", value: additionalLabel, note: "Laiks virs mēneša apjoma" },
              { label: "Papildu darba vērtība", value: additionalValueLabel, note: "Aptuvens aprēķins pēc komandas izmaksām" },
            ].map((row) => (
              <tr key={row.label} className="report-section border-b border-border last:border-0">
                <td className="py-2.5 pr-4">
                  <div className="font-medium">{row.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{row.note}</div>
                </td>
                <td className="py-2.5 text-right align-top font-semibold tabular-nums">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section number="2." title="Darba apjoms pa mēnešiem">
        <table className="w-full border-collapse text-sm">
          <TableHead
            columns={[{ label: "Mēnesis" }, { label: "Sadalījums" }, { label: "Laiks", align: "right" }]}
          />
          <tbody>
            {months.map((month) => (
              <tr key={month.label} className="report-section border-b border-border last:border-0">
                <td className="w-24 py-2 pr-4 capitalize">{month.label}</td>
                <td className="py-2 pr-4">
                  <ShareRule value={month.minutes} max={maxMonthMinutes} />
                </td>
                <td className="w-28 py-2 text-right tabular-nums">
                  {month.minutes > 0 ? formatDurationLV(month.minutes) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section number="3." title="Darba jomas">
        {categories.length ? (
          <table className="w-full border-collapse text-sm">
            <TableHead
              columns={[
                { label: "Joma" },
                { label: "Sadalījums" },
                { label: "Daļa", align: "right" },
                { label: "Laiks", align: "right" },
              ]}
            />
            <tbody>
              {categories.map((category) => (
                <tr key={category.key} className="report-section border-b border-border last:border-0">
                  <td className="py-2 pr-4">{category.label}</td>
                  <td className="hidden py-2 pr-4 sm:table-cell">
                    <ShareRule value={category.minutes} max={maxCategoryMinutes} />
                  </td>
                  <td className="w-16 py-2 text-right tabular-nums text-muted-foreground">{category.sharePercent}%</td>
                  <td className="w-28 py-2 text-right font-medium tabular-nums">{formatDurationLV(category.minutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground">Šajā periodā nav apstiprinātu darba ierakstu.</p>
        )}
      </Section>

      <Section number="4." title="Iesaistītie darbinieki">
        {employees.length ? (
          <table className="w-full border-collapse text-sm">
            <TableHead
              columns={[
                { label: "Darbinieks" },
                { label: "Galvenā joma" },
                { label: "Situācijas", align: "right" },
                { label: "Laiks", align: "right" },
              ]}
            />
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="report-section border-b border-border last:border-0">
                  <td className="py-2 pr-4 font-medium">
                    {employee.name}
                    <div className="mt-1 max-w-[10rem] sm:hidden">
                      <ShareRule value={employee.minutes} max={maxEmployeeMinutes} />
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">{employee.topArea}</td>
                  <td className="w-24 py-2 text-right tabular-nums">{employee.count}</td>
                  <td className="w-28 py-2 text-right font-medium tabular-nums">{formatDurationLV(employee.minutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground">Šajā periodā nav fiksētu darba situāciju.</p>
        )}
      </Section>

      <Section number="5." title="Veiktais darbs pa jomām">
        {workGroups.length ? (
          <div className="space-y-6">
            {workGroups.map((group) => (
              <div key={group.key} className="report-section">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-1.5">
                  <span className="font-medium">{group.label}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {group.count} situācijas · {group.employeeCount} darbinieki ·{" "}
                    <span className="font-semibold text-foreground">{formatDurationLV(group.minutes)}</span>
                  </span>
                </div>

                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {group.examples.map((example) => (
                      <tr key={example.id} className="border-b border-border last:border-0">
                        <td className="w-24 py-2 pr-4 align-top tabular-nums text-muted-foreground">{example.date}</td>
                        <td className="py-2 pr-4 align-top">{example.title}</td>
                        <td className="hidden py-2 pr-4 align-top text-muted-foreground sm:table-cell">
                          {example.employee}
                        </td>
                        <td className="w-24 py-2 text-right align-top tabular-nums">
                          {formatDurationLV(example.minutes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {group.count > group.examples.length ? (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Sarakstā parādītas {group.examples.length} apjomīgākās situācijas; kopā šajā jomā fiksētas{" "}
                    {group.count}.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Šajā periodā nav apstiprinātu darba ierakstu.</p>
        )}
      </Section>

      {causes.length ? (
        <Section number="6." title="Atkārtojošies iemesli">
          <table className="w-full border-collapse text-sm">
            <TableHead
              columns={[
                { label: "Iemesls" },
                { label: "Sadalījums" },
                { label: "Situācijas", align: "right" },
                { label: "Laiks", align: "right" },
              ]}
            />
            <tbody>
              {causes.map((cause) => (
                <tr key={cause.label} className="report-section border-b border-border last:border-0">
                  <td className="py-2 pr-4">{cause.label}</td>
                  <td className="hidden py-2 pr-4 sm:table-cell">
                    <ShareRule value={cause.minutes} max={maxCauseMinutes} />
                  </td>
                  <td className="w-24 py-2 text-right tabular-nums">{cause.count}</td>
                  <td className="w-28 py-2 text-right font-medium tabular-nums">{formatDurationLV(cause.minutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ) : null}

      <Section number={causes.length ? "7." : "6."} title="Priekšlikumi">
        {recommendations.length ? (
          <ol className="space-y-5">
            {recommendations.slice(0, 4).map((recommendation, index) => (
              <li key={recommendation.processKey} className="report-section">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-medium">
                    <span className="mr-2 tabular-nums text-muted-foreground">{index + 1}.</span>
                    {recommendation.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Iespējamais ietaupījums:{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatSavingRangeLV(recommendation.savingLowMinutes, recommendation.savingHighMinutes)}
                    </span>
                  </span>
                </div>
                <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">{recommendation.description}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Attiecas uz: {recommendation.processes.map((process) => process.label).join(", ")}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            Šajā periodā nav pietiekami daudz atkārtotu situāciju pamatotam priekšlikumam.
          </p>
        )}
      </Section>

      <footer className="report-section mt-8">
        <Rule className="bg-foreground/40" />
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          <span className="font-medium text-foreground">Piezīme par aprēķinu.</span> Pārskatā iekļauti tikai
          apstiprinātie darba ieraksti. Papildu ieguldījums ir laiks virs norādītā mēneša apjoma; naudas vērtība ir
          orientējoša un balstīta komandas stundas izmaksās. Pārskats nav rēķins un nerada automātiskas saistības.
        </p>
        <p className="mt-3 text-xs tabular-nums text-muted-foreground">
          Nr. {documentNumber} · {organizationName} · {clientName} · {periodLabel} · sagatavots {generatedAt}
        </p>
      </footer>
        </div>
      </div>
    </article>
  );
}
