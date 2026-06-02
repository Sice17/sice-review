import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";
import { AdminHeader } from "@/components/AdminHeader";
import { BulkEmailForm } from "@/components/BulkEmailForm";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminEmailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user.id)) {
    redirect("/dashboard");
  }

  const service = await createServiceClient();
  const { count } = await service
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .in("stripe_subscription_status", ["active", "trialing"]);

  return (
    <div className="flex min-h-full flex-col">
      <AdminHeader active="email" />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skicka email</h1>
          <p className="text-muted-foreground">
            Skicka ett meddelande till alla kunder med aktiv prenumeration
            eller provperiod
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <BulkEmailForm recipientCount={count ?? 0} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
