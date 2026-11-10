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
      lv: "Kā Shadowy aprēķina klienta pašizmaksu?",
      en: "How does Shadowy work out what a client costs?",
    },
    answer: {
      lv: "Darbinieki ieraksta darbu pie konkrēta klienta, AI to sakārto pa kategorijām, un vadītājs ierakstu apstiprina. Apstiprinātās stundas Shadowy reizina ar jūsu stundas likmi un salīdzina ar klientam iekļauto laiku. Tā redzams, kuri klienti prasa vairāk, nekā paredz līgums, un kāpēc: dokumentu labošana, gaidīšana, atkārtoti jautājumi vai steidzami pieprasījumi",
      en: "Employees log work against a specific client, AI sorts it into categories, and a manager approves the entry. Shadowy multiplies the approved hours by your hourly rate and compares them with the time included for that client. That shows which clients take more than the contract covers, and why: fixing documents, waiting, repeated questions or urgent requests",
    },
  },
  {
    question: { lv: "Kas ir Shadowy?", en: "What is Shadowy?" },
    answer: {
      lv: "Shadowy ir rīks grāmatvedības birojiem, kas parāda, cik patiesībā izmaksā katrs klients. Darbinieki 30 sekundēs ieraksta darbu ar balsi vai tekstu, vadītāji to apstiprina, un birojs redz stundas, pašizmaksu un papildu darba iemeslus pa klientiem",
      en: "Shadowy is a tool for accounting firms that shows what each client really costs. Employees log work in 30 seconds by voice or text, managers approve it, and the firm sees hours, cost and the reasons for extra work per client",
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
      lv: "Vadītājiem ir pieejami tikai viņu komandas apstiprinātie ieraksti, bet administratoriem savas organizācijas dati. Citu organizāciju informācija nav pieejama. Detalizēta informācija ir norādīta privātuma politikā",
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
