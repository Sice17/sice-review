import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Användarvillkor — SICE Review",
  description: "Villkoren för att använda tjänsten SICE Review.",
};

export default function TermsPage() {
  return (
    <main className="min-h-full bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Tillbaka till startsidan
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
          Användarvillkor
        </h1>
        <p className="mt-3 text-muted-foreground">
          Dessa villkor reglerar din användning av tjänsten SICE Review. Genom
          att skapa ett konto godkänner du villkoren.
        </p>

        <div className="mt-10 space-y-10">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Vad tjänsten är</h2>
            <p className="text-muted-foreground">
              SICE Review är ett verktyg som hjälper hantverkare och
              serviceföretag att samla in kundomdömen genom att skicka SMS med
              unika recensionslänkar. Du kan följa status och se insamlade
              omdömen i en dashboard.
            </p>
            <p className="text-muted-foreground">
              Tjänsten är inte en garanti för fler eller bättre recensioner, och
              vi ansvarar inte för innehållet i de omdömen som dina kunder lämnar.
              Tjänsten får inte användas för att skicka oönskad marknadsföring
              eller på sätt som strider mot gällande lag.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Betalningsvillkor</h2>
            <p className="text-muted-foreground">
              Tjänsten kostar 1 199 kr/mån exklusive moms. Rabattkoder kan sänka
              priset enligt vad som erbjuds vid tecknandet av prenumerationen.
              Avgiften faktureras månadsvis i förskott via vår
              betalningsleverantör Stripe. Det finns ingen bindningstid — du
              betalar bara för de månader du använder tjänsten.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Återbetalningspolicy</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                14 dagars provperiod – ingen debitering sker förrän efter
                provperioden
              </li>
              <li>
                Ingen återbetalning ges för påbörjad faktureringsperiod (månad
                eller år)
              </li>
              <li>
                Vid uppsägning behåller kunden tillgång till tjänsten till
                periodens slut
              </li>
              <li>
                Undantag: om tekniska fel från vår sida omöjliggjort användning
                av tjänsten hanteras återbetalning från fall till fall –
                kontakta{" "}
                <a
                  href="mailto:info@sicereview.se"
                  className="text-primary hover:underline"
                >
                  info@sicereview.se
                </a>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Ångerrätt</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Enligt distansavtalslagen har konsumenter normalt 14 dagars
                ångerrätt
              </li>
              <li>
                Genom att aktivera provperioden och börja använda tjänsten
                godkänner kunden att ångerrätten inte gäller för digitala
                tjänster som påbörjats
              </li>
              <li>
                Detta är i enlighet med 2 kap. 11 § distansavtalslagen
              </li>
              <li>
                Frågor hanteras via{" "}
                <a
                  href="mailto:info@sicereview.se"
                  className="text-primary hover:underline"
                >
                  info@sicereview.se
                </a>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Uppsägning</h2>
            <p className="text-muted-foreground">
              Du kan avsluta din prenumeration när som helst via kundportalen i
              dina inställningar. Uppsägningen träder i kraft vid slutet av den
              innevarande betalningsperioden, och du debiteras inte för
              kommande perioder.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Ansvarsbegränsning</h2>
            <p className="text-muted-foreground">
              Tjänsten tillhandahålls i befintligt skick. Vi strävar efter hög
              tillgänglighet men kan inte garantera att tjänsten alltid är fri
              från avbrott eller fel. SICE Review ansvarar inte för indirekta
              skador, utebliven vinst eller förlust av data som kan uppstå i
              samband med användningen av tjänsten. Vårt sammanlagda ansvar är
              under alla omständigheter begränsat till det belopp du betalat för
              tjänsten under de senaste tre månaderna.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Kontaktuppgifter</h2>
            <p className="text-muted-foreground">
              Har du frågor om villkoren? Kontakta oss på{" "}
              <a
                href="mailto:info@sicereview.se"
                className="text-primary hover:underline"
              >
                info@sicereview.se
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
