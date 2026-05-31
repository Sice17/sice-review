import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = await getOrCreateStripeCustomer({
    userId: user.id,
    email: user.email,
    companyName: (profile as { company_name?: string } | null)?.company_name ?? "",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 14 },
    success_url: `${appUrl}/dashboard`,
    cancel_url: `${appUrl}/dashboard/settings`,
  });

  return NextResponse.json({ url: session.url });
}
