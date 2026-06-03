"use client";

import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TransactionWithFeedback } from "@/lib/supabase/types";

interface StatsCardsProps {
  transactions: TransactionWithFeedback[];
}

export function StatsCards({ transactions }: StatsCardsProps) {
  const total = transactions.length;
  const completed = transactions.filter((t) => t.status === "completed");
  const responseRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  const ratings = completed
    .map((t) => t.feedback?.rating)
    .filter((r): r is number => r != null);
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "—";

  const googleClicks = transactions.filter(
    (t) => t.feedback?.google_clicked
  ).length;

  const latestComment = [...completed]
    .sort(
      (a, b) =>
        new Date(b.feedback?.created_at ?? 0).getTime() -
        new Date(a.feedback?.created_at ?? 0).getTime()
    )
    .find((t) => t.feedback?.comment)?.feedback?.comment;

  const stats = [
    { title: "SMS skickade", value: String(total) },
    { title: "Svarsfrekvens", value: `${responseRate}%` },
    {
      title: "Snittbetyg",
      value: avgRating,
      icon: avgRating !== "—",
    },
    {
      title: "Google-klick",
      description: "Kunder som gått vidare till Google",
      value: String(googleClicks),
    },
    {
      title: "Senaste feedback",
      value: latestComment
        ? latestComment.length > 60
          ? `${latestComment.slice(0, 60)}…`
          : latestComment
        : "—",
      small: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            {"description" in stat && stat.description && (
              <CardDescription className="text-xs">
                {stat.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p
              className={
                stat.small
                  ? "text-sm leading-snug text-foreground"
                  : "flex items-center gap-1 text-2xl font-bold"
              }
            >
              {stat.value}
              {"icon" in stat && stat.icon && (
                <Star className="size-5 fill-amber-400 text-amber-400" />
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
