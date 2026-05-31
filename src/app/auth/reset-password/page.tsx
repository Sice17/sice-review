"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Check, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
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

type Status = "verifying" | "ready" | "error";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase may send users here via two formats:
  //   Query OTP: /auth/reset-password?token_hash=...&type=recovery
  //   Hash:      /auth/reset-password#access_token=...&type=recovery
  // We try the query flow first (verifyOtp); otherwise we wait for the client
  // to auto-exchange the hash token and fire PASSWORD_RECOVERY.
  useEffect(() => {
    const supabase = createClient();
    let resolved = false;
    let subscription: { unsubscribe: () => void } | undefined;

    const succeed = () => {
      if (!resolved) {
        resolved = true;
        setStatus("ready");
      }
    };

    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    // If a session already exists (e.g. established server-side by
    // /auth/callback), we're ready immediately.
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) succeed();
    });

    if (tokenHash && type === "recovery") {
      // Format 2 — query param OTP
      void supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: "recovery" })
        .then(({ error }) => {
          if (!error) succeed();
        });
    } else {
      // Format 1 — hash token. The client auto-exchanges it and fires
      // PASSWORD_RECOVERY (or SIGNED_IN with a session).
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          succeed();
        }
      });
      subscription = data.subscription;
    }

    // If neither method establishes a session within 5s, show the error state.
    const timeout = setTimeout(() => {
      if (!resolved) setStatus("error");
    }, 5000);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams]);

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

    if (error) {
      setLoading(false);
      toast.error(error.message || "Kunde inte uppdatera lösenordet");
      return;
    }

    // Clear the recovery session so the user logs in fresh with the new password
    await supabase.auth.signOut();
    setLoading(false);
    setDone(true);

    toast.success("Lösenordet är uppdaterat! Logga in med ditt nya lösenord.");
    setTimeout(() => {
      router.push("/auth/login");
      router.refresh();
    }, 3000);
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <span className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        SICE Review
      </span>
      <Card className="w-full max-w-md rounded-xl shadow-lg">
        {done ? (
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle className="size-14 text-green-600 dark:text-green-500" />
            <h1 className="text-xl font-bold tracking-tight">
              Lösenordet är uppdaterat!
            </h1>
            <p className="text-sm text-muted-foreground">
              Du skickas vidare till inloggningssidan om några sekunder…
            </p>
          </CardContent>
        ) : status === "verifying" ? (
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Verifierar återställningslänk...
            </p>
          </CardContent>
        ) : status === "error" ? (
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <AlertCircle className="size-14 text-destructive" />
            <h1 className="text-xl font-bold tracking-tight">Ogiltig länk</h1>
            <p className="text-sm text-muted-foreground">
              Ingen giltig återställningssession. Begär en ny
              återställningslänk.
            </p>
            <Button asChild className="mt-2">
              <Link href="/auth/login">Till inloggning</Link>
            </Button>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Återställ lösenord</CardTitle>
              <CardDescription>
                Välj ett nytt lösenord för ditt konto
              </CardDescription>
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
                    <PasswordRequirement
                      met={hasMinLength}
                      label="Minst 8 tecken"
                    />
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
          </>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center px-4 py-12">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
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
