"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface WeeklyReportToggleProps {
  initialEnabled: boolean;
}

export function WeeklyReportToggle({ initialEnabled }: WeeklyReportToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function handleChange(checked: boolean) {
    const previous = enabled;
    setEnabled(checked);
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEnabled(previous);
      setSaving(false);
      toast.error("Du måste vara inloggad");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ weekly_report_enabled: checked })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setEnabled(previous);
      toast.error("Kunde inte spara inställningen");
      return;
    }

    toast.success(
      checked ? "Veckorapport aktiverad" : "Veckorapport avstängd"
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <Label htmlFor="weekly-report-toggle">Veckorapport via email</Label>
        <p className="text-sm text-muted-foreground">
          Få en sammanfattning av veckans recensioner skickad till din email
          varje måndag.
        </p>
      </div>
      <Switch
        id="weekly-report-toggle"
        checked={enabled}
        onCheckedChange={handleChange}
        disabled={saving}
      />
    </div>
  );
}
