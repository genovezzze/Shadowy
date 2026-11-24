import { requireUser } from "@/lib/auth";
import { AbsencePage } from "@/components/team-tasks/absence-page";

export const dynamic = "force-dynamic";

export default async function EmployeeAbsencePage({ searchParams }: { searchParams: { m?: string } }) {
  const session = await requireUser(["EMPLOYEE"]);
  return <AbsencePage session={session} month={searchParams.m} basePath="/employee/prombutne" />;
}
