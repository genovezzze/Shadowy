/**
 * Rebuilds one demo employee's work-entry history so the employee dashboard
 * tells a coherent story in a sales demo: steady weekly logging, a two-week
 * summer vacation, gentle growth towards the current month, month-end closing
 * peaks and a few entries still waiting for review.
 *
 * Only touches the "demo" organization and only that employee's entries.
 * Dates are relative to today, so rerun it shortly before a demo to keep
 * "Šodien", "this week" and "this month" populated.
 *
 *   DEMO_RESET_CONFIRM=yes npx tsx scripts/demo-employee-analytics.ts [email]
 */
import { PrismaClient, EntryStatus } from "@prisma/client";

const prisma = new PrismaClient();

const DAY = 86_400_000;
const DEMO_SLUG = "demo";
const HISTORY_WEEKS = 24;
const VACATION_WEEKS_AGO = [15, 16];

// Weighted, so the "Mani klienti" bars and the category × client matrix have
// a clear shape instead of five equal stripes.
const CLIENTS: [name: string, weight: number][] = [
  ["Augļu Dārzs Grupa", 30],
  ["Liepu Kosmētika", 25],
  ["Dzintara Tirdzniecība", 20],
  ["Meistarnams SIA", 15],
  ["Mājvietas Aģentūra", 10],
];

type Template = {
  category: string;
  title: string;
  description: string;
  minutes: [number, number];
  outside?: boolean;
  helped?: boolean;
  noClient?: boolean;
};

// Categories are the "Grāmatvežu palīgs" set from src/lib/smart-log.ts.
const ROUTINE: [Template, number][] = [
  [{ category: "bookkeeping_invoices", title: "Ienākošo rēķinu grāmatošana", description: "Iegrāmatoju piegādātāju rēķinus un pārbaudīju PVN likmes.", minutes: [25, 50] }, 10],
  [{ category: "bookkeeping_invoices", title: "Pavadzīmju salīdzināšana ar pasūtījumiem", description: "Atradu divas nesakritības daudzumos, nosūtīju klientam precizēšanai.", minutes: [30, 55] }, 6],
  [{ category: "bookkeeping_receipts", title: "Čeku grāmatošana", description: "Apstrādāju un iegrāmatoju darbinieku iesniegtos čekus.", minutes: [20, 40] }, 7],
  [{ category: "bookkeeping_receipts", title: "Trūkstošo čeku pieprasīšana", description: "Sazinājos ar klientu par čekiem, kas nebija pievienoti izdevumiem.", minutes: [15, 30], outside: true }, 3],
  [{ category: "bookkeeping_cash", title: "Kases žurnāla sakārtošana", description: "Salīdzināju kases orderus ar Z atskaitēm un izlaboju atlikumu.", minutes: [25, 45] }, 5],
  [{ category: "bookkeeping_advances", title: "Avansa norēķinu pārbaude", description: "Pārbaudīju komandējuma avansa norēķinu un pievienotos dokumentus.", minutes: [20, 40] }, 4],
  [{ category: "bookkeeping_bank", title: "Bankas izrakstu ievade", description: "Ievadīju bankas izrakstus un sasaistīju maksājumus ar rēķiniem.", minutes: [30, 55] }, 9],
  [{ category: "bookkeeping_bank", title: "Neatpazītu maksājumu sasaiste", description: "Noskaidroju, pie kuriem rēķiniem pieder maksājumi bez atsauces.", minutes: [25, 50], outside: true }, 4],
  [{ category: "payroll_calculation", title: "Slimības lapu pārbaude algu aprēķinam", description: "Pārbaudīju darbnespējas lapas un atzīmēju tās darba laika uzskaitē.", minutes: [20, 40] }, 4],
  [{ category: "invoicing", title: "Rēķinu izrakstīšana klientam", description: "Sagatavoju un nosūtīju mēneša rēķinus.", minutes: [20, 40] }, 7],
  [{ category: "invoicing", title: "Kredītrēķina sagatavošana", description: "Sagatavoju kredītrēķinu pēc klienta atgriezuma.", minutes: [15, 30] }, 3],
  [{ category: "payment_preparation", title: "Maksājumu sagatavošana bankā", description: "Sagatavoju nedēļas maksājumus apstiprināšanai.", minutes: [20, 40] }, 8],
  [{ category: "document_scanning", title: "Primāro dokumentu skenēšana", description: "Ieskenēju papīra dokumentus un pievienoju tos ierakstiem.", minutes: [20, 45] }, 4],
  [{ category: "document_archiving", title: "Dokumentu arhivēšana", description: "Sakārtoju iepriekšējā ceturkšņa dokumentus arhīvā.", minutes: [30, 60] }, 3],
  [{ category: "other", title: "Klienta zvans par neskaidru rēķinu", description: "Klients zvanīja ar jautājumu, kas neattiecās uz manu uzdevumu, paskaidroju un pierakstīju.", minutes: [10, 25], outside: true }, 6],
  [{ category: "other", title: "Steidzams klienta pieprasījums pēc atskaites", description: "Klientam vajadzēja izziņu bankai vēl tajā pašā dienā.", minutes: [25, 45], outside: true }, 4],
  [{ category: "other", title: "Palīdzēju kolēģim ar PVN pielikumu", description: "Kolēģim bija termiņš, kopā pārbaudījām darījumu sarakstu.", minutes: [20, 40], outside: true, helped: true, noClient: true }, 4],
  [{ category: "other", title: "Jaunā kolēģa ievadīšana programmā", description: "Parādīju, kā grāmatot rēķinus un kur meklēt klientu dokumentus.", minutes: [30, 60], outside: true, helped: true, noClient: true }, 2],
];

