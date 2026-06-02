"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <span className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        SICE Review
      </span>
      <Card className="w-full max-w-md rounded-xl shadow-lg">
        {view === "login" && (
          <>
            <CardHeader>
              <CardTitle>Logga in</CardTitle>
              <CardDescription>
                Välkommen tillbaka till SICE Review
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Lösenord</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setView("reset");
                      }}
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Glömt lösenord?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loggar in…" : "Logga in"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Inget konto?{" "}
                  <Link
                    href="/auth/register"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Registrera dig
                  </Link>
                </p>
              </CardFooter>
            </form>
          </>
        )}

        {view === "reset" && (
          <>
            <CardHeader>
              <CardTitle>Återställ lösenord</CardTitle>
              <CardDescription>
                Ange din e-post så skickar vi en återställningslänk
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleReset}>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Skickar…" : "Skicka återställningslänk"}
                </Button>
                <button
                  type="button"
                  onClick={backToLogin}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Tillbaka till inloggning
                </button>
              </CardFooter>
            </form>
          </>
        )}

        {view === "sent" && (
          <>
            <CardHeader>
              <CardTitle>Återställ lösenord</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
                Kolla din e-post! Vi har skickat en återställningslänk till{" "}
                {sentTo}.
              </p>
            </CardContent>
            <CardFooter>
              <button
                type="button"
                onClick={backToLogin}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Tillbaka till inloggning
              </button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
