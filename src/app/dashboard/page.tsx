import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/StatsCards";
import { QuickSendForm } from "@/components/QuickSendForm";
import { ReviewHistoryTable } from "@/components/ReviewHistoryTable";
import type { TransactionWithFeedback } from "@/lib/supabase/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name")
    .eq("id", user!.id)
    .maybeSingle();

  const companyName =
    (profile as { company_name?: string } | null)?.company_name ?? "";

  const { data: rows } = await supabase
    .from("transactions")
    .select("*, feedback(*)")
    .eq("contractor_id", user!.id)
    .order("created_at", { ascending: false });

  const transactions: TransactionWithFeedback[] = (rows ?? []).map((row) => {
    const feedback = Array.isArray(row.feedback)
      ? row.feedback[0] ?? null
      : row.feedback;
    const { feedback: _, ...tx } = row;
    return { ...tx, feedback };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Översikt över dina recensionsförfrågningar
        </p>
      </div>
      <StatsCards transactions={transactions} />
      <QuickSendForm companyName={companyName} />
      <div>
        <h2 className="mb-4 text-lg font-semibold">Historik</h2>
        <ReviewHistoryTable transactions={transactions} />
      </div>
    </div>
  );
}
