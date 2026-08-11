import { NextResponse, type NextRequest } from "next/server";
import { getValidatedSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildEntryWhere, type EntrySearchParams } from "@/lib/entry-filter";
import { toCsv } from "@/lib/csv";
import { statusLabel } from "@/lib/i18n";
import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";

export async function GET(req: NextRequest) {
  const session = await getValidatedSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const url = new URL(req.url);
  const sp = Object.fromEntries(url.searchParams.entries()) as EntrySearchParams;

  // Role scope is applied LAST so it cannot be overridden by query filters.
  const scope =
    session.role === "ADMIN"
      ? { organizationId: session.organizationId }
      : session.role === "MANAGER"
        ? { organizationId: session.organizationId, managerId: session.userId }
        : { organizationId: session.organizationId, employeeId: session.userId };

  const where = { ...buildEntryWhere(sp), ...scope };

  const entries = await prisma.invisibleWorkEntry.findMany({
    where,
    orderBy: { workDate: "desc" },
    include: {
      employee: true,
      manager: true,
      helpedUser: { select: { name: true } },
    },
  });

  const header = [
    "Datums",
    "Nosaukums",
    "Kategorija",
    "Palīdzība kolēģim",
    "Kam palīdzēts",
    "Klients / uzņēmums",
    "Apraksts",
    "Ilgums (min)",
    "Statuss",
    "Darbinieks",
    "Vadītājs",
    "Vadītāja komentārs",
    "Izveidots",
  ];

  const rows = entries.map((e) => [
    e.workDate.toISOString().slice(0, 10),
    e.title,
    // Entries store the canonical key now - export the Latvian label so the
    // CSV stays readable, and stays consistent with older label-stored rows.
    categoryLabel(normalizeCategoryKey(e.category)),
    e.helpedColleague ? "Jā" : "",
    e.helpedUser?.name ?? "",
    e.clientName ?? "",
    e.description,
    e.durationMinutes,
    statusLabel[e.status],
    e.employee.name,
    e.manager?.name ?? "",
    e.managerComment ?? "",
    e.createdAt.toISOString().slice(0, 10),
  ]);

  const csv = toCsv([header, ...rows]);
  const filename = `shadowy-ieraksti-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
