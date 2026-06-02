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
  feedbackId?: string;
  comment?: string | null;
};

interface ReviewFormProps {
  transactionId: string;
  submitAction: (formData: FormData) => Promise<SubmitResult>;
}

function trackGoogleClick(feedbackId: string) {
  void fetch("/api/track-google-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedbackId }),
    keepalive: true,
  });
}

interface PostSubmitOptionsProps {
  result: SubmitResult;
  isHighRating: boolean;
}

function PostSubmitOptions({ result, isHighRating }: PostSubmitOptionsProps) {
  const [showPrivateFeedback, setShowPrivateFeedback] = useState(false);
  const [privateComment, setPrivateComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [commentSaved, setCommentSaved] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const googleUrl = result.googleReviewUrl;

  async function savePrivateFeedback() {
    if (!result.feedbackId || !privateComment.trim()) {
      setCommentError("Skriv ett meddelande innan du skickar");
      return;
    }

    setSavingComment(true);
    setCommentError(null);

    try {
      const res = await fetch("/api/update-feedback-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId: result.feedbackId,
          comment: privateComment.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Kunde inte skicka feedback");
      }

      setCommentSaved(true);
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Kunde inte skicka feedback"
      );
    } finally {
      setSavingComment(false);
    }
  }

  const privateFeedbackSection = showPrivateFeedback && (
    <div className="mt-4 space-y-3 text-left">
      <Label htmlFor="private-feedback">Din feedback</Label>
      <textarea
        id="private-feedback"
        rows={4}
        className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        placeholder="Berätta gärna mer om din upplevelse…"
        value={privateComment}
        onChange={(e) => setPrivateComment(e.target.value)}
      />
      {commentError && (
        <p className="text-sm text-destructive">{commentError}</p>
      )}
      {commentSaved ? (
        <p className="text-sm text-green-600 dark:text-green-400">
          Tack! Din feedback har skickats till företaget.
        </p>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={savingComment}
          onClick={savePrivateFeedback}
        >
          {savingComment ? "Skickar…" : "Skicka feedback"}
        </Button>
      )}
    </div>
  );

  if (isHighRating) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Star className="size-6 fill-amber-400 text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold">
          Vad kul! Tack för ditt omdöme! 🎉
        </h2>

        <div className="mt-6 space-y-4">
          {googleUrl ? (
            <Button asChild size="lg" className="h-12 w-full text-base">
              <Link
                href={googleUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (result.feedbackId) {
                    trackGoogleClick(result.feedbackId);
                  }
                }}
              >
                ⭐ Lämna recension på Google
              </Link>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Google-länk saknas för detta företag.
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowPrivateFeedback((open) => !open)}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Vill du hellre skicka feedback direkt till oss?
          </button>

          {privateFeedbackSection}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      <h2 className="text-xl font-semibold">
        Tack för din feedback. Vi tar dina synpunkter på allvar.
      </h2>

      <div className="mt-6 space-y-4">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full text-base"
          onClick={() => setShowPrivateFeedback(true)}
        >
          📩 Skicka feedback direkt till oss
        </Button>

        {privateFeedbackSection}

        {googleUrl ? (
          <Link
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              if (result.feedbackId) {
                trackGoogleClick(result.feedbackId);
              }
            }}
            className="inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Vill du lämna en recension på Google istället?
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">
            Google-länk saknas för detta företag.
          </p>
        )}
      </div>
    </div>
  );
}

export function ReviewForm({ transactionId, submitAction }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
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
    formData.set("comment", "");

    const submitResult = await submitAction(formData);
    if (submitResult.error) {
      setError(submitResult.error);
      setLoading(false);
      return;
    }
    setResult({ ...submitResult, comment: null });
    setLoading(false);
  }

  if (result?.submitted && result.rating) {
    return (
      <PostSubmitOptions
        result={result}
        isHighRating={result.rating >= 4}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Ditt betyg</Label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Skickar…" : "Skicka omdöme"}
      </Button>
    </form>
  );
}
