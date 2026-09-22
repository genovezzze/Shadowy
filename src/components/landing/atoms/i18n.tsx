"use client";

import * as React from "react";

export type Locale = "lv" | "en";

// Translations for the nav + hero ("main sections" first). Add keys here and use
// them via `useLocale().t("key")` to bring more of the landing into English.
const STRINGS = {
  // Nav
  "nav.explore": { lv: "Izpēti", en: "Explore" },
  "nav.login": { lv: "Pieslēgties", en: "Log in" },
  "nav.cta": { lv: "Pieteikt pilotu", en: "Apply for a pilot" },
  "nav.pill": { lv: "Gatavi izmēģināt? Pastāstiet par komandu", en: "Ready to try? Tell us about your team" },
  "nav.pillChip": { lv: "Pilots", en: "Pilot" },
  "nav.pilotProject": { lv: "Pilotprojekts", en: "Pilot project" },
  "nav.email": { lv: "E-pasts", en: "Email" },
  "menu.howItWorks": { lv: "Kā tas darbojas", en: "How it works" },
  "menu.whatToLog": { lv: "Ko fiksēt", en: "What to log" },
  "menu.overview": { lv: "Pārskats", en: "Overview" },
  "menu.forWhom": { lv: "Kam noder", en: "Who it's for" },
  "menu.clients": { lv: "Klienti", en: "Clients" },
  "menu.faq": { lv: "FAQ", en: "FAQ" },

  // CTA dropdown
  "cta.title": { lv: "Sāksim ar pilotu", en: "Start a pilot" },
  "cta.subtitle": { lv: "Atbildam 1 darba dienas laikā", en: "We reply within 1 business day" },
  "cta.language": { lv: "Valoda", en: "Language" },
  "cta.privacy": { lv: "Privātuma politika", en: "Privacy policy" },

  // Hero
  "hero.subtitle": {
    lv: "Komandu slodzes pārskatāmības platforma: redziet neredzamo darbu, patieso noslodzi un dārgākos klientus",
    en: "A team-workload transparency platform: see invisible work, the true load and your costliest clients",
  },
  "hero.cta": { lv: "Sākt projektu", en: "Get started" },
  "hero.trust1": { lv: "30 dienas bez maksas", en: "30 days free" },
  "hero.trust2": { lv: "Bez kredītkartes", en: "No credit card" },
  "hero.trust3": { lv: "Darbinieks pats izvēlas, ko iesniedz", en: "Employees choose what to submit" },
  "hero.partner": { lv: "PB Finanses jau strādā ar Shadowy", en: "PB Finanses already works with Shadowy" },

  // Product
  "product.badge": { lv: "Pārskats", en: "Overview" },
  "product.heading": {
    lv: "Viena platforma no ieraksta līdz atskaitei un klienta izmaksām",
    en: "One platform from entry to report to client cost",
  },
  "product.demoNote": {
    lv: "Ekrānattēlos redzami demonstrācijas dati.",
    en: "The screenshots show demo data.",
  },
  "product.cta": {
    lv: "Skatīt pilnu atskaiti reālā projektā",
    en: "See the full report in a real project",
  },

  // Cases
  "cases.badge": { lv: "Projekti", en: "Projects" },
  "cases.heading": { lv: "Pilotprojekti un klienti", en: "Pilot projects and clients" },
  "cases.done": { lv: "Realizēts", en: "Delivered" },
  "cases.pbText": {
    lv: "Vienota platforma neredzamā darba, komandas slodzes un klientu izmaksu pārskatīšanai",
    en: "A single platform for reviewing invisible work, team workload and client cost",
  },
  "cases.pbTag": { lv: "Grāmatvedības uzņēmums", en: "Accounting firm" },
  "cases.viewProject": { lv: "Skatīt projektu", en: "View project" },
  "cases.apply": { lv: "Pieteikties pilotam", en: "Apply for the pilot" },
  "cases.learnMore": { lv: "Uzzināt vairāk", en: "Learn more" },

  // Approach
  "approach.badge": { lv: "Process", en: "Process" },
  "approach.heading": { lv: "Kā Shadowy strādā", en: "How Shadowy works" },

  // Outcomes
  "outcomes.badge": { lv: "Ieguvumi", en: "Benefits" },
  "outcomes.heading": { lv: "Ko jūs redzēsiet pēc pilota", en: "What you'll see after the pilot" },
  "outcomes.cta": { lv: "Sākt pilotu", en: "Start a pilot" },
  "outcomes.learnMore": { lv: "Uzzināt vairāk", en: "Learn more" },

  // What to log
  "whatToLog.badge": { lv: "Saturs", en: "Content" },
  "whatToLog.heading": { lv: "Ko fiksē Shadowy", en: "What Shadowy logs" },
  "whatToLog.example": {
    lv: "Piemērs: grāmatvedības uzņēmums",
    en: "Example: an accounting firm",
  },
  "whatToLog.exampleNote": {
    lv: "Kategorijas veidojam individuāli jūsu uzņēmumam - šis ir tikai piemērs tam, kā tās izskatās grāmatvedības komandā. Pilota sākumā tās sagatavojam kopā ar jums, atbilstoši tam, kā strādā jūsu komanda.",
    en: "We build the categories individually for your company - this is only an example of how they look in an accounting team. At the start of the pilot we prepare them together with you, matching how your team actually works.",
  },
  "whatToLog.notNeeded": { lv: "Nav jāfiksē", en: "No need to log" },

  // Audience
  "audience.badge": { lv: "Lomas", en: "Roles" },
  "audience.heading": { lv: "Kam Shadowy noder", en: "Who Shadowy is for" },
  "audience.examples": { lv: "Piemēri", en: "Examples" },

  // Pilot banner
  "pilotBanner.badge": { lv: "Pilots", en: "Pilot" },
  "pilotBanner.heading": { lv: "Izmēģiniet pilotu bez riska", en: "Try the pilot with no risk" },
  "pilotBanner.subtitle": {
    lv: "Aizpildiet formu - sazināsimies 1-2 darba dienu laikā un palīdzēsim uzsākt pilotu jūsu komandā",
    en: "Fill in the form - we'll get in touch within 1-2 business days and help you start the pilot in your team",
  },
  "pilotBanner.cta": { lv: "Pieteikties pilotam", en: "Apply for the pilot" },

  // FAQ
  "faq.heading": { lv: "Biežāk uzdotie jautājumi", en: "Frequently asked questions" },
  "faq.subtitle": {
    lv: "Ja neatrodat atbildi, uzdodiet jautājumu pieteikuma formā - mēs atbildēsim godīgi, arī tad, ja Shadowy jūsu situācijai neder",
    en: "If you can't find an answer, ask in the application form - we'll answer honestly, even if Shadowy isn't right for your situation",
  },

  // Contact
  "contact.badge": { lv: "Pieteikums", en: "Application" },
  "contact.heading": { lv: "Sāksim ar sarunu", en: "Let's start with a conversation" },
  "contact.subtitle": {
    lv: "Pastāstiet par komandu - sazināsimies 1-2 darba dienu laikā Iepazīšanās zvans ilgst 20 minūtes, un ja Shadowy jūsu situācijai neder, mēs to pateiksim godīgi",
    en: "Tell us about your team - we'll get in touch within 1-2 business days. The intro call lasts 20 minutes, and if Shadowy isn't right for your situation, we'll tell you honestly",
  },
  "contact.sentTitle": { lv: "Pieteikums nosūtīts!", en: "Application sent!" },
  "contact.sentBody": {
    lv: "Sazināsimies ar jums tuvāko dienu laikā",
    en: "We'll be in touch in the next few days",
  },
  "contact.name": { lv: "Vārds un uzvārds*", en: "Full name*" },
  "contact.company": { lv: "Uzņēmums*", en: "Company*" },
  "contact.email": { lv: "E-pasts*", en: "Email*" },
  "contact.teamSize": { lv: "Komandas lielums*", en: "Team size*" },
  "contact.selectPlaceholder": { lv: "Izvēlieties...", en: "Choose..." },
  "contact.comment": { lv: "Īss komentārs", en: "Short comment" },
  "contact.commentPlaceholder": {
    lv: "Ko jūs vēlaties uzlabot komandā?",
    en: "What would you like to improve in your team?",
  },
  "contact.sending": { lv: "Sūta...", en: "Sending..." },
  "contact.submit": { lv: "Nosūtīt pieteikumu", en: "Send application" },
  "contact.consentPre": {
    lv: "Nospiežot pogu, jūs piekrītat",
    en: "By clicking the button, you agree to the",
  },
  "contact.consentLink": { lv: "privātuma politikai", en: "privacy policy" },

  // Footer
  "footer.contacts": { lv: "Kontakti", en: "Contacts" },
} as const;