// Long blocks that feed the "Dziļā darba bloki" (>= 60 min) card: payroll
// around the 8th-9th and closing on the last two workdays. Each month gets the
// same number of them, so rolling 30-day comparisons are not skewed.
const PAYROLL: [Template, number][] = [
  [{ category: "payroll_calculation", title: "Darba algas aprēķins", description: "Aprēķināju mēneša algas, atvaļinājuma naudas un nodokļus.", minutes: [60, 110] }, 1],
];
const CLOSING: [Template, number][] = [
  [{ category: "bookkeeping_bank", title: "Mēneša slēgšana: bankas saskaņošana", description: "Saskaņoju bankas atlikumus ar grāmatvedību mēneša beigās.", minutes: [60, 95] }, 3],
  [{ category: "bookkeeping_invoices", title: "Mēneša rēķinu pārbaude pirms slēgšanas", description: "Pārbaudīju, vai visi mēneša rēķini ir iegrāmatoti.", minutes: [45, 80] }, 2],
];

const RETURN_COMMENTS = [
  "Lūdzu, pievieno klienta nosaukumu un precizē laiku.",
  "Vai šis nav jau iekļauts vakardienas ierakstā? Lūdzu, pārbaudi.",
];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261101);

function pick<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

function minutesIn([min, max]: [number, number]): number {
  return Math.round((min + rand() * (max - min)) / 5) * 5;
}

