"use client";

import { useState } from "react";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ReviewFormProps {
  transactionId: string;
  submitAction: (formData: FormData) => Promise<{ error?: string }>;
}

export function ReviewForm({ transactionId, submitAction }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
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
