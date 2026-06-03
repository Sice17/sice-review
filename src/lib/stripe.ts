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

export interface ProfileStripeBilling {
  stripe_subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export function getSubscriptionMrrAmount(
  subscription: Stripe.Subscription
): number {
  const item = subscription.items.data[0];
  const unitAmount = item?.price?.unit_amount;
  if (unitAmount == null) {
    return 0;
  }

  let amount = unitAmount / 100;

  const interval = item.price?.recurring?.interval;
  const intervalCount = item.price?.recurring?.interval_count ?? 1;
  if (interval === "year") {
    amount = amount / (12 * intervalCount);
  }

  const coupon = subscription.discount?.coupon;
  if (coupon?.amount_off) {
    amount = Math.max(0, amount - coupon.amount_off / 100);
  } else if (coupon?.percent_off) {
    amount = amount * (1 - coupon.percent_off / 100);
  }

  return amount;
}

async function fetchProfileSubscription(
  profile: ProfileStripeBilling
): Promise<Stripe.Subscription | null> {
  if (profile.stripe_subscription_id) {
    return stripe.subscriptions.retrieve(profile.stripe_subscription_id);
  }

  if (!profile.stripe_customer_id) {
    return null;
  }

  const { data } = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: "active",
    limit: 1,
  });

  if (data[0]) {
    return data[0];
  }

  const trialing = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: "trialing",
    limit: 1,
  });

  return trialing.data[0] ?? null;
}

export async function calculateMrrFromProfiles(
  profiles: ProfileStripeBilling[]
): Promise<number> {
  const eligible = profiles.filter(
    (profile) =>
      (profile.stripe_subscription_status === "active" ||
        profile.stripe_subscription_status === "trialing") &&
      (profile.stripe_customer_id || profile.stripe_subscription_id)
  );

  const amounts = await Promise.all(
    eligible.map(async (profile) => {
      try {
        const subscription = await fetchProfileSubscription(profile);
        if (
          !subscription ||
          (subscription.status !== "active" &&
            subscription.status !== "trialing")
        ) {
          return 0;
        }

        return getSubscriptionMrrAmount(subscription);
      } catch (error) {
        console.error("[admin-mrr] Failed to fetch subscription:", {
          customerId: profile.stripe_customer_id,
          subscriptionId: profile.stripe_subscription_id,
          error,
        });
        return 0;
      }
    })
  );

  return amounts.reduce((sum, amount) => sum + amount, 0);
}
