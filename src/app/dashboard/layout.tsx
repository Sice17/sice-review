import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/DashboardNav";
import { hasActiveSubscription, isAdminUser } from "@/lib/admin";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isActive = hasActiveSubscription(
    user.id,
    profile?.stripe_subscription_status
  );

  const isTrialing = profile?.stripe_subscription_status === "trialing";

  return (
    <div className="flex min-h-full flex-col">
      {isTrialing ? (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 text-center text-sm text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100">
          Du är i din kostnadsfria provperiod. Efter 14 dagar aktiveras din
          prenumeration automatiskt.
        </div>
      ) : (
        !isActive && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-sm text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100">
            Din prenumeration är inaktiv.{" "}
            <Link
              href="/dashboard/settings"
              className="font-medium underline underline-offset-2"
            >
              Aktivera prenumeration
            </Link>{" "}
            för att skicka SMS.
          </div>
        )
      )}
      <DashboardNav
        companyName={profile?.company_name ?? ""}
        isAdmin={isAdminUser(user.id)}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
