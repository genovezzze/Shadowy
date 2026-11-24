import { requireUser } from "@/lib/auth";
import { getProcessInsights, resolveInsightRange } from "@/lib/process-insights-data";
import { ProcessInsightsView } from "@/components/insights/process-insights-view";

export default async function AdminInsightsPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string; view?: string };
}) {
  const session = await requireUser(["ADMIN"]);
  const range = resolveInsightRange(searchParams);
  const insights = await getProcessInsights({
    organizationId: session.organizationId,
    range,
  });

  return <ProcessInsightsView insights={insights} period={range.key} from={range.from} to={range.to} view={searchParams?.view} entriesHref="/admin/entries" />;
}
