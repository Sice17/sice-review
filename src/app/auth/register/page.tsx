"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Check, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-ZÅÄÖ]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordValid = hasMinLength && hasUppercase && hasNumber;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = passwordValid && passwordsMatch && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!passwordValid) {
      toast.error("Lösenordet uppfyller inte alla krav");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Lösenorden matchar inte");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { company_name: companyName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Fire-and-forget welcome email — don't block the success screen on it
    void fetch("/api/send-welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, companyName }),
    }).catch(() => {
      // Welcome email failures shouldn't affect the signup flow
    });

    // Show a confirmation screen — the user must confirm their email first.
    // No redirect and no Stripe checkout here; subscriptions are started
    // later from the settings page.
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <span className="mb-6 text-2xl font-bold tracking-tight text-foreground">
          SICE Review
        </span>
        <Card className="w-full max-w-md rounded-xl shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle className="size-14 text-green-600 dark:text-green-500" />
            <h1 className="text-xl font-bold tracking-tight">
              Kolla din e-post! 📬
            </h1>
            <p className="text-sm text-muted-foreground">
              Vi har skickat en bekräftelselänk till{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Klicka på länken i mailet för att aktivera ditt konto och komma
              igång.
            </p>
            <p className="text-xs text-muted-foreground">
              Kom inte mailet fram? Kolla skräpposten.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <span className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        SICE Review
      </span>
      <Card className="w-full max-w-md rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle>Skapa konto</CardTitle>
          <CardDescription>Starta din provperiod med SICE Review</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Företagsnamn</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <ul className="space-y-1 pt-1">
                <PasswordRequirement met={hasMinLength} label="Minst 8 tecken" />
                <PasswordRequirement
                  met={hasUppercase}
                  label="Minst en stor bokstav"
                />
                <PasswordRequirement met={hasNumber} label="Minst en siffra" />
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">
                  Lösenorden matchar inte
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {loading ? "Skapar konto…" : "Registrera"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Genom att registrera dig godkänner du våra{" "}
              <Link
                href="/terms"
                className="text-primary underline-offset-4 hover:underline"
              >
                Användarvillkor
              </Link>{" "}
              och{" "}
              <Link
                href="/privacy"
                className="text-primary underline-offset-4 hover:underline"
              >
                Integritetspolicy
              </Link>
              .
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Har du redan konto?{" "}
              <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
                Logga in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-xs transition-colors",
        met ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
      )}
    >
      {met ? (
        <Check className="size-3.5 shrink-0" />
      ) : (
        <X className="size-3.5 shrink-0" />
      )}
      {label}
    </li>
  );
}
