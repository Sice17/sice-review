import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { companyNameToSlug } from "@/lib/sms-template";

interface PublicReviewPageProps {
  params: Promise<{ slug: string }>;
}

interface ProfileRow {
  id: string;
  company_name: string | null;
}

interface FeedbackRow {
  rating: number;
  comment: string | null;
  created_at: string;
}

interface TransactionRow {
  id: string;
  created_at: string;
  feedback: FeedbackRow | FeedbackRow[] | null;
}

function normalizeFeedback(
  feedback: FeedbackRow | FeedbackRow[] | null
): FeedbackRow | null {
  return Array.isArray(feedback) ? feedback[0] ?? null : feedback;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`size-4 ${
        index < rating
          ? "fill-amber-400 text-amber-400"
          : "fill-muted text-muted"
      }`}
    />
  ));
}

export default async function PublicReviewPage({ params }: PublicReviewPageProps) {
  const { slug } = await params;
  const service = await createServiceClient();

  const { data: profilesData } = await service
    .from("profiles")
    .select("id, company_name")
    .not("company_name", "is", null);

  const profiles = (profilesData ?? []) as ProfileRow[];
  const profile = profiles.find(
    (row) => row.company_name && companyNameToSlug(row.company_name) === slug
  );

  if (!profile) {
    notFound();
  }

  const { data: txData } = await service
    .from("transactions")
    .select("id, created_at, feedback(rating, comment, created_at)")
    .eq("contractor_id", profile.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const transactions = (txData ?? []) as TransactionRow[];

  const reviews = transactions
    .map((tx) => {
      const feedback = normalizeFeedback(tx.feedback);
      if (!feedback || feedback.rating < 4 || !feedback.comment?.trim()) {
        return null;
      }
      return {
        rating: feedback.rating,
        comment: feedback.comment.trim(),
        createdAt: feedback.created_at,
      };
    })
    .filter((review): review is NonNullable<typeof review> => review != null)
    .slice(0, 10);

  const allRatings = transactions
    .map((tx) => normalizeFeedback(tx.feedback)?.rating)
    .filter((rating): rating is number => rating != null);

  const totalReviews = allRatings.length;
  const averageRating =
    totalReviews > 0
      ? (allRatings.reduce((sum, rating) => sum + rating, 0) / totalReviews).toFixed(
          1
        )
      : null;

  const companyName = profile.company_name || "Företaget";

  return (
    <div className="flex min-h-full flex-col bg-background">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <div className="text-center">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Recensioner för
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{companyName}</h1>
          {averageRating && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(Number(averageRating)))}
              </div>
              <p className="text-sm text-muted-foreground">
                {averageRating} av 5 · {totalReviews}{" "}
                {totalReviews === 1 ? "recension" : "recensioner"}
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 space-y-4">
          {reviews.length === 0 ? (
            <p className="rounded-xl border bg-card px-6 py-10 text-center text-muted-foreground">
              Inga publicerade recensioner med kommentarer ännu.
            </p>
          ) : (
            reviews.map((review, index) => (
              <article
                key={`${review.createdAt}-${index}`}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  “{review.comment}”
                </p>
              </article>
            ))
          )}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <Link
          href="https://sicereview.se"
          className="transition-colors hover:text-foreground"
        >
          Powered by SICE Review
        </Link>
      </footer>
    </div>
  );
}
