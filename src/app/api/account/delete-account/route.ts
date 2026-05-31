import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createServiceClient();

  const { data: transactions } = await admin
    .from("transactions")
    .select("id")
    .eq("contractor_id", user.id);

  const transactionIds = (transactions ?? []).map(
    (tx: { id: string }) => tx.id
  );

  // Delete feedback linked to the user's transactions
  if (transactionIds.length > 0) {
    await admin.from("feedback").delete().in("transaction_id", transactionIds);
  }

  // Delete the user's transactions
  await admin.from("transactions").delete().eq("contractor_id", user.id);

  // Cancel the Stripe subscription if one is active
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .maybeSingle();

  const subscriptionId = (
    profile as { stripe_subscription_id?: string | null } | null
  )?.stripe_subscription_id;

  if (subscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscriptionId);
    } catch (err) {
      console.error("Failed to cancel Stripe subscription:", err);
    }
  }

  // Delete the user's profile
  await admin.from("profiles").delete().eq("id", user.id);

  // Delete the Supabase auth user
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("Failed to delete auth user:", deleteError);
    return NextResponse.json(
      { error: "Kunde inte radera kontot" },
      { status: 500 }
    );
  }

  // Clear the local session
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
