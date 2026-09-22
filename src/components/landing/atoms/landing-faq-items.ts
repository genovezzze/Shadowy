/**
 * The FAQ copy, kept apart from the accordion that renders it so the homepage
 * can also emit it as FAQPage structured data. One source, so the schema can
 * never drift from what a visitor actually reads - which is what makes the
 * markup eligible for rich results instead of a mismatch penalty.
 */
type Locale = "lv" | "en";

export const FAQ_ITEMS: readonly {
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
}[] = [
  {
    question: {
      lv: "Kas ir neredzamais darbs?",
      en: "What is invisible work?",
    },
    answer: {
      lv: "Neredzamais darbs ir viss tas, ko darbinieks dara papildus saviem darba līgumā noteiktajiem pienākumiem - vai kas pārtrauc viņa fokusu un traucē pamatdarbam. Piemēram: palīdzība kolēģiem, jauno darbinieku ievadīšana, atkārtotu jautājumu atbildēšana, informācijas gaidīšana, koordinācija starp cilvēkiem, steidzami uzdevumi ārpus lomas. Katrs šāds gadījums atsevišķi šķiet mazs, bet kopā tie katru mēnesi izmaksā uzņēmumam reālu naudu - un neviens to neredz",
      en: "Invisible work is everything an employee does beyond the duties set out in their contract - or anything that breaks their focus and gets in the way of their core work. For example: helping colleagues, onboarding new hires, answering repeated questions, waiting for information, coordinating between people, urgent tasks outside their role. Each case seems small on its own, but together they cost the company real money every month - and nobody sees it",
    },
  },
  {
    question: { lv: "Kas ir Shadowy?", en: "What is Shadowy?" },
    answer: {
      lv: "Shadowy ir darba slodzes pārskatāmības rīks. Darbinieki strukturēti fiksē papildu darbu, vadītāji izvērtē un apstiprina iesniegtos ierakstus, savukārt administratori saņem organizācijas līmeņa pārskatu",
      en: "Shadowy is a workload transparency tool. Employees log extra work in a structured way, managers review and approve the submitted entries, and administrators get an organisation-wide overview",
    },
  },
  {
    question: {
      lv: "Cik maksā 30 dienu pilots?",
      en: "How much does the 30-day pilot cost?",
    },
    answer: {
      lv: "30 dienu pilots ir bez maksas un bez kredītkartes. Pēc pieteikuma saņemšanas mēs sazināsimies ar jums, lai precizētu komandas vajadzības un vienotos par pilota uzsākšanu",
      en: "The 30-day pilot is free and needs no credit card. Once we receive your application we'll get in touch to clarify your team's needs and agree on how to start the pilot",
    },
  },
  {
    question: {
      lv: "Kā tiek aizsargāti dati?",
      en: "How is the data protected?",
    },
    answer: {
      lv: "Vadītājiem ir pieejami tikai viņu komandas apstiprinātie ieraksti, bet administratoriem - savas organizācijas dati. Citu organizāciju informācija nav pieejama. Detalizēta informācija ir norādīta privātuma politikā",
      en: "Managers can only see their own team's approved entries, and administrators only their own organisation's data. Information from other organisations is never accessible. Full details are in the privacy policy",
    },
  },
  {
    question: {
      lv: "Vai šo var izmantot pret darbinieku?",
      en: "Can this be used against an employee?",
    },
    answer: {
      lv: "Nē. Shadowy ir procesu pārskatāmības rīks. Dati jāizmanto, lai saprastu slēpto slodzi un uzlabotu darbu, nevis sodītu vai salīdzinātu darbiniekus. Darbinieks pats kontrolē, ko iesniedz",
      en: "No. Shadowy is a process transparency tool. The data is meant to understand hidden workload and improve how work is done, not to punish or compare employees. The employee themselves controls what gets submitted",
    },
  },
];
