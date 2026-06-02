import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUserIds, hasActiveSubscription } from "@/lib/admin";
import {
  generateMilestoneEmail,
  milestoneEmailSubject,
} from "@/lib/emails/milestoneEmail";

export const runtime = "nodejs";

interface ProfileRow {
  id: string;
  company_name: string | null;
  stripe_subscription_status: string | null;
  milestone_10_sent: boolean | null;
  milestone_25_sent: boolean | null;
  milestone_50_sent: boolean | null;
}

const MILESTONES = [
  { count: 10, field: "milestone_10_sent" as const },
  { count: 25, field: "milestone_25_sent" as const },
  { count: 50, field: "milestone_50_sent" as const },
];

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
  const fromAddress = "SICE Review <noreply@sicereview.se>";
  const adminIds = new Set(getAdminUserIds());

  const { data: profilesData, error } = await supabase
    .from("profiles")
    .select(
      "id, company_name, stripe_subscription_status, milestone_10_sent, milestone_25_sent, milestone_50_sent"
    );

  if (error) {
    console.error("[check-milestones] Profile query failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const profiles = (profilesData ?? []) as ProfileRow[];
  let milestonesSent = 0;

  for (const profile of profiles) {
    const isEligible =
      adminIds.has(profile.id) ||
      hasActiveSubscription(profile.id, profile.stripe_subscription_status);

    if (!isEligible) {
      continue;
    }

    const { data: transactions } = await supabase
      .from("transactions")
      .select("id, feedback(id)")
      .eq("contractor_id", profile.id)
      .eq("status", "completed");

    const reviewCount = (transactions ?? []).filter((tx) => {
      const feedback = Array.isArray(tx.feedback)
        ? tx.feedback[0]
        : tx.feedback;
      return feedback != null;
    }).length;

    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(profile.id);

    if (authError || !authUser?.user?.email) {
      continue;
    }

    for (const milestone of MILESTONES) {
      if (reviewCount < milestone.count || profile[milestone.field]) {
        continue;
      }

      const { error: emailError } = await resend.emails.send({
        from: fromAddress,
        to: authUser.user.email,
        subject: milestoneEmailSubject(milestone.count),
        html: generateMilestoneEmail(
          profile.company_name || "Ditt företag",
          milestone.count
        ),
      });

      if (emailError) {
        console.error(
          `[check-milestones] Email failed for ${profile.id} @ ${milestone.count}:`,
          emailError
        );
        continue;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ [milestone.field]: true })
        .eq("id", profile.id);

      if (updateError) {
        console.error(
          `[check-milestones] Flag update failed for ${profile.id}:`,
          updateError.message
        );
        continue;
      }

      profile[milestone.field] = true;
      milestonesSent += 1;
    }
  }

  return NextResponse.json({ ok: true, milestonesSent });
}
