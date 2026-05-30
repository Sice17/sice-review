import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserIds, hasActiveSubscription } from "@/lib/admin";
import {
  generateWeeklyReportEmail,
  type WeeklyReportData,
} from "@/lib/emails/weeklyReport";

export const runtime = "nodejs";

interface ProfileRow {
  id: string;
  company_name: string | null;
  stripe_subscription_status: string | null;
  weekly_report_enabled: boolean | null;
}

interface FeedbackWithTransaction {
  rating: number;
  comment: string | null;
  created_at: string;
}

function formatSwedishDate(date: Date): string {
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
  });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey === "re_xxxxx") {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const supabase = await createServiceClient();
  const resend = new Resend(resendKey);

  const adminIds = getAdminUserIds();
  const now = Date.now();
  const weekAgoMs = now - 7 * 24 * 60 * 60 * 1000;
  const weekAgoIso = new Date(weekAgoMs).toISOString();

  const weekStart = formatSwedishDate(new Date(weekAgoMs));
  const weekEnd = formatSwedishDate(new Date(now));

  // Fetch active profiles, plus admin profiles regardless of subscription status.
  const orFilter = adminIds.length
    ? `stripe_subscription_status.eq.active,id.in.(${adminIds.join(",")})`
    : `stripe_subscription_status.eq.active`;

  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("id, company_name, stripe_subscription_status, weekly_report_enabled")
    .eq("weekly_report_enabled", true)
    .or(orFilter);

  if (profileError) {
    console.error("[cron/send-weekly-reports] Profile query failed:", profileError.message);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const profiles = (profileRows ?? []).filter((p) =>
    hasActiveSubscription(
      (p as ProfileRow).id,
      (p as ProfileRow).stripe_subscription_status
    )
  ) as ProfileRow[];

  let reportsSent = 0;
  let skipped = 0;
  let failed = 0;

  for (const profile of profiles) {
    try {
      const { count: smsSent } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("contractor_id", profile.id)
        .gte("created_at", weekAgoIso);

      const totalSms = smsSent ?? 0;

      if (totalSms === 0) {
        skipped++;
        continue;
      }

      const { count: respondedCount } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("contractor_id", profile.id)
        .gte("created_at", weekAgoIso)
        .in("status", ["opened", "completed", "reminded"]);

      const responded = respondedCount ?? 0;
      const responseRate =
        totalSms > 0 ? Math.round((responded / totalSms) * 1000) / 10 : 0;

      const { data: feedbackRows } = await supabase
        .from("feedback")
        .select("rating, comment, created_at, transactions!inner(contractor_id)")
        .eq("transactions.contractor_id", profile.id)
        .gte("created_at", weekAgoIso)
        .order("created_at", { ascending: false });

      const feedback = (feedbackRows ?? []) as unknown as FeedbackWithTransaction[];

      const ratings = feedback.map((f) => f.rating);
      const averageRating =
        ratings.length > 0
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : 0;
      const lowRatings = ratings.filter((r) => r >= 1 && r <= 3).length;
      const highRatings = ratings.filter((r) => r >= 4 && r <= 5).length;

      const recentComments = feedback
        .filter((f) => f.comment && f.comment.trim().length > 0)
        .slice(0, 3)
        .map((f) => ({
          rating: f.rating,
          comment: f.comment as string,
          date: new Date(f.created_at).toLocaleDateString("sv-SE", {
            day: "numeric",
            month: "short",
          }),
        }));

      const { data: authUser, error: authError } =
        await supabase.auth.admin.getUserById(profile.id);

      if (authError || !authUser?.user?.email) {
        console.error(
          `[cron/send-weekly-reports] No email for profile ${profile.id}`
        );
        failed++;
        continue;
      }

      const reportData: WeeklyReportData = {
        companyName: profile.company_name || "Ditt företag",
        weekStart,
        weekEnd,
        smsSent: totalSms,
        responseRate,
        averageRating,
        lowRatings,
        highRatings,
        recentComments,
      };

      const html = generateWeeklyReportEmail(reportData);

      const { error: emailError } = await resend.emails.send({
        from: "SICE Review <noreply@sicereview.se>",
        to: authUser.user.email,
        subject: "Din veckorapport från SICE Review 📊",
        html,
      });

      if (emailError) {
        console.error(
          `[cron/send-weekly-reports] Resend failed for ${profile.id}:`,
          emailError
        );
        failed++;
        continue;
      }

      reportsSent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `[cron/send-weekly-reports] Report failed for profile ${profile.id}:`,
        message
      );
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    eligibleProfiles: profiles.length,
    reportsSent,
    skipped,
    failed,
  });
}
