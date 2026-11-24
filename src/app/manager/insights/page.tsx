import { requireUser } from "@/lib/auth";
import { getProcessInsights, resolveInsightRange } from "@/lib/process-insights-data";
import { ProcessInsightsView } from "@/components/insights/process-insights-view";

export default async function ManagerInsightsPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string; view?: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const range = resolveInsightRange(searchParams);
  const insights = await getProcessInsights({
    organizationId: session.organizationId,
    managerId: session.role === "MANAGER" ? session.userId : undefined,
    range,
  });

  return <ProcessInsightsView insights={insights} period={range.key} from={range.from} to={range.to} view={searchParams?.view} entriesHref="/manager/entries" />;
}
