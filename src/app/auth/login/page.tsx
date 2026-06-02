"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type View = "login" | "reset" | "sent";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("login");
  const [resetEmail, setResetEmail] = useState("");
  const [sentTo, setSentTo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message =
        error.message === "Invalid login credentials"
          ? "Felaktig e-post eller lösenord. Har du bekräftat din e-postadress?"
          : error.message;
      toast.error(message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo:
        "https://sicereview.se/auth/callback?token_hash=&type=recovery",
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setSentTo(resetEmail);
    setView("sent");
    setLoading(false);
  }

  function backToLogin() {
    setView("login");
    setResetEmail("");
  }

  const subtitle =
    view === "login"
      ? "Logga in på ditt konto"
      : "Återställ ditt lösenord";

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-1.5 text-center">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          SICE Review
        </span>
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>
      <Card className="w-full max-w-md gap-0 rounded-xl border-t-4 border-t-blue-600 py-0 shadow-lg">
        {view === "login" && (
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setView("reset");
                    }}
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Glömt lösenord?
                  </button>
                </div>
              </div>
              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? "Loggar in…" : "Logga in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Inget konto?{" "}
                <Link
                  href="/auth/register"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Registrera dig
                </Link>
              </p>
            </form>
          </CardContent>
        )}

        {view === "reset" && (
          <CardContent className="p-8">
            <form onSubmit={handleReset} className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Ange din e-post så skickar vi en återställningslänk.
              </p>
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-post</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? "Skickar…" : "Skicka återställningslänk"}
              </Button>
              <p className="text-center text-sm">
                <button
                  type="button"
                  onClick={backToLogin}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Tillbaka till inloggning
                </button>
              </p>
            </form>
          </CardContent>
        )}

        {view === "sent" && (
          <CardContent className="space-y-5 p-8">
            <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
              Kolla din e-post! Vi har skickat en återställningslänk till{" "}
              {sentTo}.
            </p>
            <p className="text-center text-sm">
              <button
                type="button"
                onClick={backToLogin}
                className="text-primary underline-offset-4 hover:underline"
              >
                Tillbaka till inloggning
              </button>
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
