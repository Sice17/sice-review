import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";
import { isActiveSubscriptionStatus } from "@/lib/subscription-status";
import {
  AdminCustomerTable,
  type AdminCustomerRow,
} from "@/components/AdminCustomerTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileRow {
  id: string;
  company_name: string | null;
  stripe_subscription_status: string | null;
  created_at: string;
}

interface FeedbackRow {
  rating: number | null;
  google_clicked: boolean | null;
}

interface TransactionRow {
  id: string;
  contractor_id: string;
  status: string;
  feedback: FeedbackRow | FeedbackRow[] | null;
}

interface ContractorStats {
  total: number;
  completed: number;
  ratingSum: number;
  ratingCount: number;
  googleClicks: number;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user.id)) {
    redirect("/dashboard");
  }

  const service = await createServiceClient();

  const [{ data: profilesData }, { data: txData }, { data: usersData }] =
    await Promise.all([
      service
        .from("profiles")
        .select("id, company_name, stripe_subscription_status, created_at")
        .order("created_at", { ascending: false }),
      service
        .from("transactions")
        .select("id, contractor_id, status, feedback(rating, google_clicked)"),
      service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

  const profiles = (profilesData ?? []) as ProfileRow[];
  const transactions = (txData ?? []) as TransactionRow[];

  const emailById = new Map<string, string>(
    (usersData?.users ?? []).map((u) => [u.id, u.email ?? "—"])
  );

  const statsByContractor = new Map<string, ContractorStats>();
  for (const tx of transactions) {
    const stats =
      statsByContractor.get(tx.contractor_id) ??
      ({
        total: 0,
        completed: 0,
        ratingSum: 0,
        ratingCount: 0,
        googleClicks: 0,
      } satisfies ContractorStats);

    stats.total += 1;
    if (tx.status === "completed") stats.completed += 1;

    const feedback = Array.isArray(tx.feedback)
      ? tx.feedback[0] ?? null
      : tx.feedback;
    if (feedback?.rating != null) {
      stats.ratingSum += feedback.rating;
      stats.ratingCount += 1;
    }
    if (feedback?.google_clicked) stats.googleClicks += 1;

    statsByContractor.set(tx.contractor_id, stats);
  }

  const customers: AdminCustomerRow[] = profiles.map((profile) => {
    const stats = statsByContractor.get(profile.id);
    const total = stats?.total ?? 0;
    const completed = stats?.completed ?? 0;
    const ratingCount = stats?.ratingCount ?? 0;

    return {
      id: profile.id,
      companyName: profile.company_name ?? "",
      email: emailById.get(profile.id) ?? "—",
      subscriptionStatus: profile.stripe_subscription_status,
      totalSms: total,
      responseRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgRating:
        ratingCount > 0
          ? ((stats?.ratingSum ?? 0) / ratingCount).toFixed(1)
          : "—",
      googleClicks: stats?.googleClicks ?? 0,
      createdAt: profile.created_at,
    };
  });

  const totalCustomers = customers.length;
  const activeSubscribers = profiles.filter((p) =>
    isActiveSubscriptionStatus(p.stripe_subscription_status)
  ).length;
  const totalSmsSent = transactions.length;

  const summary = [
    { title: "Kunder totalt", value: String(totalCustomers) },
    { title: "Aktiva prenumeranter", value: String(activeSubscribers) },
    { title: "SMS skickade totalt", value: String(totalSmsSent) },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">SICE Review</span>
            <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-500">
              Admin
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Till dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kunder</h1>
          <p className="text-muted-foreground">
            Översikt över alla konton på SICE Review
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summary.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <AdminCustomerTable customers={customers} />
      </main>
    </div>
  );
}
