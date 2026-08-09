import { requireUser } from "@/lib/auth";
import { getProcessInsights, resolveInsightPeriod } from "@/lib/process-insights-data";
import { ProcessInsightsView } from "@/components/insights/process-insights-view";

export default async function ManagerInsightsPage({
  searchParams,
}: {
  searchParams: { period?: string; view?: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const period = resolveInsightPeriod(searchParams?.period);
  const insights = await getProcessInsights({
    organizationId: session.organizationId,
    managerId: session.role === "MANAGER" ? session.userId : undefined,
    period,
  });

  return <ProcessInsightsView insights={insights} period={period} view={searchParams?.view} entriesHref="/manager/entries" />;
}
