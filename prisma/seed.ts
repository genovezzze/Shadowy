import { PrismaClient, Role, EntryStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  "Palīdzība kolēģiem",
  "Jauno darbinieku ievadīšana",
  "Koordinācija",
  "Tulkošanas palīdzība",
  "Telefoniskais atbalsts",
  "Papildu komunikācija",
  "Emocionālais atbalsts",
  "Darbs ārpus lomas",
  "Atkārtots atbalsts",
];

async function main() {
  if (process.env.SEED_CONFIRM !== "yes-wipe-database") {
    throw new Error(
      "Refusing to run: this script WIPES all organizations, users, categories, " +
        "and entries. Set SEED_CONFIRM=yes-wipe-database to confirm (never on production)."
    );
  }

  console.log("Seeding Shadowy demo data...");

  // Wipe in dependency order (dev convenience)
  await prisma.invisibleWorkEntry.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // --- Demo organization (trial set far in future so it never expires) ---
  const farFuture = new Date("2099-01-01");
  const org = await prisma.organization.create({
    data: {
      name: "Demo Uzņēmums SIA",
      slug: "demo",
      trialEndsAt: farFuture,
    },
  });

  // Categories per organization
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((name) => ({
      organizationId: org.id,
      name,
    })),
  });

  const password = await bcrypt.hash("Parole123!", 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Anna Administrātore",
      email: "admin@demo.lv",
      passwordHash: password,
      role: Role.ADMIN,
      title: "Cilvēkresursu vadītāja",
    },
  });

  // Manager
  const manager = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Mārtiņš Vadītājs",
      email: "vaditajs@demo.lv",
      passwordHash: password,
      role: Role.MANAGER,
      title: "Komandas vadītājs",
    },
  });

  // Employees (under that manager)
  const employee1 = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Ilze Darbiniece",
      email: "ilze@demo.lv",
      passwordHash: password,
      role: Role.EMPLOYEE,
      title: "Klientu konsultante",
      managerId: manager.id,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Jānis Bērziņš",
      email: "janis@demo.lv",
      passwordHash: password,
      role: Role.EMPLOYEE,
      title: "Klientu konsultants",
      managerId: manager.id,
    },
  });

  // Example invisible work entries
  await prisma.invisibleWorkEntry.createMany({
    data: [
      {
        organizationId: org.id,
        employeeId: employee1.id,
        managerId: manager.id,
        title: "Palīdzēju jaunajai kolēģei apgūt CRM",
        category: "Jauno darbinieku ievadīšana",
        description:
          "Veltīju aptuveni stundu, lai parādītu, kā strādāt ar klientu reģistru un atbildēt uz tipiskiem jautājumiem.",
        workDate: new Date(),
        durationMinutes: 60,
        status: EntryStatus.PENDING,
      },
      {
        organizationId: org.id,
        employeeId: employee2.id,
        managerId: manager.id,
        title: "Telefonisks atbalsts klientam ārpus darba laika",
        category: "Telefoniskais atbalsts",
        description:
          "Klients zvanīja vakarā, palīdzēju atrisināt steidzamu jautājumu ar piegādi.",
        workDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        durationMinutes: 25,
        status: EntryStatus.APPROVED,
        managerComment: "Paldies, labi paveikts.",
      },
      {
        organizationId: org.id,
        employeeId: employee1.id,
        managerId: manager.id,
        title: "Tulkoju iekšējo instrukciju kolēģim",
        category: "Tulkošanas palīdzība",
        description:
          "Pārtulkoju jaunās drošības instrukcijas no angļu valodas kolēģim, kuram tas bija sarežģīti.",
        workDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        durationMinutes: 40,
        status: EntryStatus.RETURNED,
        managerComment:
          "Lūdzu, papildini ar konkrētu dokumenta nosaukumu un saiti.",
      },
    ],
  });

  console.log("Seed pabeigts.");
  console.log("");
  console.log("Demo lietotāji (parole visiem: Parole123!):");
  console.log(`  Admin:    ${admin.email}`);
  console.log(`  Vadītājs: ${manager.email}`);
  console.log(`  Darbinieks 1: ${employee1.email}`);
  console.log(`  Darbinieks 2: ${employee2.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
