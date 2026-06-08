import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";

const ALLOWED_PRICE_IDS = () =>
  [process.env.STRIPE_PRICE_ID, process.env.STRIPE_YEARLY_PRICE_ID].filter(
    (id): id is string => Boolean(id)
  );

export async function POST(request: Request) {
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

  let priceId = process.env.STRIPE_PRICE_ID!;
  const contentType = request.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      priceId?: string;
    } | null;
    if (body?.priceId) {
      const allowed = ALLOWED_PRICE_IDS();
      if (!allowed.includes(body.priceId)) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
      priceId = body.priceId;
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 14 },
    success_url: `${appUrl}/dashboard`,
    cancel_url: `${appUrl}/dashboard/settings`,
  });

  return NextResponse.json({ url: session.url });
}
