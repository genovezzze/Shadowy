import { requireUser } from "@/lib/auth";
import { getProcessInsights, resolveInsightPeriod } from "@/lib/process-insights-data";
import { ProcessInsightsView } from "@/components/insights/process-insights-view";

export default async function AdminInsightsPage({
  searchParams,
}: {
  searchParams: { period?: string; view?: string };
}) {
  const session = await requireUser(["ADMIN"]);
  const period = resolveInsightPeriod(searchParams?.period);
  const insights = await getProcessInsights({
    organizationId: session.organizationId,
    period,
  });

  return <ProcessInsightsView insights={insights} period={period} view={searchParams?.view} entriesHref="/admin/entries" />;
}
