export interface SubscriptionBadge {
  label: string;
  className: string;
}

const GREEN = "bg-[#052e16] text-[#16a34a]";
const BLUE = "bg-[#0c1f3d] text-[#60a5fa]";
const AMBER = "bg-[#2e1f05] text-[#f59e0b]";
const RED = "bg-[#2e0505] text-[#f87171]";

export function subscriptionBadge(
  status: string | null | undefined
): SubscriptionBadge {
  switch (status) {
    case "active":
      return { label: "Aktiv", className: GREEN };
    case "trialing":
      return { label: "Provperiod", className: BLUE };
    case "past_due":
      return { label: "Förfallen", className: AMBER };
    case "canceled":
      return { label: "Avslutad", className: RED };
    default:
      return { label: "Inaktiv", className: "" };
  }
}

export function isActiveSubscriptionStatus(
  status: string | null | undefined
): boolean {
  return status === "active" || status === "trialing";
}
