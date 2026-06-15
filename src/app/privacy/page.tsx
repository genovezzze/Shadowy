import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privātuma politika — Shadowy",
};

const CONTACT_EMAIL = "artemijlucin@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/shadowy.svg" alt="Shadowy" width={28} height={28} />
            <span className="text-base font-semibold tracking-tight">Shadowy</span>
          </Link>
        </div>

        <h1 className="font-display font-black text-3xl tracking-tight sm:text-4xl">
          Privātuma politika un lietošanas noteikumi
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Spēkā no pilota uzsākšanas. Šī ir vienkāršota politika, kas atbilst Shadowy 30 dienu pilota apjomam.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold tracking-tight">1. Kādi dati tiek apkopoti</h2>
            <ul className="mt-3 space-y-1.5 list-disc pl-5 text-muted-foreground">
              <li>Konta dati: vārds, e-pasta adrese, loma (administrators / vadītājs / darbinieks), amats</li>
              <li>Organizācijas dati: nosaukums, komandas struktūra (kurš ir kura vadītājs)</li>
              <li>Darba ieraksti: nosaukums, apraksts, ilgums, datums un kategorija</li>
              <li>Apstiprinājumu un bonusu pieprasījumu statusi un komentāri</li>
              <li>Pilota pieteikuma forma (publiska): vārds, uzņēmums, e-pasts, komandas lielums, komentārs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">2. Kas redz kādus datus</h2>
            <ul className="mt-3 space-y-1.5 list-disc pl-5 text-muted-foreground">
              <li><strong className="text-foreground">Darbinieks</strong> redz tikai savus ierakstus un to statusu.</li>
              <li><strong className="text-foreground">Vadītājs</strong> redz savas komandas (sev piešķirto darbinieku) ierakstus, apstiprinājumus un bonusu pieprasījumus.</li>
              <li><strong className="text-foreground">Administrators</strong> redz visus savas organizācijas datus — darbiniekus, vadītājus, ierakstus un pārskatus.</li>
              <li><strong className="text-foreground">Shadowy komanda</strong> pilota laikā var piekļūt organizāciju sarakstam un pamatstatistikai (lai nodrošinātu pilota darbību), bet ikdienā nepiekļūst ierakstu saturam.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">3. Ko vadītājs NEREDZ</h2>
            <ul className="mt-3 space-y-1.5 list-disc pl-5 text-muted-foreground">
              <li>Citu organizāciju datus.</li>
              <li>Citu vadītāju komandu ierakstus un pārskatus.</li>
              <li>Ekrāna aktivitāti, privātas sarunas vai citus ar Shadowy nesaistītus datus — platforma šādus datus nemaz nevāc.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">4. Datu glabāšana, eksports un dzēšana</h2>
            <p className="mt-3 text-muted-foreground">
              Dati tiek glabāti, kamēr organizācijas konts ir aktīvs. Lai pieprasītu sava konta vai organizācijas
              datu eksportu (CSV) vai dzēšanu, rakstiet uz kontaktadresi zemāk — pilota laikā šos pieprasījumus
              apstrādājam manuāli, parasti 1–2 darba dienu laikā.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">5. Sīkdatnes</h2>
            <p className="mt-3 text-muted-foreground">
              Shadowy izmanto vienu funkcionālu sesijas sīkdatni (httpOnly), lai noturētu jūsu pieslēgšanos.
              Netiek izmantotas reklāmu vai trešo pušu analītikas sīkdatnes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">6. Kontakti</h2>
            <p className="mt-3 text-muted-foreground">
              Par jautājumiem par datiem, privātumu vai šo politiku rakstiet uz{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 text-foreground">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </section>
        </div>

        <h2 id="lietosanas-noteikumi" className="mt-14 font-display font-black text-2xl tracking-tight sm:text-3xl">
          Lietošanas noteikumi
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Spēkā pilota perioda laikā. Lietojot Shadowy, jūsu organizācija piekrīt šiem noteikumiem.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold tracking-tight">7. Pakalpojuma apraksts</h2>
            <p className="mt-3 text-muted-foreground">
              Shadowy ir rīks darba ierakstu apkopošanai, apstiprināšanai un bonusu pārvaldībai. Pilota
              perioda laikā pakalpojums tiek nodrošināts bez maksas un var tikt mainīts vai pārtraukts
              jebkurā brīdī, par to iepriekš informējot.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">8. Lietotāju pienākumi</h2>
            <ul className="mt-3 space-y-1.5 list-disc pl-5 text-muted-foreground">
              <li>Organizācijas administrators ir atbildīgs par lietotāju kontu pārvaldību savā organizācijā.</li>
              <li>Konta piekļuves dati nav jānodod trešajām personām.</li>
              <li>Platforma jāizmanto tikai likumīgiem, ar darba uzskaiti saistītiem mērķiem.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">9. Pieejamība un atbildība</h2>
            <p className="mt-3 text-muted-foreground">
              Pilota laikā pakalpojums tiek nodrošināts &quot;kā ir&quot;, bez garantijām par nepārtrauktu pieejamību.
              Shadowy nav atbildīgs par neiegūto peļņu vai netiešiem zaudējumiem, kas radušies pakalpojuma
              lietošanas vai tā pārtraukumu rezultātā.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">10. Pilota pārtraukšana un dati</h2>
            <p className="mt-3 text-muted-foreground">
              Jūs vai Shadowy var pārtraukt pilota dalību jebkurā brīdī. Pēc pārtraukšanas jūsu organizācijas
              dati tiks glabāti līdz 30 dienām, lai jūs varētu pieprasīt eksportu, pēc tam tie tiek dzēsti.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">11. Piemērojamie tiesību akti</h2>
            <p className="mt-3 text-muted-foreground">
              Šiem noteikumiem piemēro Latvijas Republikas tiesību aktus.
            </p>
          </section>
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
