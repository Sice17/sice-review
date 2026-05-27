import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendReviewSMS } from "@/lib/twilio";
import { isValidSwedishPhone, normalizeSwedishPhone } from "@/lib/utils";

const bodySchema = z.object({
  customerPhone: z.string().min(1),
  customerName: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, stripe_subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const typedProfile = profile as
    | { company_name?: string; stripe_subscription_status?: string }
    | null;

  if (!typedProfile || typedProfile.stripe_subscription_status !== "active") {
    return NextResponse.json(
      { error: "Aktiv prenumeration krävs för att skicka SMS" },
      { status: 403 }
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Ogiltig begäran" }, { status: 400 });
  }

  if (!isValidSwedishPhone(body.customerPhone)) {
    return NextResponse.json(
      { error: "Ogiltigt svenskt telefonnummer" },
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

  if (insertError || !transaction) {
    return NextResponse.json(
      { error: insertError?.message ?? "Kunde inte skapa transaktion" },
      { status: 500 }
    );
  }

  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/review/${transaction.token}`;

  try {
    await sendReviewSMS({
      to: customerPhone,
      customerName: body.customerName,
      companyName: typedProfile.company_name || "oss",
      reviewUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMS kunde inte skickas";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json(transaction);
}
