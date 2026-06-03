import Link from "next/link";
import { MessageSquare, Link2, LayoutDashboard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RecoveryRedirect } from "@/components/RecoveryRedirect";
import { LandingNavbar } from "@/components/LandingNavbar";

const STEPS = [
  {
    number: 1,
    emoji: "📱",
    title: "Skicka ett SMS",
    description:
      "Efter avslutat jobb fyller du i kundens nummer. Vi skickar ett personligt SMS på svenska.",
  },
  {
    number: 2,
    emoji: "⭐",
    title: "Kunden betygsätter",
    description:
      "Kunden klickar på länken och lämnar sitt betyg på 30 sekunder. Inga konton, inget krångel.",
  },
  {
    number: 3,
    emoji: "🚀",
    title: "Du får fler recensioner",
    description:
      "Nöjda kunder skickas direkt till din Google-sida. Missnöjda kunder når bara dig – inte Google.",
  },
] as const;

const GOOGLE_POINTS = [
  "93% av konsumenter läser recensioner innan de anlitar ett företag",
  "Företag med fler recensioner rankas högre i Google Sök",
  "En genomsnittlig kund behöver se 10+ recensioner innan de litar på ett företag",
] as const;

const FAQ_ITEMS = [
  {
    question: "Behöver mina kunder skapa ett konto?",
    answer:
      "Nej. Kunden klickar på länken i SMS:et och lämnar sitt betyg direkt – inga konton eller appar behövs.",
  },
  {
    question: "Vad händer om en kund är missnöjd?",
    answer:
      "Kunder med 1-3 stjärnor skickas inte vidare till Google. Deras feedback går direkt till dig så du kan åtgärda problemet.",
  },
  {
    question: "Kan jag avsluta när som helst?",
    answer:
      "Ja, du kan avsluta din prenumeration när som helst via din kundportal. Ingen bindningstid.",
  },
  {
    question: "Fungerar det för alla typer av serviceföretag?",
    answer:
      "Ja! SICE Review används av rörmokare, elektriker, bilmekaniker, städföretag och många fler.",
  },
  {
    question: "Hur lång är provperioden?",
    answer:
      "Du får 14 dagar gratis med full tillgång till alla funktioner. Kortuppgifter anges vid registrering men du debiteras inte förrän efter 14 dagar.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <RecoveryRedirect />
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-background dark:bg-[linear-gradient(135deg,#0f0f0f_0%,#0f172a_50%,#0f0f0f_100%)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
            <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {"Fler Google\u2011recensioner. På autopilot."}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Skicka ett SMS efter varje jobb – kunden betygsätter med ett klick.
              Nöjda kunder skickas vidare till Google. Du slipper jaga recensioner
              manuellt.
            </p>
            <Button size="lg" className="mt-8 rounded-full px-8 py-3" asChild>
              <Link href="/auth/register">Starta din 14-dagars provperiod</Link>
            </Button>
            <p className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>✓ Ingen bindningstid</span>
              <span>✓ Avsluta när som helst</span>
              <span>✓ Svensk support</span>
            </p>
          </div>
        </section>

        {/* Så här fungerar det */}
        <section className="border-t border-border bg-muted/30 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Så här enkelt är det
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <span className="mt-4 text-3xl" aria-hidden>
                    {step.emoji}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="border-t border-border py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <MessageSquare className="mb-2 size-8 text-primary" />
                <CardTitle>SMS på 10 sekunder</CardTitle>
                <CardDescription>
                  Ange telefonnummer och namn — vi skickar ett personligt SMS på
                  svenska direkt till kunden.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <Link2 className="mb-2 size-8 text-primary" />
                <CardTitle>Smart recensionsfilter</CardTitle>
                <CardDescription>
                  Nöjda kunder till Google, kritik direkt till dig – du behåller
                  kontrollen.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <LayoutDashboard className="mb-2 size-8 text-primary" />
                <CardTitle>Allt i din dashboard</CardTitle>
                <CardDescription>
                  Se svarsfrekvens, snittbetyg och alla kommentarer — perfekt
                  inför nästa offert.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Varför Google-recensioner */}
        <section className="border-t border-border py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <Card className="border-t-4 border-t-primary bg-card">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Varför är Google-recensioner så viktiga?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {GOOGLE_POINTS.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed">
                      <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                      <span className="text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                  * Baserat på konsumentundersökningar från BrightLocal 2023
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-muted/30 py-16 md:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Vanliga frågor
            </h2>
            <Accordion className="mt-10 w-full">
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger className="text-base font-medium text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-md px-4">
            <Card className="border-t-4 border-t-primary">
              <CardHeader className="text-center">
                <Badge className="mx-auto w-fit bg-[#052e16] text-[#16a34a] hover:bg-[#052e16]">
                  14 dagars gratis provperiod
                </Badge>
                <CardTitle className="mt-4 text-2xl">Professionell</CardTitle>
                <CardDescription>
                  Allt du behöver för att samla recensioner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-4xl font-bold text-foreground">
                  1 199 kr
                  <span className="text-base font-normal text-muted-foreground">
                    /mån ex. moms
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Därefter 1 199 kr/mån ex. moms. Avsluta när som helst.
                </p>
                <ul className="space-y-2 text-left text-sm text-muted-foreground">
                  <li>
                    <span className="text-primary">✓</span> Obegränsade
                    SMS-förfrågningar
                  </li>
                  <li>
                    <span className="text-primary">✓</span> Unika recensionslänkar
                    per kund
                  </li>
                  <li>
                    <span className="text-primary">✓</span> Dashboard med statistik
                  </li>
                  <li>
                    <span className="text-primary">✓</span> Stripe-fakturering
                    &amp; kundportal
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/auth/register">Starta gratis provperiod</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 text-center sm:flex-row sm:gap-4">
          <p>
            © {new Date().getFullYear()} SICE Review. Alla rättigheter
            förbehållna.
          </p>
          <nav className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground"
            >
              Kontakt
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Integritetspolicy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Användarvillkor
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
