import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privātuma politika",
  description:
    "Kā Shadowy apstrādā grāmatvedības biroju un to darbinieku datus: kādi dati, kur tie glabājas (ES), kas tos redz, apakšapstrādātāji un jūsu tiesības.",
  alternates: { canonical: "/privacy" },
};

const CONTACT_EMAIL = "contact@shadowy.lv";
const UPDATED = "16.11.2026.";

// Keep in step with the subprocessor annex of the data processing agreement.
const SUBPROCESSORS = [
  {
    name: "Vercel Inc. (ASV)",
    role: "Lietotnes mitināšana un servera funkcijas; anonīma apmeklējumu statistika bez sīkdatnēm",
    where: "ES, Frankfurte",
  },
  { name: "Neon Inc. (ASV)", role: "Datubāze", where: "ES, Frankfurte" },
  {
    name: "Microsoft Ireland Operations Ltd.",
    role: "Azure OpenAI: ierakstu strukturēšana un runas atpazīšana",
    where: "ES, Zviedrija",
  },
  { name: "Resend (ASV)", role: "E-pasta paziņojumi", where: "ASV uzņēmums" },
  { name: "Functional Software, Inc. / Sentry (ASV)", role: "Tehnisku kļūdu uzraudzība", where: "ASV uzņēmums" },
];

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/shadowy.svg" alt="Shadowy" width={28} height={28} />
            <span className="text-base font-semibold tracking-tight">Shadowy</span>
          </Link>
        </div>

        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">Privātuma politika</h1>
        <p className="mt-2 text-sm text-muted-foreground">Atjaunināta {UPDATED}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <Section n={1} title="Kas mēs esam">
            <p>
              Shadowy ir rīks grāmatvedības birojiem, kas parāda, cik laika un naudas patiesībā aiziet uz katru
              klientu. Pakalpojumu sniedz Shadowy (Artemijs Mihails Lučins), e-pasts{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <p>
              Birojs, kas lieto Shadowy, ir savu darbinieku un klientu datu <strong className="text-foreground">pārzinis</strong>.
              Shadowy šos datus apstrādā biroja uzdevumā kā <strong className="text-foreground">apstrādātājs</strong> saskaņā
              ar datu apstrādes līgumu (VDAR 28. pants). Par pilota pieteikuma formas un vietnes datiem pārzinis ir
              Shadowy.
            </p>
          </Section>

          <Section n={2} title="Kādi dati tiek apstrādāti">
            <List
              items={[
                "Lietotāju konti: vārds, uzvārds, e-pasts, loma (administrators, vadītājs, darbinieks), amats un, ja to norāda birojs, stundas likme.",
                "Darba ieraksti: datums, ilgums, īss apraksts, darba veids, klients, atzīme par palīdzību kolēģim.",
                "Biroja klientu saraksts: nosaukums vai vārds, saīsinājumi un, ja to norāda birojs, mēneša maksa.",
                "Balss ievade: audio tiek nosūtīts runas atpazīšanai un pārvērsts tekstā. Audio netiek saglabāts; saglabāts tiek tikai darbinieka apstiprinātais teksts.",
                "Pilota pieteikuma forma: vārds, uzņēmums, e-pasts, komandas lielums, komentārs.",
                "Tehniskie dati: pieteikšanās laiks, IP adrese drošības nolūkos, kļūdu žurnāli.",
              ]}
            />
            <p>Lūdzam neievadīt personas kodus, veselības datus un citu sensitīvu informāciju.</p>
          </Section>

          <Section n={3} title="Kāpēc un uz kāda pamata">
            <List
              items={[
                "Lai birojs redzētu darba laiku un izmaksas pa klientiem un taisnīgi sadalītu slodzi (biroja kā pārziņa leģitīmās intereses vai līguma izpilde).",
                "Lai sniegtu pakalpojumu, nodrošinātu drošību un atbalstu (līgums ar biroju).",
                "Lai atbildētu uz pilota pieteikumu (jūsu pieprasījums pirms līguma noslēgšanas).",
              ]}
            />
          </Section>

          <Section n={4} title="Ko Shadowy nedara">
            <List
              items={[
                "Neseko ekrānam, taustiņiem, programmām, interneta lietošanai vai atrašanās vietai.",
                "Nesaglabā ierakstu bez darbinieka apstiprinājuma.",
                "Nesarindo darbiniekus un nepārdod datus. Dati netiek izmantoti mākslīgā intelekta apmācībai.",
              ]}
            />
          </Section>

          <Section n={5} title="Kas redz datus">
            <List
              items={[
                <><strong className="text-foreground">Darbinieks</strong> redz savus ierakstus.</>,
                <><strong className="text-foreground">Vadītājs</strong> redz savas komandas ierakstus un pārskatus.</>,
                <><strong className="text-foreground">Administrators</strong> redz savas organizācijas datus.</>,
                <><strong className="text-foreground">Citu biroju lietotāji</strong> jūsu datus neredz: katras organizācijas dati ir nodalīti, un tas tiek pārbaudīts ar automātiskiem testiem.</>,
                <><strong className="text-foreground">Shadowy</strong> piekļūst ierakstu saturam tikai atbalsta vai kļūdu novēršanas nolūkā pēc biroja pieprasījuma.</>,
              ]}
            />
          </Section>

          <Section n={6} title="Kur dati glabājas un apakšapstrādātāji">
            <p>
              Datubāze, serveri un mākslīgā intelekta apstrāde atrodas Eiropas Savienībā. Ja apakšapstrādātājs ir
              reģistrēts ASV, datu nosūtīšana notiek, pamatojoties uz ES-ASV Datu privātuma regulējumu vai standarta
              līguma klauzulām.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-muted/50 text-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Uzņēmums</th>
                    <th className="px-3 py-2 font-semibold">Funkcija</th>
                    <th className="px-3 py-2 font-semibold">Atrašanās vieta</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map((s) => (
                    <tr key={s.name} className="border-t border-border align-top">
                      <td className="px-3 py-2 text-foreground">{s.name}</td>
                      <td className="px-3 py-2">{s.role}</td>
                      <td className="px-3 py-2">{s.where}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Microsoft Azure OpenAI nosūtītos tekstus un audio neizmanto modeļu apmācībai; ļaunprātīgas izmantošanas
              uzraudzībai tie var tikt glabāti līdz 30 dienām tajā pašā reģionā.
            </p>
          </Section>

          <Section n={7} title="Drošība">
            <List
              items={[
                "Visi savienojumi ir šifrēti (HTTPS/TLS).",
                "Paroles tiek glabātas tikai neatgriezeniski šifrētā (hash) veidā; pieteikšanās mēģinājumu skaits ir ierobežots.",
                "Piekļuve pēc lomām un organizāciju datu nodalīšana katrā datubāzes pieprasījumā.",
                "Datubāzes rezerves kopijas un automātiskas pārbaudes pirms katras izmaiņu publicēšanas.",
              ]}
            />
          </Section>

          <Section n={8} title="Cik ilgi dati tiek glabāti">
            <p>
              Kamēr biroja konts ir aktīvs. Pēc līguma izbeigšanas birojs 30 dienu laikā var pieprasīt datu eksportu
              (CSV), pēc tam dati tiek dzēsti. Pilota pieteikumi, kas nekļūst par līgumu, tiek dzēsti 12 mēnešu laikā.
            </p>
          </Section>

          <Section n={9} title="Sīkdatnes">
            <p>
              Shadowy izmanto vienu nepieciešamo sesijas sīkdatni (httpOnly), lai noturētu jūsu pieslēgšanos. Vietnes
              valodas izvēle tiek saglabāta tikai jūsu pārlūkā. Apmeklējumu statistika ir anonīma un darbojas bez
              sīkdatnēm. Reklāmas sīkdatnes netiek izmantotas.
            </p>
          </Section>

          <Section n={10} title="Jūsu tiesības">
            <p>
              Jums ir tiesības piekļūt saviem datiem, labot tos, prasīt dzēšanu vai apstrādes ierobežošanu, iebilst pret
              apstrādi un saņemt savus datus pārnesamā formātā. Ja esat biroja darbinieks, vispirms vērsieties pie sava
              biroja kā pārziņa; mēs palīdzēsim izpildīt pieprasījumu. Jums ir arī tiesības iesniegt sūdzību Datu
              valsts inspekcijā (
              <a href="https://www.dvi.gov.lv" className="text-foreground underline underline-offset-2">
                www.dvi.gov.lv
              </a>
              ).
            </p>
          </Section>

          <Section n={11} title="Lietošanas noteikumi un līgumi">
            <p>
              Biroji ar Shadowy slēdz pakalpojuma noteikumus un datu apstrādes līgumu (VDAR 28. pants), kuros noteikti
              cenas, termiņi, atbildība un datu aizsardzības pienākumi. Līgumu paraugus nosūtām pēc pieprasījuma uz{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
              . Par būtiskām izmaiņām šajā politikā biroji tiek informēti iepriekš.
            </p>
          </Section>
        </div>

        <div className="mt-12">
          <Button asChild variant="outline">
            <Link href="/">Doties uz sākumu</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
