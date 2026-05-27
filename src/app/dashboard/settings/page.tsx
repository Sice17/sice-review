import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BillingButtons } from "@/components/BillingButtons";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const isActive = profile?.stripe_subscription_status === "active";

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inställningar</h1>
        <p className="text-muted-foreground">Hantera din prenumeration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Din plan</CardTitle>
          <CardDescription>SICE Review — 799 kr/mån ex. moms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Företag</span>
            <span className="font-medium">{profile?.company_name || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Prenumeration</span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Aktiv" : profile?.stripe_subscription_status ?? "Inaktiv"}
            </Badge>
          </div>
          <BillingButtons isActive={isActive} />
        </CardContent>
      </Card>
    </div>
  );
}
