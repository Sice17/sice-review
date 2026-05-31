// Admin helper - updated

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
