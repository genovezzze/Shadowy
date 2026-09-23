import * as React from "react";
import Link from "next/link";

/**
 * The blog lives here as data so both the index and the article route render
 * from one source, and so each article can also emit BlogPosting structured
 * data without the copy drifting from what a reader sees.
 *
 * Articles are plain JSX bodies wrapped by <Prose>, which carries the shared
 * typographic styling. That avoids pulling in a Markdown pipeline for a handful
 * of hand-written posts while keeping the writing readable in source.
 */
export type Article = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, used for <time>, sorting and article structured data. */
  date: string;
  readingMinutes: number;
  keywords: string[];
  /** Cover image (public path). Shown on the index and atop the article. */
  cover?: string;
  coverAlt?: string;
  /** Optional video (public path), shown atop the article instead of a cover. */
  video?: string;
  /** If the piece was first published elsewhere (e.g. LinkedIn), link to it. */
  sourceUrl?: string;
  sourceLabel?: string;
  Body: React.ComponentType;
};

/** The byline shown on every post, Resend-style (avatar + name). */
export const AUTHOR = {
  name: "Shadowy komanda",
  avatar: "/shadowy.svg",
} as const;

/** Shared article typography: a light, landing-consistent reading column. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={[
        "text-[15px] leading-relaxed text-black/75 md:text-base",
        "[&>h2]:mt-10 [&>h2]:mb-3 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-black",
        "[&>h3]:mt-7 [&>h3]:mb-2 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-black",
        "[&>p]:mb-4",
        "[&>ul]:mb-5 [&>ul]:mt-1 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5",
        "[&>ol]:mb-5 [&>ol]:mt-1 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-5",
        "[&_strong]:font-semibold [&_strong]:text-black",
        "[&_a]:font-semibold [&_a]:text-black [&_a]:underline [&_a]:underline-offset-2",
        "[&>blockquote]:my-6 [&>blockquote]:border-l-2 [&>blockquote]:border-black/15 [&>blockquote]:pl-4 [&>blockquote]:text-black/60",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function PilotCta() {
  return (
    <p>
      <Link href="/pilotprojekts">Pieteikties bezmaksas 30 dienu pilotam</Link> un
      ieraudzīt to savā komandā.
    </p>
  );
}

export const ARTICLES: readonly Article[] = [
  {
    slug: "cik-maksa-neredzamais-darbs",
    title: "Uzņēmums apmaksā darba laiku. Bet vai tas redz, uz ko tas aiziet?",
    description:
      "Pētījumi un Shadowy pilota dati par neredzamo darbu: cik stundu pazūd nepamanīti, ko tas maksā un ko mēs ar to izdarījām kopā ar PB Finanses.",
    date: "2026-09-24",
    readingMinutes: 5,
    keywords: ["neredzamais darbs", "komandas slodze", "darbinieku izdegšana", "darba pašizmaksa"],
    Body: () => (
      <Prose>
        <p>
          Uzņēmums apmaksā darba laiku. Bet vai tas redz, uz ko tas patiešām
          aiziet? Piecu mēnešu laikā apkopojām pētījumus un pilota datus par
          neredzamo darbu - un lūk, ko tie rāda.
        </p>

        <h2>Cik daudz laika pazūd nepamanīts</h2>
        <p>
          Lielbritānijā aptaujātie HR speciālisti vidēji zaudē 3,4 stundas nedēļā
          slikti integrētu sistēmu dēļ: manuālas sverēšanas, atkārtota datu
          ievade, vairāku rīku atjaunināšana. Slodze, ko viegli nepamanīt aiz
          izpildītajiem uzdevumiem.
        </p>
        <p>
          Tajā pašā pētījumā 46% regulāri strādāja ilgāk par līgumā paredzēto, un
          45% juta pārslodzi. Aiz slēgtajiem uzdevumiem paliek vakara labojumi,
          steidzami lūgumi un pastāvīga palīdzība kolēģiem.
        </p>
        <p>
          <a href="https://www.iris.co.uk/news/three-in-five-consider-switching-careers-as-workload-pressures-mount-iris-research-finds/" target="_blank" rel="noopener noreferrer">
            Avots: IRIS / Censuswide, 08.06.2026, 300 HR speciālistu aptauja.
          </a>
        </p>

        <h2>Cena, ko mēra gados</h2>
        <p>
          Dānijas NFA aprēķināja: 50 gadus veciem darbiniekiem ar augstu psihiskā
          izsīkuma līmeni paredzamais darba mūžs bija par 3,8 gadiem īsāks nekā
          tiem, kuriem tas bija zems. Tā ir aprēķina aplēse konkrētai grupai, kas
          parāda problēmas mērogu.
        </p>
        <p>
          <a href="https://nfa.elsevierpure.com/ws/portalfiles/portal/66766537/Andersen_LL_Fysisk_og_psykisk_nedslidning_i_Danmark_Maj_2026.pdf" target="_blank" rel="noopener noreferrer">
            Avots: NFA, Dānija, 2026.
          </a>
        </p>

        <h2>“Tikai piecas minūtes” var kļūt par desmit stundām mēnesī</h2>
        <p>
          Piecas minūtes palīdzības reiz seši lūgumi dienā reiz divdesmit darba
          dienas. Šis ir mūsu aprēķina piemērs. Palīdzība var būt nepieciešama un
          vērtīga - tāpēc to ir svarīgi ņemt vērā, plānojot slodzi un atzīstot
          darbinieka ieguldījumu.
        </p>

        <h2>Ko mēs izdarījām un ko atradām</h2>
        <p>
          Tieši šī iemesla dēļ mēs izveidojām Shadowy. Neredzamajam darbam jāsaņem
          trīs skaidras atbildes: kas notika, cik ilgi tas aizņēma un kāpēc tas
          radās.
        </p>
        <p>
          Shadowy pieejā darbinieks 30 sekundēs apraksta situāciju saviem vārdiem,
          AI sagatavo melnrakstu, darbinieks to apstiprina, un vadītājs iegūst
          datus - bez laika uzskaites un bez darbinieku novērošanas.
        </p>
        <p>Pilotā ar grāmatvedības uzņēmumu PB Finanses to ieraudzījām skaitļos:</p>
        <ul>
          <li>pirmajā nedēļā: 10 darbinieki, 62 ieraksti, 53 stundas neredzamā darba, aptuveni 1066 € slēpto izmaksu;</li>
          <li>viena mēneša laikā: 293 situācijas, 207 stundas neredzamā darba, aptuveni 4 066 € aprēķinātās vērtības.</li>
        </ul>
        <p>
          Pēc pilota PB Finanses kļuva par pirmo Shadowy klientu un turpina
          izmantot platformu ikdienā. Dati parādīja arī to, ko neviena iepriekšēja
          atskaite nerādīja: cik liela daļa palīdzības balstās uz dažiem cilvēkiem
          un kuri procesi atkārtojas tik bieži, ka tos ir vērts salabot vienreiz,
          nevis izturēt katru nedēļu.
        </p>

        <h2>Jautājums jums</h2>
        <p>
          Kāds darbs jūsu komandā notiek katru dienu, bet paliek ārpus atskaitēm?
        </p>
        <PilotCta />
      </Prose>
    ),
  },
  {
    slug: "ka-radas-shadowy",
    title: "Kā radās Shadowy un kāpēc mēs padarām neredzamo darbu redzamu",
    description:
      "Shadowy parāda, kur komandā pazūd laiks, nauda un fokuss - bez darbinieku kontroles. Stāsts par to, kā projekts radās Ventspils Augstskolas hakatonā.",
    date: "2026-07-06",
    readingMinutes: 3,
    keywords: ["neredzamais darbs", "komandas slodze", "Ventspils Augstskola", "Shadowy"],
    cover: "/images/blog/ka-radas-shadowy.jpg",
    coverAlt: "Shadowy komanda Ventspils Augstskolas hakatonā Workplace Reinvented",
    sourceUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7479873320545480706",
    sourceLabel: "Sākotnēji publicēts LinkedIn",
    Body: () => (
      <Prose>
        <p>
          Pārvērtiet neredzamo darbu redzamās izmaksās un labākos lēmumos. Shadowy
          parāda, kur komandā pazūd laiks, nauda un fokuss - bez darbinieku
          kontroles.
        </p>
        <p>
          Darbinieki apraksta situācijas saviem vārdiem. Shadowy pārvērš tās datos
          par slēpto slodzi, izmaksām un procesu uzlabojumiem.
        </p>

        <h2>Kā radās ideja</h2>
        <p>
          Šī ideja radās Ventspils Augstskolas hakatonā “Workplace Reinvented”,
          kur mums bija jāizvēlas viens no piedāvātajiem izaicinājumiem. Mēs
          izvēlējāmies izaicinājumu par darbinieku izdegšanu.
        </p>
        <p>
          Rokoties dziļāk, sapratām - pat komandās, kur it kā viss iet gludi,
          cilvēki jūtas noguruši un pārslogoti. Termiņi tiek nokavēti, lai gan
          neviens neko “nedara nepareizi”.
        </p>

        <h2>Kur pazūd darba diena</h2>
        <p>
          Runājot ar cilvēkiem, atbilde bija vienkārša: liela daļa darba dienas
          aiziet lietās, kuras neviens nekad neredz:
        </p>
        <ul>
          <li>palīdzība kolēģiem</li>
          <li>atbilžu gaidīšana</li>
          <li>jauna cilvēka apmācīšana</li>
          <li>fokusa zaudēšana un atgūšana</li>
        </ul>
        <p>
          Tas viss ir darbs. Bet tas nav nevienā atskaitē. Un to, kas nav redzams,
          nevar arī uzlabot.
        </p>

        <h2>Tā radās Shadowy</h2>
        <p>
          Tā radās Shadowy - Ventspils Augstskolas studentu projekts ar vienkāršu
          mērķi: padarīt šo neredzamo darbu redzamu, lai uzņēmumi beidzot zinātu,
          kur tiešām pazūd laiks un nauda.
        </p>
        <p>
          Mums jau ir izveidota platforma, un šobrīd meklējam 3 uzņēmumus, kas
          gribētu būt pirmie, kas to izmēģina.
        </p>
        <PilotCta />
      </Prose>
    ),
  },
  {
    slug: "shadowy-pilotprojekts-atverts",
    title: "Shadowy pilotprojekts ir atvērts: meklējam 2 komandas",
    description:
      "Shadowy pilots ir atvērts. Pirmā komanda jau testē platformu, un mēs meklējam vēl 2 komandas ar 5-20 darbiniekiem, kas grib redzēt, kur pazūd laiks, nauda un fokuss.",
    date: "2026-07-06",
    readingMinutes: 3,
    keywords: ["Shadowy pilots", "bezmaksas pilots", "neredzamais darbs", "komandas slodze"],
    cover: "/images/blog/shadowy-pilotprojekts-atverts.jpg",
    coverAlt: "Shadowy pilotprojekts ir atvērts",
    sourceUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7479995879404396544",
    sourceLabel: "Sākotnēji publicēts LinkedIn",
    Body: () => (
      <Prose>
        <p>
          Shadowy pilotprojekts ir atvērts. Kopā ar Līgu Migoļu esam izveidojuši
          Shadowy - platformu, kas palīdz uzņēmumiem redzēt, kur komandā pazūd
          laiks, nauda un fokuss, bez darbinieku kontroles.
        </p>
        <p>
          Pirmā komanda jau testē Shadowy un izmanto platformas funkcionalitāti
          ikdienas darbā. Tagad meklējam vēl 2 komandas ar 5-20 darbiniekiem,
          kuras vēlas piedalīties Shadowy pilotā.
        </p>

        <h2>Ko mēs piedāvājam</h2>
        <ul>
          <li>2 nedēļu bezmaksas pilotu</li>
          <li>ar iespēju pagarināt līdz 30 dienām, ja redzat vērtību un vēlaties turpināt testēšanu</li>
        </ul>

        <h2>Ko pilotā varēs redzēt</h2>
        <p>Pilotā komanda varēs izmantot Shadowy, lai redzētu:</p>
        <ul>
          <li>kur pazūd darbinieku fokuss;</li>
          <li>kāds neredzamais darbs notiek komandā;</li>
          <li>kas traucē cilvēkiem pabeigt pamatdarbu;</li>
          <li>kur rodas papildu slodze;</li>
          <li>cik daudz laika un naudas uzņēmums var zaudēt darba procesos, kas šobrīd netiek pamanīti.</li>
        </ul>
        <p>
          Darbiniekiem Shadowy palīdz saprast, kas viņiem traucē strādāt
          efektīvāk: atkārtoti jautājumi, gaidīšana uz informāciju, fokusa
          pārtraukumi, darbs ārpus lomas vai papildu uzdevumi.
        </p>
        <p>
          Vadītājiem Shadowy dod pārskatu par slēpto slodzi, izmaksām, klientiem,
          uzdevumiem un procesu vietām, kur komanda zaudē laiku.
        </p>

        <h2>Shadowy nav darbinieku kontroles rīks</h2>
        <p>
          Mērķis nav sekot cilvēkiem. Mērķis ir saprast, kur procesi bremzē
          komandu un kur uzņēmums var pieņemt labākus lēmumus par darba sadali,
          lomām, izmaksām un efektivitāti.
        </p>

        <h2>Individuālas funkcijas pilota laikā</h2>
        <p>
          Pilota laikā varam pielāgot vai izstrādāt individuālas funkcijas tieši
          jūsu uzņēmuma vajadzībām. Ja jūsu komandā ir konkrēts process, ko gribat
          automatizēt vai labāk pārskatīt, mēs varam to testēt kopā ar jums
          pilotprojekta laikā.
        </p>

        <h2>Kam pilots ir aktuāls</h2>
        <p>Meklējam komandas, kurām ir aktuāli:</p>
        <ul>
          <li>neredzamais darbs;</li>
          <li>fokusa zudumi;</li>
          <li>papildu slodze;</li>
          <li>darbs ārpus lomas;</li>
          <li>klientu vai uzdevumu pārskatāmība;</li>
          <li>procesu automatizācija;</li>
          <li>efektīvāka darba sadale.</li>
        </ul>
        <p>
          Ja jūsu komandā ir 5-20 cilvēki un vēlaties izmēģināt Shadowy pilotu,
          sazinieties ar mums (contact@shadowy.lv) vai piesakieties mājaslapā.
        </p>
        <PilotCta />
      </Prose>
    ),
  },
  {
    slug: "pirma-pilota-nedela",
    title: "Pirmā pilota nedēļa: 53 stundas neredzamā darba un €1066 slēpto izmaksu",
    description:
      "Pēc pirmās Shadowy pilota nedēļas: 10 darbinieki, 62 ieraksti, 53 stundas fiksēta neredzamā darba un aptuveni €1066 slēpto izmaksu. Ko mēs uzzinājām un uzlabojām.",
    date: "2026-07-15",
    readingMinutes: 3,
    keywords: ["Shadowy pilots", "neredzamais darbs", "slēptās izmaksas", "komandas slodze"],
    cover: "/images/blog/pirma-pilota-nedela.jpg",
    coverAlt: "Shadowy pilota pirmās nedēļas rezultāti",
    sourceUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7483056905209155584",
    sourceLabel: "Sākotnēji publicēts LinkedIn",
    Body: () => (
      <Prose>
        <p>
          Pirmā pilotprojekta nedēļa ir aiz muguras. Pēc pirmās pilotnedēļas varam
          droši teikt - reālā lietotāju pieredze ir daudz vērtīgāka par jebkuriem
          pieņēmumiem.
        </p>

        <h2>Pirmajās 7 dienās</h2>
        <ul>
          <li>10 darbinieki</li>
          <li>62 ieraksti</li>
          <li>53 stundas un 17 minūtes fiksēta neredzamā darba</li>
          <li>aptuvenās slēptās izmaksas - €1066 vienas nedēļas laikā</li>
        </ul>
        <p>Taču vērtīgākais nebija statistika.</p>

        <h2>Produkts izauga ātrāk, nekā gaidījām</h2>
        <p>
          Pēc pirmās pilotnedēļas kļuva skaidrs, ka Shadowy ir izaudzis par daudz
          vairāk, nekā sākotnēji bijām iecerējuši. Reāla lietotāju pieredze
          palīdzēja pārvērst sākotnējo ideju par daudz spēcīgāku produktu, kas
          sniedz lielāku vērtību gan darbiniekiem, gan uzņēmumiem.
        </p>
        <p>Pamatojoties uz pilota rezultātiem, jau pirmajā nedēļā tika ieviesti:</p>
        <ul>
          <li>detalizētāka analītika</li>
          <li>skaidrāks pārskats par katra darbinieka darba slodzi</li>
          <li>uzņēmumam individuāli pielāgotas funkcijas</li>
          <li>desmitiem uzlabojumu un kļūdu labojumu</li>
        </ul>

        <h2>Saruna ar darbiniekiem</h2>
        <p>
          Tikpat vērtīga bija saruna ar pašiem darbiniekiem. Saņēmām daudz
          noderīgas atgriezeniskās saites par platformas lietošanu, jaunām
          kategorijām un funkcijām. Darbinieki atzina, ka platforma palīdz
          detalizētāk paskatīties uz savu darba dienu un labāk saprast, kur
          patiesībā aiziet viņu laiks.
        </p>
        <p>
          Vienlaikus kļuva skaidrs, ka Shadowy ir vērtīgs ne tikai uzņēmumam, bet
          arī pašam darbiniekam.
        </p>

        <h2>Kas tālāk</h2>
        <p>
          Nākamajos atjauninājumos vēl lielāku uzmanību pievērsīsim AI ieteikumiem,
          individuālai analītikai un iespējai katram darbiniekam labāk saprast savu
          darba dienu, fokusa zudumus un slēpto darba slodzi.
        </p>
        <PilotCta />
      </Prose>
    ),
  },
  {
    slug: "kas-slepjas-aiz-pakalpojuma",
    title: "Kas patiesībā slēpjas aiz klientam sniegtā pakalpojuma?",
    description:
      "Klients redz gala rezultātu, bet aiz tā ir konsultācijas, precizējumi un kļūdu labošana. Pirmajā Shadowy pilotā ar PB Finanses mēnesī fiksējām 207 stundas neredzamā darba un 4066 € vērtību.",
    date: "2026-08-05",
    readingMinutes: 3,
    keywords: ["neredzamais darbs", "klienta pašizmaksa", "PB Finanses", "pakalpojumu uzņēmums"],
    cover: "/images/blog/kas-slepjas-aiz-pakalpojuma.jpg",
    coverAlt: "Shadowy pilota rezultāti ar PB Finanses: neredzamā darba stundas un vērtība",
    sourceUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7490739122081304576",
    sourceLabel: "Sākotnēji publicēts LinkedIn",
    Body: () => (
      <Prose>
        <p>
          Klients redz gala rezultātu, taču aiz tā paliek konsultācijas, steidzami
          precizējumi, kļūdu labošana un daudzi citi darbi, kas nodrošina
          kvalitatīvu servisu. Daļa no šī darba neparādās ne plānotajā darba
          apjomā, ne klienta rēķinā.
        </p>
        <p>
          Neredzamais darbs ir viss, kas paliek aiz gala rezultāta, bet prasa
          komandas laiku, uzmanību un iesaisti, lai klients saņemtu kvalitatīvu
          servisu.
        </p>

        <h2>Pirmais Shadowy pilots ar PB Finanses</h2>
        <p>Viena mēneša laikā fiksējām:</p>
        <ul>
          <li>293 situācijas</li>
          <li>207 stundas neredzamā darba</li>
          <li>4 066 € aprēķinātā vērtība</li>
        </ul>
        <p>
          Shadowy pārvērš neredzamo darbu datos, lai uzņēmums varētu saprast, kur
          patiesībā tiek ieguldīts komandas laiks, kas novērš uzmanību no galvenā
          darba un kurus procesus iespējams uzlabot.
        </p>
        <p>
          Pēc pilota PB Finanses kļuva par pirmo Shadowy klientu un turpina
          izmantot platformu ikdienā.
        </p>
        <PilotCta />
      </Prose>
    ),
  },
  {
    slug: "kas-ir-shadowy",
    title: "Kas ir Shadowy?",
    description:
      "Katru dienu komandā notiek darbs, ko neviens neredz. Shadowy padara šo neredzamo darbu redzamu: darbinieks apraksta, AI izveido melnrakstu, vadītājs iegūst datus. Bez laika uzskaites un novērošanas.",
    date: "2026-07-13",
    readingMinutes: 3,
    keywords: ["Kas ir Shadowy", "neredzamais darbs", "komandas slodze", "AI"],
    video: "/videos/blog/kas-ir-shadowy.mp4",
    sourceUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7482421610709159936",
    sourceLabel: "Sākotnēji publicēts LinkedIn",
    Body: () => (
      <Prose>
        <p>
          Katru dienu jūsu komandā notiek darbs, ko neviens neredz. Kāds palīdz
          kolēģim saprast sistēmu. Kāds skaidro to pašu jautājumu jau trešo reizi.
          Kāds koordinē kaut ko, ko neviens formāli nav uzticējis. Fokuss tiek
          pārtraukts un tad atkal, un atkal.
        </p>
        <p>Darbs notiek. Bet datos tā nav.</p>
        <p>Shadowy ir platforma, kas šo darbu padara redzamu.</p>

        <h2>Kā tas darbojas</h2>
        <ol>
          <li>Darbinieks apraksta saviem vārdiem, kas šodien traucēja un kas aizņēma laiku ārpus pamatdarba.</li>
          <li>AI izveido melnrakstu.</li>
          <li>Darbinieks pārskata un apstiprina.</li>
        </ol>
        <p>
          Vadītājs iegūst datus, kur komandā pazūd laiks, kuri procesi atkārtojas,
          ko var automatizēt un ko uzlabot.
        </p>

        <h2>Individuāla pieeja katram uzņēmumam</h2>
        <p>
          Katram uzņēmumam šis darbs izskatās savādāk: citādi procesi, citādi
          šķēršļi, cita komandas dinamika. Tāpēc mēs katram uzņēmumam izstrādājam
          individuālu pieeju. Neskatāmies uz jūsu komandu caur vispārīgu šablonu -
          skatāmies uz to, kas notiek tieši pie jums, un palīdzam saprast, kurus
          procesus var vienkāršot vai automatizēt.
        </p>

        <h2>Sākas ar 2 nedēļu pilotu</h2>
        <p>
          Shadowy sākas ar 2 nedēļu pilotu, lai redzētu, kas notiek tieši jūsu
          komandā. Ja vajadzīgs vairāk laika, pilots turpinās līdz 30 dienām.
        </p>
        <p>
          Nav laika uzskaites. Nav darbinieku novērošanas. Tikai skaidrāks
          priekšstats par to, kur patiesībā aiziet darba diena.
        </p>
        <PilotCta />
      </Prose>
    ),
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
