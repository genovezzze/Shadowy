const explainerItems = [
  {
    number: "01",
    title: "Kas ir Shadowy?",
    text: "Shadowy ir darba redzamības platforma komandām. Tā palīdz ieraudzīt darbu, kas parasti paliek ārpus kalendāriem, uzdevumu sistēmām un atskaitēm.",
  },
  {
    number: "02",
    title: "Ko Shadowy dara?",
    text: "Darbinieks īsi apraksta situāciju saviem vārdiem, bet Shadowy ierakstu strukturē un pārvērš pārskatāmā informācijā par laiku, slodzi un atkārtojošiem procesiem.",
  },
  {
    number: "03",
    title: "Kāpēc tas ir vajadzīgs?",
    text: "Vadība iegūst skaidrāku priekšstatu par komandas ikdienu, slēptajām izmaksām un vietām, kur procesus iespējams vienkāršot - bez darbinieku kontroles.",
  },
] as const;

export function ShadowyExplainerSection() {
  return (
    <section
      id="kas-ir-shadowy"
      aria-labelledby="shadowy-explainer-heading"
      className="relative border-b border-white/[0.08] bg-[#070809] px-5 py-14 sm:px-6 sm:py-18 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-white/[0.09] pb-8">
          <div className="max-w-5xl">
            <h2
              id="shadowy-explainer-heading"
              className="max-w-4xl font-accent text-[clamp(2rem,4.5vw,4.25rem)] font-bold leading-[0.98] tracking-[-0.025em] text-white [font-synthesis:weight]"
            >
              <span className="text-[#75babc]">Shadowy</span> padara neredzamo darbu redzamu
            </h2>
            <p className="mt-5 max-w-3xl font-sans text-base font-normal leading-7 text-white/62 sm:text-lg sm:leading-8">
              Viena vieta, kur komandas ikdienas situācijas kļūst par saprotamu informāciju procesu uzlabošanai.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3">
          {explainerItems.map((item, index) => (
            <article
              key={item.number}
              className={`py-7 lg:min-h-64 lg:px-8 lg:py-9 ${
                index > 0 ? "border-t border-white/[0.08] lg:border-l lg:border-t-0" : ""
              } ${index === 0 ? "lg:pl-0" : ""}`}
            >
              <span className="font-accent text-[10px] font-semibold tracking-[0.08em] text-white/48">
                {item.number}
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.01em] text-white sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-4 max-w-md font-sans text-[15px] font-normal leading-7 text-white/58 sm:text-base sm:leading-[1.75]">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
