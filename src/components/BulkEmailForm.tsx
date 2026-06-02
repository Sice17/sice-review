"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BulkEmailFormProps {
  recipientCount: number;
}

export function BulkEmailForm({ recipientCount }: BulkEmailFormProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!subject.trim() || !body.trim()) {
      toast.error("Fyll i ämne och meddelande");
      return;
    }

    if (
      !confirm(
        `Skicka email till ${recipientCount} aktiva kunder? Detta kan inte ångras.`
      )
    ) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/send-bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });

      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        failed?: number;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Kunde inte skicka email");
      }

      setResult({ sent: data.sent ?? 0, failed: data.failed ?? 0 });
      toast.success(`Skickat till ${data.sent} kunder`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="subject">Ämne</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="T.ex. Viktig uppdatering från SICE Review"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Meddelande</Label>
        <textarea
          id="body"
          rows={8}
          className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Skriv ditt meddelande här…"
          required
        />
        <p className="text-xs text-muted-foreground">
          Vanlig text. Varje rad blir ett stycke i mailet.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{recipientCount}</span>{" "}
        aktiva kunder kommer att få detta email (prenumeration aktiv eller
        provperiod).
      </div>

      {result && (
        <div className="rounded-lg border border-green-800/50 bg-green-950/50 px-4 py-3 text-sm text-green-400">
          Skickat: {result.sent} · Misslyckades: {result.failed}
        </div>
      )}

      <Button type="submit" className="h-11" disabled={loading || recipientCount === 0}>
        {loading ? "Skickar…" : "Skicka till alla aktiva kunder"}
      </Button>
    </form>
  );
}
