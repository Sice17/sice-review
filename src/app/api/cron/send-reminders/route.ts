import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendReminderSMS, sendFollowUpSMS } from "@/lib/twilio";

export const runtime = "nodejs";

interface ReminderTransaction {
  id: string;
  contractor_id: string;
  customer_name: string | null;
  customer_phone: string;
  token: string;
  created_at: string;
}

async function processReminders(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  transactions: ReminderTransaction[],
  appUrl: string,
  sendSms: (tx: ReminderTransaction, reviewUrl: string, companyName: string) => Promise<void>,
  nextStatus: "reminded" | "followed_up"
) {
  let sent = 0;
  let failed = 0;

  for (const tx of transactions) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", tx.contractor_id)
        .maybeSingle();

      const contractorProfile = profile as { company_name: string | null } | null;
      const reviewUrl = `${appUrl}/review/${tx.token}`;

      await sendSms(
        tx,
        reviewUrl,
        contractorProfile?.company_name || "oss"
      );

      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: nextStatus })
        .eq("id", tx.id);

      if (updateError) {
        console.error(
          `[cron/send-reminders] Failed to update transaction ${tx.id}:`,
          updateError.message
        );
        failed++;
        continue;
      }

      sent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `[cron/send-reminders] SMS failed for transaction ${tx.id}:`,
        message
      );
      failed++;
    }
  }

  return { sent, failed };
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const now = Date.now();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sicereview.se";

  const reminderOlderThan = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const reminderNewerThan = new Date(now - 48 * 60 * 60 * 1000).toISOString();

  const { data: reminderRows, error: reminderError } = await supabase
    .from("transactions")
    .select("id, contractor_id, customer_name, customer_phone, token, created_at")
    .eq("status", "sent")
    .lt("created_at", reminderOlderThan)
    .gt("created_at", reminderNewerThan);

  if (reminderError) {
    console.error("[cron/send-reminders] Reminder query failed:", reminderError.message);
    return NextResponse.json({ error: reminderError.message }, { status: 500 });
  }

  const reminderTransactions = (reminderRows ?? []) as ReminderTransaction[];

  const reminderResults = await processReminders(
    supabase,
    reminderTransactions,
    appUrl,
    async (tx, reviewUrl, companyName) => {
      await sendReminderSMS({
        to: tx.customer_phone,
        customerName: tx.customer_name,
        companyName,
        reviewUrl,
      });
    },
    "reminded"
  );

  const followUpOlderThan = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const followUpNewerThan = new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString();

  const { data: followUpRows, error: followUpError } = await supabase
    .from("transactions")
    .select("id, contractor_id, customer_name, customer_phone, token, created_at")
    .eq("status", "reminded")
    .lt("created_at", followUpOlderThan)
    .gt("created_at", followUpNewerThan);

  if (followUpError) {
    console.error("[cron/send-reminders] Follow-up query failed:", followUpError.message);
    return NextResponse.json({ error: followUpError.message }, { status: 500 });
  }

  const followUpTransactions = (followUpRows ?? []) as ReminderTransaction[];

  const followUpResults = await processReminders(
    supabase,
    followUpTransactions,
    appUrl,
    async (tx, reviewUrl) => {
      await sendFollowUpSMS({
        to: tx.customer_phone,
        customerName: tx.customer_name,
        reviewUrl,
      });
    },
    "followed_up"
  );

  return NextResponse.json({
    ok: true,
    reminderCandidates: reminderTransactions.length,
    remindersSent: reminderResults.sent,
    reminderFailed: reminderResults.failed,
    followUpCandidates: followUpTransactions.length,
    followUpsSent: followUpResults.sent,
    followUpFailed: followUpResults.failed,
  });
}
