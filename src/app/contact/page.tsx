import Link from "next/link";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakta oss — SICE Review",
  description: "Har du frågor om SICE Review? Kontakta oss så återkommer vi inom 24 timmar.",
};

export default function ContactPage() {
  return (
    <main className="min-h-full bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Tillbaka till startsidan
        </Link>

        <div className="mt-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Kontakta oss</h1>
          <p className="text-muted-foreground">
            Har du frågor eller funderingar? Vi svarar inom 24 timmar.
          </p>
        </div>

        <Card className="mt-8 border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle>Skicka ett meddelande</CardTitle>
            <CardDescription>
              Fyll i formuläret så återkommer vi till din e-postadress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
