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
import { WeeklyReportToggle } from "@/components/WeeklyReportToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { DataManagement } from "@/components/DataManagement";
import { SmsTemplateEditor } from "@/components/SmsTemplateEditor";
import { PublicReviewPageSection } from "@/components/PublicReviewPageSection";
import { SettingsTabs } from "@/components/SettingsTabs";
import { SMS_TEMPLATE_MAX_LENGTH } from "@/lib/sms-template";

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

  const subscriptionStatus = profile?.stripe_subscription_status ?? null;
  const hasPlan =
    subscriptionStatus === "active" ||
    subscriptionStatus === "trialing" ||
    subscriptionStatus === "past_due";

  const statusBadge =
    subscriptionStatus === "active"
      ? {
          label: "Aktiv",
          className: "bg-[#052e16] text-[#16a34a] border-[#16a34a]",
        }
      : subscriptionStatus === "trialing"
        ? {
            label: "Provperiod aktiv",
            className: "bg-[#0c1f3d] text-[#60a5fa] border-[#2563eb]",
          }
        : subscriptionStatus === "past_due"
          ? {
              label: "Betalning misslyckades",
              className: "bg-[#450a0a] text-[#dc2626] border-[#dc2626]",
            }
          : {
              label: "Inaktiv",
              className: "bg-[#1a1a1a] text-[#94a3b8] border-[#2a2a2a]",
            };

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

  async function saveSmsTemplate(template: string) {
    "use server";

    if (template.length > SMS_TEMPLATE_MAX_LENGTH) {
      return { error: `Max ${SMS_TEMPLATE_MAX_LENGTH} tecken` };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ sms_template: template.trim() || null })
      .eq("id", user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return {};
  }

  const smsTemplate =
    (profile as { sms_template?: string | null } | null)?.sms_template ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inställningar</h1>
        <p className="text-muted-foreground">
          Hantera konto, anpassning och säkerhet
        </p>
      </div>

      <SettingsTabs
        account={
          <>
            <Card>
              <CardHeader>
                <CardTitle>Din plan</CardTitle>
                {hasPlan && (
                  <CardDescription>
                    SICE Review — 1 199 kr/mån ex. moms
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Företag</span>
                  <span className="font-medium">
                    {profile?.company_name || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Prenumeration
                  </span>
                  <Badge variant="outline" className={statusBadge.className}>
                    {statusBadge.label}
                  </Badge>
                </div>
                <BillingButtons status={subscriptionStatus} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google recensioner</CardTitle>
                <CardDescription>
                  Lägg till din publika Google-recensionslänk för att skicka
                  nöjda kunder vidare efter 4–5 stjärnor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={saveGoogleReviewUrl} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="google_review_url">
                      Din Google recensionslänk
                    </Label>
                    <Input
                      id="google_review_url"
                      name="google_review_url"
                      type="url"
                      placeholder="https://g.page/r/YOUR_ID/review"
                      defaultValue={profile?.google_review_url ?? ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Hämta länken från din Google Business-profil under “Be om
                      recensioner”.
                    </p>
                  </div>
                  <Button type="submit">Spara</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Din publika recensionssida</CardTitle>
                <CardDescription>
                  Dela denna sida för att visa dina bästa recensioner publikt.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PublicReviewPageSection
                  companyName={profile?.company_name ?? ""}
                />
              </CardContent>
            </Card>
          </>
        }
        customize={
          <>
            <Card>
              <CardHeader>
                <CardTitle>Anpassa ditt SMS</CardTitle>
                <CardDescription>
                  Anpassa texten i recensions-SMS:et som skickas till dina
                  kunder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SmsTemplateEditor
                  initialTemplate={smsTemplate}
                  companyName={profile?.company_name ?? ""}
                  onSave={saveSmsTemplate}
                />
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

            <Card>
              <CardHeader>
                <CardTitle>Utseende</CardTitle>
                <CardDescription>
                  Anpassa hur SICE Review ser ut för dig.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeToggle />
              </CardContent>
            </Card>
          </>
        }
        notifications={
          <Card>
            <CardHeader>
              <CardTitle>Notiser</CardTitle>
              <CardDescription>
                Hantera vilka email du får från SICE Review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyReportToggle
                initialEnabled={profile?.weekly_report_enabled ?? true}
              />
            </CardContent>
          </Card>
        }
        security={
          <>
            <Card>
              <CardHeader>
                <CardTitle>Säkerhet</CardTitle>
                <CardDescription>
                  Uppdatera ditt lösenord för att hålla kontot säkert.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Din data</CardTitle>
                <CardDescription>
                  Exportera eller radera din data och ditt konto.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataManagement />
              </CardContent>
            </Card>
          </>
        }
      />
    </div>
  );
}
