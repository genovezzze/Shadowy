/**
 * The FAQ copy, kept apart from the accordion that renders it so the homepage
 * can also emit it as FAQPage structured data. One source, so the schema can
 * never drift from what a visitor actually reads - which is what makes the
 * markup eligible for rich results instead of a mismatch penalty.
 */
export const FAQ_ITEMS = [
  {
    question: "Kas ir neredzamais darbs?",
    answer:
      "Neredzamais darbs ir viss tas, ko darbinieks dara papildus saviem darba līgumā noteiktajiem pienākumiem - vai kas pārtrauc viņa fokusu un traucē pamatdarbam. Piemēram: palīdzība kolēģiem, jauno darbinieku ievadīšana, atkārtotu jautājumu atbildēšana, informācijas gaidīšana, koordinācija starp cilvēkiem, steidzami uzdevumi ārpus lomas. Katrs šāds gadījums atsevišķi šķiet mazs, bet kopā tie katru mēnesi izmaksā uzņēmumam reālu naudu - un neviens to neredz",
  },
  {
    question: "Kas ir Shadowy?",
    answer:
      "Shadowy ir darba slodzes pārskatāmības rīks. Darbinieki strukturēti fiksē papildu darbu, vadītāji izvērtē un apstiprina iesniegtos ierakstus, savukārt administratori saņem organizācijas līmeņa pārskatu",
  },
  {
    question: "Cik maksā 30 dienu pilots?",
    answer:
      "30 dienu pilots ir bez maksas un bez kredītkartes. Pēc pieteikuma saņemšanas mēs sazināsimies ar jums, lai precizētu komandas vajadzības un vienotos par pilota uzsākšanu",
  },
  {
    question: "Cik ilgs laiks nepieciešams, lai sāktu?",
    answer:
      "Sākotnējā iestatīšana parasti aizņem līdz 10 minūtēm. Administrators pievieno darbiniekus un vadītājus, pēc tam sistēma ir gatava lietošanai",
  },
  {
    question: "Kā tiek aizsargāti dati?",
    answer:
      "Vadītājiem ir pieejami tikai viņu komandas apstiprinātie ieraksti, bet administratoriem - savas organizācijas dati. Citu organizāciju informācija nav pieejama. Detalizēta informācija ir norādīta privātuma politikā",
  },
  {
    question: "Kas notiek pēc pilota beigām?",
    answer:
      "Pēc pilota beigām jūs varat izvēlēties turpināt vai pārtraukt lietošanu. Pārtraukšanas gadījumā datus iespējams eksportēt, un pēc noteiktā glabāšanas perioda tie tiek dzēsti",
  },
  {
    question: "Vai darbiniekiem jāfiksē visas darbības?",
    answer:
      "Nē. Shadowy nav paredzēts visu ikdienas darbību fiksēšanai. Darbinieks fiksē tikai situācijas, kas bija ārpus pamatdarba, radīja papildu slodzi vai traucēja paveikt plānoto darbu. Parastais ikdienas darbs nav jāfiksē",
  },
  {
    question: "Kāpēc darbiniekam būtu to jāaizpilda?",
    answer:
      "Lai redzētu, kas viņam traucē strādāt efektīvāk: atkārtoti jautājumi, gaidīšana, neskaidras atbildības, palīdzība citiem vai steidzami neplānoti uzdevumi. Mērķis ir uzlabot procesus, nevis kontrolēt cilvēku",
  },
  {
    question: "Vai šo var izmantot pret darbinieku?",
    answer:
      "Nē. Shadowy ir procesu pārskatāmības rīks. Dati jāizmanto, lai saprastu slēpto slodzi un uzlabotu darbu, nevis sodītu vai salīdzinātu darbiniekus. Darbinieks pats kontrolē, ko iesniedz",
  },
  {
    question: "Vai AI saglabā ierakstus automātiski?",
    answer:
      "Nē. AI izveido tikai melnrakstus. Darbinieks pats pārskata, labo un apstiprina ierakstus pirms saglabāšanas. Nekas netiek saglabāts bez darbinieka apstiprinājuma",
  },
] as const;
