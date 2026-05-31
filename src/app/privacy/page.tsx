import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integritetspolicy — SICE Review",
  description:
    "Så hanterar SICE Review dina personuppgifter enligt GDPR.",
};

export default function PrivacyPage() {
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
          Integritetspolicy
        </h1>
        <p className="mt-3 text-muted-foreground">
          Den här policyn beskriver hur SICE Review samlar in, använder och
          skyddar dina personuppgifter.
        </p>

        <div className="mt-10 space-y-10">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Vad vi samlar in</h2>
            <p className="text-muted-foreground">
              För att kunna leverera tjänsten samlar vi in följande uppgifter:
            </p>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              <li>Namn på dig och dina kunder</li>
              <li>Telefonnummer till dig och dina kunder</li>
              <li>E-postadress</li>
              <li>Företagsuppgifter (företagsnamn och faktureringsuppgifter)</li>
              <li>Recensionsdata (betyg och kommentarer från dina kunder)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Varför vi samlar in det</h2>
            <p className="text-muted-foreground">
              Vi samlar in uppgifterna för att kunna leverera tjänsten: skicka
              SMS med recensionslänkar till dina kunder, samla in och visa
              omdömen i din dashboard, hantera din prenumeration samt ge dig
              support. Uppgifterna används inte för något annat ändamål och säljs
              aldrig vidare.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Hur länge vi sparar data</h2>
            <p className="text-muted-foreground">
              Vi sparar dina uppgifter så länge du har ett aktivt konto hos oss.
              När du raderar ditt konto tas dina personuppgifter bort. Viss
              information kan behöva sparas längre om det krävs enligt lag, till
              exempel bokföringsunderlag.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              Tredjeparter vi delar data med
            </h2>
            <p className="text-muted-foreground">
              För att kunna driva tjänsten delar vi nödvändiga uppgifter med
              följande betrodda leverantörer:
            </p>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              <li>
                <span className="text-foreground">Supabase</span> — databas och
                inloggning
              </li>
              <li>
                <span className="text-foreground">Twilio</span> — utskick av SMS
              </li>
              <li>
                <span className="text-foreground">Stripe</span> — betalning och
                fakturering
              </li>
              <li>
                <span className="text-foreground">Resend</span> — utskick av
                e-post
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Dina rättigheter enligt GDPR</h2>
            <p className="text-muted-foreground">
              Enligt dataskyddsförordningen (GDPR) har du följande rättigheter:
            </p>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              <li>
                <span className="text-foreground">Rätt till tillgång</span> — du
                kan begära en kopia av de uppgifter vi har om dig
              </li>
              <li>
                <span className="text-foreground">Rätt till rättelse</span> — du
                kan begära att felaktiga uppgifter korrigeras
              </li>
              <li>
                <span className="text-foreground">Rätt till radering</span> — du
                kan begära att dina uppgifter raderas
              </li>
              <li>
                <span className="text-foreground">Rätt till dataportabilitet</span>{" "}
                — du kan begära att få ut dina uppgifter i ett maskinläsbart
                format
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Kontaktuppgifter</h2>
            <p className="text-muted-foreground">
              Har du frågor om hur vi hanterar dina personuppgifter eller vill
              utöva någon av dina rättigheter? Kontakta oss på{" "}
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
