import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

export async function getOrCreateStripeCustomer({
  userId,
  email,
  companyName,
}: {
  userId: string;
  email: string;
  companyName: string;
}): Promise<string> {
  const supabase = await createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  const existingCustomerId = (profile as { stripe_customer_id?: string } | null)
    ?.stripe_customer_id;

  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: companyName || undefined,
    metadata: { supabase_user_id: userId },
  });

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}
