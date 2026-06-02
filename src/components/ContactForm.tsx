"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SUBJECT_OPTIONS = [
  "Allmän fråga",
  "Teknisk support",
  "Fakturering",
  "Partnerskap",
  "Annat",
] as const;

type SubjectOption = (typeof SUBJECT_OPTIONS)[number];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<SubjectOption>("Allmän fråga");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (message.trim().length < 20) {
      setError("Meddelandet måste vara minst 20 tecken");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Kunde inte skicka meddelandet");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-800/50 bg-green-950/40 px-4 py-4 text-sm text-green-400">
        Tack! Vi har tagit emot ditt meddelande och återkommer inom 24 timmar.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Namn</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <Label htmlFor="subject">Ämne</Label>
        <select
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value as SubjectOption)}
          required
          className={cn(
            "flex h-9 w-full rounded-lg border border-input bg-secondary px-3 py-1 text-sm text-foreground shadow-xs outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
        >
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Meddelande</Label>
        <textarea
          id="message"
          rows={6}
          minLength={20}
          className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">Minst 20 tecken</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="h-11 w-full sm:w-auto" disabled={loading}>
        {loading ? "Skickar…" : "Skicka meddelande"}
      </Button>
    </form>
  );
}
