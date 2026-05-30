import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BillingButtons } from "@/components/BillingButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { WidgetEmbed } from "@/components/WidgetEmbed";

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

  async function saveGoogleReviewUrl(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const googleReviewUrl = String(formData.get("google_review_url") ?? "").trim();

    await supabase
      .from("profiles")
      .update({ google_review_url: googleReviewUrl || null })
      .eq("id", user.id);

    revalidatePath("/dashboard/settings");
  }

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

      <Card>
        <CardHeader>
          <CardTitle>Google recensioner</CardTitle>
          <CardDescription>
            Lägg till din publika Google-recensionslänk för att skicka nöjda kunder
            vidare efter 4–5 stjärnor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveGoogleReviewUrl} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google_review_url">Din Google recensionslänk</Label>
              <Input
                id="google_review_url"
                name="google_review_url"
                type="url"
                placeholder="https://g.page/r/YOUR_ID/review"
                defaultValue={profile?.google_review_url ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                Hämta länken från din Google Business-profil under “Be om recensioner”.
              </p>
            </div>
            <Button type="submit">Spara</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recensionswidget</CardTitle>
          <CardDescription>
            Klistra in denna kod på din hemsida för att visa dina bästa
            recensioner automatiskt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WidgetEmbed companyId={user!.id} />
        </CardContent>
      </Card>
    </div>
  );
}
