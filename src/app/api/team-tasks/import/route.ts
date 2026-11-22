import { NextResponse, type NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { getValidatedSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isTeamTasksEnabled } from "@/lib/team-tasks-server";
import { hasFill, parseReportSheet, type GridCell } from "@/lib/team-tasks-import";
import { normalizeClientName } from "@/lib/client-name";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

export interface RegistryImportPreview {
  sheetNames: string[];
  sheet: string;
  columns: { name: string; existingId: string | null }[];
  rows: { name: string; clientId: string | null; clientName: string | null; needed: boolean[] }[];
}

function sheetToGrid(sheet: XLSX.WorkSheet): GridCell[][] {
  const ref = sheet["!ref"];
  if (!ref) return [];
  const range = XLSX.utils.decode_range(ref);
  const lastRow = Math.min(range.e.r, range.s.r + 1500);
  const lastCol = Math.min(range.e.c, range.s.c + 80);
  const grid: GridCell[][] = [];
  for (let r = range.s.r; r <= lastRow; r++) {
    const row: GridCell[] = [];
    for (let c = range.s.c; c <= lastCol; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })] as XLSX.CellObject | undefined;
      row.push({
        text: cell ? String(cell.w ?? cell.v ?? "") : "",
        filled: cell ? hasFill(cell.s) : false,
      });
    }
    grid.push(row);
  }
  return grid;
}

export async function POST(req: NextRequest) {
  const session = await getValidatedSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Nav atļauts." }, { status: 401 });
  }
  if (!(await isTeamTasksEnabled(session.organizationId))) {
    return NextResponse.json({ error: "Modulis nav ieslēgts." }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Neizdevās nolasīt failu." }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fails nav pievienots." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Fails ir par lielu (maks. 5 MB)." }, { status: 400 });

  let workbook: XLSX.WorkBook;
  try {
    // cellStyles: read fills (grey = not needed); sheetStubs: keep empty styled cells.
    workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), {
      type: "buffer",
      cellStyles: true,
      sheetStubs: true,
    });
  } catch {
    return NextResponse.json({ error: "Neizdevās nolasīt Excel failu." }, { status: 400 });
  }

  const requested = formData.get("sheet");
  // Monthly tabs are added at the end, so the newest month is the last tab.
  const sheetName =
    typeof requested === "string" && workbook.SheetNames.includes(requested)
      ? requested
      : workbook.SheetNames[workbook.SheetNames.length - 1];

  const parsed = parseReportSheet(sheetToGrid(workbook.Sheets[sheetName]));
  if (!parsed) {
    return NextResponse.json(
      {
        error: "Šajā lapā neatradām tabulu: vajag rindu ar atskaišu nosaukumiem un klientus pirmajā kolonnā.",
        sheetNames: workbook.SheetNames,
        sheet: sheetName,
      },
      { status: 422 },
    );
  }

  const [clients, aliases, reportTypes] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: session.organizationId },
      select: { id: true, name: true },
    }),
    prisma.clientAlias.findMany({
      where: { organizationId: session.organizationId },
      select: { normalized: true, clientId: true },
    }),
    prisma.reportType.findMany({
      where: { organizationId: session.organizationId, ownerUserId: null },
      select: { id: true, name: true },
    }),
  ]);

  const clientByKey = new Map<string, { id: string; name: string }>();
  for (const c of clients) clientByKey.set(normalizeClientName(c.name), c);
  const clientById = new Map(clients.map((c) => [c.id, c]));
  for (const a of aliases) {
    const c = clientById.get(a.clientId);
    if (c && !clientByKey.has(a.normalized)) clientByKey.set(a.normalized, c);
  }

  const preview: RegistryImportPreview = {
    sheetNames: workbook.SheetNames,
    sheet: sheetName,
    columns: parsed.columns.map((name) => ({
      name,
      existingId: reportTypes.find((rt) => rt.name.toLowerCase() === name.toLowerCase())?.id ?? null,
    })),
    rows: parsed.rows.map((row) => {
      const match = clientByKey.get(normalizeClientName(row.name));
      return { name: row.name, clientId: match?.id ?? null, clientName: match?.name ?? null, needed: row.needed };
    }),
  };
  return NextResponse.json(preview);
}