function utcMidnight(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** True for the last two Mon-Fri days of the date's month. */
function isLastWorkdays(date: Date): boolean {
  let workdaysAfter = 0;
  for (let d = date.getTime() + DAY; new Date(d).getUTCMonth() === date.getUTCMonth(); d += DAY) {
    const dow = new Date(d).getUTCDay();
    if (dow !== 0 && dow !== 6) workdaysAfter++;
  }
  return workdaysAfter < 2;
}

async function main() {
  if (process.env.DEMO_RESET_CONFIRM !== "yes") {
    throw new Error(
      "Refusing to run: this script DELETES the employee's work entries in the demo organization. " +
        "Set DEMO_RESET_CONFIRM=yes to confirm."
    );
  }
  const email = process.argv[2] ?? "ilze@demo.lv";

  const org = await prisma.organization.findUnique({ where: { slug: DEMO_SLUG } });
  if (!org) throw new Error(`Organization "${DEMO_SLUG}" not found.`);

  const employee = await prisma.user.findFirst({
    where: { organizationId: org.id, email, role: "EMPLOYEE" },
  });
  if (!employee) throw new Error(`Employee ${email} not found in ${org.name}.`);

  const clients = await prisma.client.findMany({
    where: { organizationId: org.id, name: { in: CLIENTS.map(([n]) => n) } },
    select: { id: true, name: true },
  });
  const clientWeights: [{ id: string; name: string }, number][] = CLIENTS.flatMap(([name, w]) => {
    const c = clients.find((x) => x.name === name);
    return c ? [[c, w] as [{ id: string; name: string }, number]] : [];
  });
  if (clientWeights.length === 0) throw new Error("None of the demo clients exist.");

  const colleagues = await prisma.user.findMany({
    where: { organizationId: org.id, role: "EMPLOYEE", id: { not: employee.id } },
    select: { id: true },
    take: 4,
  });

  const now = new Date();
  const today = utcMidnight(now);
  const todayDow = (new Date(today).getUTCDay() + 6) % 7; // Mon=0
  const thisMonday = today - todayDow * DAY;
  const firstMonday = thisMonday - (HISTORY_WEEKS - 1) * 7 * DAY;

  type Draft = {
    workDate: Date;
    template: Template;
    minutes: number;
  };
  const drafts: Draft[] = [];
  let carry = 0;

  for (let d = firstMonday; d < today; d += DAY) {
    const date = new Date(d);
    const dow = (date.getUTCDay() + 6) % 7;
    if (dow >= 5) continue;
    const weeksAgo = Math.round((thisMonday - (d - dow * DAY)) / (7 * DAY));
    if (VACATION_WEEKS_AGO.includes(weeksAgo)) continue;
    if (rand() < 0.08) continue; // a quiet day with nothing extra to log

    // Logging becomes a habit: more entries per day towards the present. The
    // carry keeps the monthly totals on a steady upward line instead of
    // letting dice rolls make an older month the record.
    const growth = 0.45 + 0.55 * (1 - weeksAgo / (HISTORY_WEEKS - 1)) ** 2;
    carry += 0.4 + growth * 1.5;
    const count = Math.max(1, Math.floor(carry));
    carry -= count;

    const dayOfMonth = date.getUTCDate();
    const special = dayOfMonth === 8 || dayOfMonth === 9 ? PAYROLL : isLastWorkdays(date) ? CLOSING : null;

    for (let i = 0; i < count; i++) {
      const template = special && i === 0 ? pick(special) : pick(ROUTINE);
      drafts.push({ workDate: date, template, minutes: minutesIn(template.minutes) });
    }
  }

  // Indices of older approved entries that get a review outcome other than
  // approval, so "Atpakaļ / Noraidīti" is small but not empty.
  const reviewable = drafts
    .map((dr, i) => ({ i, age: (today - dr.workDate.getTime()) / DAY }))
    .filter((x) => x.age >= 7);
  const returned = reviewable.filter((x) => x.age > 31 && x.age <= 55).sort(() => rand() - 0.5).slice(0, 2).map((x) => x.i);
  const rejected = new Set(
    reviewable.filter((x) => x.age >= 90).sort(() => rand() - 0.5).slice(0, 1).map((x) => x.i)
  );

  const rows = drafts.map((dr, i) => {
    const age = (today - dr.workDate.getTime()) / DAY;
    const status: EntryStatus =
      age <= 2 ? EntryStatus.PENDING :
      returned.includes(i) ? EntryStatus.RETURNED :
      rejected.has(i) ? EntryStatus.REJECTED :
      EntryStatus.APPROVED;
    const createdAt = new Date(
      Math.min(
        now.getTime(),
        dr.workDate.getTime() + (rand() < 0.6 ? 0 : Math.ceil(rand() * 2)) * DAY + (9 + rand() * 9) * 3_600_000
      )
    );
    const reviewedAt = status === EntryStatus.PENDING
      ? createdAt
      : new Date(Math.min(now.getTime(), createdAt.getTime() + (1 + rand() * 2) * DAY));
    const client = dr.template.noClient ? null : pick(clientWeights);
    const helper = dr.template.helped && colleagues.length > 0
      ? colleagues[Math.floor(rand() * colleagues.length)]
      : null;
    const sourceRoll = rand();
    return {
      organizationId: org.id,
      employeeId: employee.id,
      managerId: employee.managerId,
      title: dr.template.title,
      category: dr.template.category,
      description: dr.template.description,
      clientId: client?.id ?? null,
      clientName: client?.name ?? null,
      workDate: dr.workDate,
      durationMinutes: dr.minutes,
      status,
      managerComment:
        status === EntryStatus.RETURNED ? RETURN_COMMENTS[returned.indexOf(i) % RETURN_COMMENTS.length] :
        status === EntryStatus.REJECTED ? "Šis darbs jau ir uzskaitīts kolēģa ierakstā." :
        null,
      source: sourceRoll < 0.45 ? "ai_text" : sourceRoll < 0.55 ? "ai_voice" : "manual",
      isOutsideRole: dr.template.outside ?? false,
      helpedColleague: !!helper,
      helpedUserId: helper?.id ?? null,
      createdAt,
      updatedAt: reviewedAt,
    };
  });

  // Today: a month-end closing block (already approved) and one fresh entry,
  // so the "Šodien" card and this month's figures are never empty.
  const todayClient = clientWeights[0][0];
  const todayRows = [
    {
      title: "Mēneša slēgšana: bankas saskaņošana",
      category: "bookkeeping_bank",
      description: "Saskaņoju bankas atlikumus ar grāmatvedību, lai klients saņemtu pārskatu laikā.",
      durationMinutes: 75,
      status: EntryStatus.APPROVED,
      hour: 9,
    },
    {
      title: "Klienta zvans par neskaidru rēķinu",
      category: "other",
      description: "Klients zvanīja ar jautājumu, kas neattiecās uz manu uzdevumu, paskaidroju un pierakstīju.",
      durationMinutes: 20,
      status: EntryStatus.PENDING,
      hour: 11,
    },
  ].map((t) => {
    const createdAt = new Date(Math.min(now.getTime(), today + t.hour * 3_600_000));
    return {
      organizationId: org.id,
      employeeId: employee.id,
      managerId: employee.managerId,
      title: t.title,
      category: t.category,
      description: t.description,
      clientId: todayClient.id,
      clientName: todayClient.name,
      workDate: new Date(today),
      durationMinutes: t.durationMinutes,
      status: t.status,
      managerComment: null,
      source: "ai_voice",
      isOutsideRole: t.category === "other",
      helpedColleague: false,
      helpedUserId: null,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const [deleted, created] = await prisma.$transaction([
    prisma.invisibleWorkEntry.deleteMany({ where: { organizationId: org.id, employeeId: employee.id } }),
    prisma.invisibleWorkEntry.createMany({ data: [...rows, ...todayRows] }),
    prisma.clientEmployee.createMany({
      data: clientWeights.map(([c]) => ({ clientId: c.id, employeeId: employee.id })),
      skipDuplicates: true,
    }),
  ]);

  console.log(`${employee.name}: deleted ${deleted.count}, created ${created.count} entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
