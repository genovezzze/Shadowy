import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export interface ImportMatch {
  clientName: string;
  clientId: string | null;
  employees: {
    rawName: string;
    employeeId: string | null;
    employeeName: string | null;
  }[];
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function cellStr(cell: unknown): string {
  if (cell == null) return "";
  return String(cell).trim();
}

function bestMatch(
  raw: string,
  candidates: { id: string; name: string }[]
): { id: string; name: string } | null {
  const n = normalize(raw);
  if (!n) return null;
  const exact = candidates.find((c) => normalize(c.name) === n);
  if (exact) return exact;
  // Partial: DB name contains raw or raw contains DB name
  const partial = candidates.find(
    (c) => normalize(c.name).includes(n) || n.includes(normalize(c.name))
  );
  return partial ?? null;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Nav atļauts." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Neizdevās nolasīt failu." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Fails nav pievienots." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    return NextResponse.json({ error: "Neizdevās nolasīt Excel failu." }, { status: 400 });
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  // Auto-detect the header row: find row containing "Uzņēmums" (or "uznēmums")
  let headerRowIdx = -1;
  let clientCol = -1;
  let employeeCol = -1;

  const CLIENT_KEYWORDS = ["uzņēmums", "uznemums", "klients", "company"];
  const EMPLOYEE_KEYWORDS = ["grāmatvedis", "gramatvedis", "darbinieks", "vārds", "vards", "name"];

  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    const normalized = row.map((c) => normalize(cellStr(c)));
    const cIdx = normalized.findIndex((v) => CLIENT_KEYWORDS.some((kw) => v.includes(kw)));
    const eIdx = normalized.findIndex((v) => EMPLOYEE_KEYWORDS.some((kw) => v.includes(kw)));
    if (cIdx !== -1 && eIdx !== -1) {
      headerRowIdx = i;
      clientCol = cIdx;
      employeeCol = eIdx;
      break;
    }
  }

  // Fallback: no header detected - assume col 1 = client, col 2 = employee (skip col 0 = row number)
  if (headerRowIdx === -1) {
    headerRowIdx = 0;
    clientCol = 1;
    employeeCol = 2;
  }

  const dataRows = rows.slice(headerRowIdx + 1).filter((row) => {
    const client = cellStr(row[clientCol]);
    const emp = cellStr(row[employeeCol]);
    return client && emp && client !== "-" && emp !== "-";
  });

  if (dataRows.length === 0) {
    return NextResponse.json(
      { error: "Fails neatpazīts. Pārliecinies, ka kolonnās ir 'Uzņēmums' un 'Grāmatvedis' (vai 'Darbinieks')." },
      { status: 400 }
    );
  }

  // Group: client → set of employee names (same client can appear in multiple rows)
  const clientEmployeeMap = new Map<string, Set<string>>();
  for (const row of dataRows) {
    const client = cellStr(row[clientCol]);
    const emp = cellStr(row[employeeCol]);
    if (!client || !emp || emp === "-") continue;
    if (!clientEmployeeMap.has(client)) clientEmployeeMap.set(client, new Set());
    clientEmployeeMap.get(client)!.add(emp);
  }

  // Load org data
  const [dbClients, dbEmployees] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: session.organizationId },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { organizationId: session.organizationId, role: "EMPLOYEE" },
      select: { id: true, name: true },
    }),
  ]);

  const matches: ImportMatch[] = Array.from(clientEmployeeMap.entries()).map(
    ([clientName, empNames]) => {
      const clientMatch = bestMatch(clientName, dbClients);
      return {
        clientName,
        clientId: clientMatch?.id ?? null,
        employees: Array.from(empNames).map((raw) => {
          const empMatch = bestMatch(raw, dbEmployees);
          return {
            rawName: raw,
            employeeId: empMatch?.id ?? null,
            employeeName: empMatch?.name ?? null,
          };
        }),
      };
    }
  );

  // Sort: unmatched clients first so user sees what needs fixing
  matches.sort((a, b) => {
    if (!a.clientId && b.clientId) return -1;
    if (a.clientId && !b.clientId) return 1;
    return a.clientName.localeCompare(b.clientName);
  });

  return NextResponse.json({ matches, clients: dbClients, employees: dbEmployees });
}
