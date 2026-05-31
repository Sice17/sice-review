import Link from "next/link";
import { MessageSquare, Link2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold tracking-tight">SICE Review</span>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Logga in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Starta gratis provperiod</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-background">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
            <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl">
              Fler recensioner. Mer förtroende. Mer jobb.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              SICE Review hjälper hantverkare och serviceföretag att samla in
              äkta kundomdömen via SMS — på under 10 sekunder. Varje kund får en
              unik länk, du ser allt i din dashboard.
            </p>
            <Button size="lg" className="mt-8 rounded-full px-8 py-3" asChild>
              <Link href="/auth/register">Kom igång gratis</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
            <Card className="transition-colors hover:bg-muted">
              <CardHeader>
                <MessageSquare className="size-8 text-primary mb-2" />
                <CardTitle>Skicka SMS på 10 sekunder</CardTitle>
                <CardDescription>
                  Ange telefonnummer och namn — vi skickar ett personligt SMS på
                  svenska direkt till kunden.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-colors hover:bg-muted">
              <CardHeader>
                <Link2 className="size-8 text-primary mb-2" />
                <CardTitle>Unikt recensionslänk</CardTitle>
                <CardDescription>
                  Varje förfrågan får en säker, unik länk så du kan följa status:
                  skickad, öppnad eller klar.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-colors hover:bg-muted">
              <CardHeader>
                <LayoutDashboard className="size-8 text-primary mb-2" />
                <CardTitle>Se allt i din dashboard</CardTitle>
                <CardDescription>
                  Svarsfrekvens, snittbetyg och alla kommentarer samlade på ett
                  ställe — perfekt inför nästa offert.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-md px-4">
            <Card className="border-t-4 border-t-primary">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Professionell</CardTitle>
                <CardDescription>Allt du behöver för att samla recensioner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-4xl font-bold text-foreground">
                  1 199 kr
                  <span className="text-base font-normal text-muted-foreground">
                    /mån ex. moms
                  </span>
                </p>
                <ul className="space-y-2 text-left text-sm text-muted-foreground">
                  <li>
                    <span className="text-primary">✓</span> Obegränsade SMS-förfrågningar
                  </li>
                  <li>
                    <span className="text-primary">✓</span> Unika recensionslänkar per kund
                  </li>
                  <li>
                    <span className="text-primary">✓</span> Dashboard med statistik
                  </li>
                  <li>
                    <span className="text-primary">✓</span> Stripe-fakturering &amp; kundportal
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/auth/register">Kom igång</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 text-center sm:flex-row sm:gap-4">
          <p>© {new Date().getFullYear()} SICE Review. Alla rättigheter förbehållna.</p>
          <nav className="flex gap-4">
            <Link
              href="/privacy"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Integritetspolicy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Användarvillkor
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
