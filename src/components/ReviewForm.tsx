"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type SubmitResult = {
  error?: string;
  submitted?: boolean;
  rating?: number;
  googleReviewUrl?: string | null;
  transactionId?: string;
  comment?: string | null;
};

interface ReviewFormProps {
  transactionId: string;
  submitAction: (formData: FormData) => Promise<SubmitResult>;
}

export function ReviewForm({ transactionId, submitAction }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    if (!result?.submitted || !result.transactionId || !result.rating) {
      return;
    }

    if (result.rating >= 4) {
      void fetch("/api/notify-good-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: result.transactionId,
          rating: result.rating,
          comment: result.comment ?? null,
        }),
      });
      return;
    }

    void fetch("/api/notify-bad-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction_id: result.transactionId,
        rating: result.rating,
      }),
    });
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Välj ett betyg mellan 1 och 5 stjärnor");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("transactionId", transactionId);
    formData.set("rating", String(rating));
    formData.set("comment", comment);

    const result = await submitAction(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setResult({ ...result, comment: comment || null });
    setLoading(false);
  }

  if (result?.submitted && result.rating) {
    if (result.rating >= 4) {
      return (
        <div className="rounded-xl border bg-card p-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Star className="size-6 fill-amber-400 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold">Vad kul! Tack för ditt omdöme!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Om du vill får du gärna dela samma upplevelse publikt på Google.
          </p>
          {result.googleReviewUrl ? (
            <Button asChild className="mt-5">
              <Link href={result.googleReviewUrl} target="_blank" rel="noreferrer">
                Lämna recension på Google
              </Link>
            </Button>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Google-länk saknas för detta företag.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <h2 className="text-xl font-semibold">
          Tack för din feedback. Vi tar dina synpunkter på allvar.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Din återkoppling har skickats privat till företaget.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Ditt betyg</Label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Kommentar (valfritt)</Label>
        <textarea
          id="comment"
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Berätta gärna mer om din upplevelse…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Skickar…" : "Skicka omdöme"}
      </Button>
    </form>
  );
}
