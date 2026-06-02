// Admin helper - updated

import { createClient, createServiceClient } from "@/lib/supabase/server";

export function getAdminUserIds(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_USER_IDS;
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdminUser(userId: string): boolean {
  return getAdminUserIds().includes(userId);
}

export function hasActiveSubscription(
  userId: string,
  stripeSubscriptionStatus: string | null | undefined
): boolean {
  if (isAdminUser(userId)) {
    return true;
  }

  return (
    stripeSubscriptionStatus === "active" ||
    stripeSubscriptionStatus === "trialing"
  );
}

export async function isUserBlocked(userId: string): Promise<boolean> {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", userId)
    .maybeSingle();

  return Boolean(
    (data as { is_blocked?: boolean | null } | null)?.is_blocked
  );
}

export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user.id)) {
    return null;
  }

  return user;
}
