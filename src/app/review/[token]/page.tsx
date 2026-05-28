import { createServiceClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/ReviewForm";
import { Star } from "lucide-react";

interface ReviewPageProps {
  params: Promise<{ token: string }>;
}

async function submitFeedback(formData: FormData) {
  "use server";

  const transactionId = formData.get("transactionId") as string;
  const rating = Number(formData.get("rating"));
  const comment = (formData.get("comment") as string) || null;

  if (!transactionId || rating < 1 || rating > 5) {
    return { error: "Ogiltigt betyg" };
  }

  const supabase = await createServiceClient();

  const { data: transaction } = await supabase
    .from("transactions")
    .select("id, status, contractor_id")
    .eq("id", transactionId)
    .single();

  if (!transaction) {
    return { error: "Transaktionen hittades inte" };
  }

  if (transaction.status === "completed") {
    return { error: "Du har redan lämnat ett omdöme" };
  }

  const { error: feedbackError } = await supabase.from("feedback").insert({
    transaction_id: transactionId,
    rating,
    comment: comment || null,
  });

  if (feedbackError) {
    return { error: feedbackError.message };
  }

  await supabase
    .from("transactions")
    .update({ status: "completed" })
    .eq("id", transactionId);

  const { data: profile } = await supabase
    .from("profiles")
    .select("google_review_url")
    .eq("id", transaction.contractor_id)
    .maybeSingle();

  return {
    submitted: true,
    rating,
    googleReviewUrl:
      (profile as { google_review_url?: string | null } | null)
        ?.google_review_url ?? null,
    transactionId,
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { token } = await params;
  const supabase = await createServiceClient();

  const { data: transaction } = await supabase
    .from("transactions")
    .select("id, status, customer_name, contractor_id")
    .eq("token", token)
    .single();

  if (!transaction) {
    return (
      <div className="flex min-h-full items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Länken hittades inte</h1>
          <p className="mt-2 text-muted-foreground">
            Kontrollera att du har rätt länk från SMS:et.
          </p>
        </div>
      </div>
    );
  }

  if (transaction.status === "completed") {
    return (
      <div className="flex min-h-full items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Star className="size-8 fill-amber-400 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold">Tack!</h1>
          <p className="mt-2 text-muted-foreground">
            Du har redan lämnat ett omdöme.
          </p>
        </div>
      </div>
    );
  }

  if (transaction.status === "sent") {
    await supabase
      .from("transactions")
      .update({ status: "opened" })
      .eq("id", transaction.id);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, google_review_url")
    .eq("id", transaction.contractor_id)
    .single();

  const companyName = profile?.company_name || "Företaget";

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Recension för
          </p>
          <h1 className="mt-1 text-3xl font-bold">{companyName}</h1>
          {transaction.customer_name && (
            <p className="mt-2 text-muted-foreground">
              Hej {transaction.customer_name}! Hur var din upplevelse?
            </p>
          )}
        </div>
        <ReviewForm
          transactionId={transaction.id}
          submitAction={submitFeedback}
        />
      </div>
    </div>
  );
}