export type StringKey = keyof typeof STRINGS;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: StringKey) => string;
};

const LocaleContext = React.createContext<LocaleContextValue>({
  locale: "lv",
  setLocale: () => {},
  t: (key) => STRINGS[key].lv,
});

const STORAGE_KEY = "shadowy:locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("lv");

  // Read the saved choice after mount to avoid a hydration mismatch (server and
  // first client render are both "lv").
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "lv") setLocaleState(saved);
    } catch {
      // Blocked storage - just keep the default.
    }
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.lang = next;
  }, []);

  const t = React.useCallback((key: StringKey) => STRINGS[key][locale], [locale]);

  const value = React.useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return React.useContext(LocaleContext);
}

/** The LV / EN pill toggle for the nav. */
export function LocaleToggle({ light }: { light?: boolean }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className={
        "flex items-center rounded-full p-0.5 " +
        (light ? "bg-black/[0.06]" : "bg-white/[0.1]")
      }
    >
      {(["lv", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={
              "rounded-full px-2.5 py-1 text-xs font-bold uppercase transition-colors " +
              (active
                ? light
                  ? "bg-white text-black shadow-sm"
                  : "bg-white text-black"
                : light
                  ? "text-black/50 hover:text-black/80"
                  : "text-white/60 hover:text-white")
            }
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
