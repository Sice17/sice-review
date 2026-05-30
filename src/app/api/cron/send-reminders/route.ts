import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendReminderSMS } from "@/lib/twilio";

export const runtime = "nodejs";

interface ReminderTransaction {
  id: string;
  contractor_id: string;
  customer_name: string | null;
  customer_phone: string;
  token: string;
  created_at: string;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const now = Date.now();
  const olderThan = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const newerThan = new Date(now - 48 * 60 * 60 * 1000).toISOString();

  const { data: rows, error } = await supabase
    .from("transactions")
    .select("id, contractor_id, customer_name, customer_phone, token, created_at")
    .eq("status", "sent")
    .lt("created_at", olderThan)
    .gt("created_at", newerThan);

  if (error) {
    console.error("[cron/send-reminders] Query failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transactions = (rows ?? []) as ReminderTransaction[];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sicereview.se";

  let sent = 0;
  let failed = 0;

  for (const tx of transactions) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name, phone")
        .eq("id", tx.contractor_id)
        .maybeSingle();

      const contractorProfile = profile as
        | { company_name: string | null; phone: string | null }
        | null;

      const reviewUrl = `${appUrl}/review/${tx.token}`;

      await sendReminderSMS({
        to: tx.customer_phone,
        customerName: tx.customer_name,
        companyName: contractorProfile?.company_name || "oss",
        reviewUrl,
      });

      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "reminded" })
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
        `[cron/send-reminders] Reminder failed for transaction ${tx.id}:`,
        message
      );
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: transactions.length,
    remindersSent: sent,
    failed,
  });
}
