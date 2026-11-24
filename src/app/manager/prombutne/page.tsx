import { requireUser } from "@/lib/auth";
import { AbsencePage } from "@/components/team-tasks/absence-page";

export const dynamic = "force-dynamic";

export default async function ManagerAbsencePage({ searchParams }: { searchParams: { m?: string } }) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  return <AbsencePage session={session} month={searchParams.m} basePath="/manager/prombutne" />;
}
