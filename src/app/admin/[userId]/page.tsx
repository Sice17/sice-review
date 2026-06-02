import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, Star } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";
import { subscriptionBadge } from "@/lib/subscription-status";
import { AdminHeader } from "@/components/AdminHeader";
import { BlockToggleButton } from "@/components/BlockToggleButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface AdminDetailPageProps {
  params: Promise<{ userId: string }>;
}

interface ProfileRow {
  id: string;
  company_name: string | null;
  stripe_subscription_status: string | null;
  is_blocked: boolean | null;
  created_at: string;
}

interface FeedbackRow {
  rating: number | null;
  comment: string | null;
  google_clicked: boolean | null;
}

interface TransactionRow {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  status: string;
  created_at: string;
  feedback: FeedbackRow | FeedbackRow[] | null;
}

const statusLabels: Record<string, string> = {
  sent: "Skickad",
  opened: "Öppnad",
  completed: "Slutförd",
  reminded: "Påminnelse skickad",
};

const statusClass: Record<string, string> = {
  completed: "bg-[#052e16] text-[#16a34a]",
  opened: "bg-[#0c1f3d] text-[#60a5fa]",
  reminded: "bg-[#2e1f05] text-[#f59e0b]",
};

function normalizeFeedback(
  feedback: FeedbackRow | FeedbackRow[] | null
): FeedbackRow | null {
  return Array.isArray(feedback) ? feedback[0] ?? null : feedback;
}

export default async function AdminDetailPage({ params }: AdminDetailPageProps) {
  const { userId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user.id)) {
    redirect("/dashboard");
  }

  const service = await createServiceClient();

  const [{ data: profileData }, { data: txData }, { data: authData }] =
    await Promise.all([
      service
        .from("profiles")
        .select(
          "id, company_name, stripe_subscription_status, is_blocked, created_at"
        )
        .eq("id", userId)
        .maybeSingle(),
      service
        .from("transactions")
        .select(
          "id, customer_name, customer_phone, status, created_at, feedback(rating, comment, google_clicked)"
        )
        .eq("contractor_id", userId)
        .order("created_at", { ascending: false }),
      service.auth.admin.getUserById(userId),
    ]);

  const profile = profileData as ProfileRow | null;

  if (!profile) {
    notFound();
  }

  const transactions = (txData ?? []) as TransactionRow[];
  const email = authData?.user?.email ?? "—";

  const total = transactions.length;
  const completed = transactions.filter((t) => t.status === "completed").length;
  const responseRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const ratings = transactions
    .map((t) => normalizeFeedback(t.feedback)?.rating)
    .filter((r): r is number => r != null);
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "—";

  const googleClicks = transactions.filter(
    (t) => normalizeFeedback(t.feedback)?.google_clicked
  ).length;

  const badge = subscriptionBadge(profile.stripe_subscription_status);
  const isBlocked = Boolean(profile.is_blocked);

  const stats = [
    { title: "SMS skickade", value: String(total) },
    { title: "Svarsfrekvens", value: `${responseRate}%` },
    { title: "Snittbetyg", value: avgRating, star: avgRating !== "—" },
    { title: "Google-klick", value: String(googleClicks) },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <AdminHeader active="customers" />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Tillbaka till kunder
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {profile.company_name || "Namnlöst företag"}
            </h1>
            <Badge variant="secondary" className={badge.className}>
              {badge.label}
            </Badge>
            {isBlocked && (
              <Badge variant="destructive">Blockerad</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span>{email}</span>
            <span>Registrerad {formatDate(profile.created_at)}</span>
            <BlockToggleButton userId={userId} isBlocked={isBlocked} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-1 text-2xl font-bold">
                  {stat.value}
                  {stat.star && (
                    <Star className="size-5 fill-amber-400 text-amber-400" />
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Transaktionshistorik</h2>
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Inga transaktioner ännu.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="hidden sm:table-cell">Datum</TableHead>
                    <TableHead>Kund</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Telefon
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Betyg</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Kommentar
                    </TableHead>
                    <TableHead className="text-center">Google-klick</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const feedback = normalizeFeedback(tx.feedback);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell>{tx.customer_name ?? "—"}</TableCell>
                        <TableCell className="hidden whitespace-nowrap sm:table-cell">
                          {tx.customer_phone}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusClass[tx.status] ?? ""}
                          >
                            {statusLabels[tx.status] ?? tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {feedback?.rating ? (
                            <span className="flex items-center gap-0.5">
                              {feedback.rating}
                              <Star className="size-4 fill-amber-400 text-amber-400" />
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="hidden max-w-[240px] truncate text-muted-foreground md:table-cell">
                          {feedback?.comment ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {feedback?.google_clicked ? (
                            <Check className="mx-auto size-4 text-[#16a34a]" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
