import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendReviewSMS } from "@/lib/twilio";
import { isValidSwedishPhone, normalizeSwedishPhone } from "@/lib/utils";
import { hasActiveSubscription, isUserBlocked } from "@/lib/admin";

const bodySchema = z.object({
  customerPhone: z.string().min(1),
  customerName: z.string().optional(),
});

export async function POST(request: Request) {
  console.log("[send-review] POST called");

  const twilioConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  );
  console.log("[send-review] Twilio configured:", twilioConfigured);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("[send-review] Unauthorized — no user session");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (await isUserBlocked(user.id)) {
    return NextResponse.json(
      {
        success: false,
        error: "Ditt konto är inaktiverat. Kontakta support.",
      },
      { status: 403 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, stripe_subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const typedProfile = profile as
    | { company_name?: string; stripe_subscription_status?: string }
    | null;

  if (
    !typedProfile ||
    !hasActiveSubscription(user.id, typedProfile.stripe_subscription_status)
  ) {
    return NextResponse.json(
      { success: false, error: "Aktiv prenumeration krävs för att skicka SMS" },
      { status: 403 }
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Ogiltig begäran" },
      { status: 400 }
    );
  }

  if (!isValidSwedishPhone(body.customerPhone)) {
    return NextResponse.json(
      { success: false, error: "Ogiltigt svenskt telefonnummer" },
      { status: 400 }
    );
  }

  const customerPhone = normalizeSwedishPhone(body.customerPhone);

  const { data: transaction, error: insertError } = await supabase
    .from("transactions")
    .insert({
      contractor_id: user.id,
      customer_phone: customerPhone,
      customer_name: body.customerName || null,
    })
    .select()
    .single();

  const savedTransaction = transaction as
    | {
        id: string;
        token: string;
        customer_phone: string;
        customer_name: string | null;
        status: string;
        created_at: string;
      }
    | null;

  if (insertError || !savedTransaction) {
    console.error("[send-review] Insert failed:", insertError?.message);
    return NextResponse.json(
      {
        success: false,
        error: insertError?.message ?? "Kunde inte skapa transaktion",
      },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const reviewUrl = `${appUrl}/review/${savedTransaction.token}`;

  try {
    await sendReviewSMS({
      to: customerPhone,
      customerName: body.customerName,
      companyName: typedProfile?.company_name || "oss",
      reviewUrl,
    });
    console.log("[send-review] SMS sent to", customerPhone);
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMS kunde inte skickas";
    console.error("[send-review] SMS failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    transaction: savedTransaction,
  });
}
