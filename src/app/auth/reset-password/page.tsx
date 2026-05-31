"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase automatically parses the access token from the URL hash and
  // establishes a recovery session (detectSessionInUrl is enabled by default).
  // We call getSession() on mount to confirm the session was picked up, and
  // surface a friendly error if the link was invalid or already used.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash.includes("error")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const description = params.get("error_description");
      toast.error(
        description
          ? decodeURIComponent(description.replace(/\+/g, " "))
          : "Återställningslänken är ogiltig eller har gått ut."
      );
      return;
    }

    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        toast.error(
          "Ingen giltig återställningssession hittades. Begär en ny återställningslänk."
        );
      }
    });
  }, []);

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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Kunde inte uppdatera lösenordet");
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/auth/login");
      router.refresh();
    }, 3000);
  }

  if (done) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <span className="mb-6 text-2xl font-bold tracking-tight text-foreground">
          SICE Review
        </span>
        <Card className="w-full max-w-md rounded-xl shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle className="size-14 text-green-600 dark:text-green-500" />
            <h1 className="text-xl font-bold tracking-tight">
              Lösenordet är uppdaterat!
            </h1>
            <p className="text-sm text-muted-foreground">
              Du skickas vidare till inloggningssidan om några sekunder…
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
          <CardTitle>Återställ lösenord</CardTitle>
          <CardDescription>Välj ett nytt lösenord för ditt konto</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nytt lösenord</Label>
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
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {loading ? "Uppdaterar…" : "Uppdatera lösenord"}
            </Button>
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
