"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  buildSmsMessage,
  DEFAULT_SMS_TEMPLATE,
  SMS_TEMPLATE_MAX_LENGTH,
} from "@/lib/sms-template";

interface SmsTemplateEditorProps {
  initialTemplate: string | null;
  companyName: string;
  onSave: (template: string) => Promise<{ error?: string }>;
}

export function SmsTemplateEditor({
  initialTemplate,
  companyName,
  onSave,
}: SmsTemplateEditorProps) {
  const [template, setTemplate] = useState(
    initialTemplate?.trim() || DEFAULT_SMS_TEMPLATE
  );
  const [loading, setLoading] = useState(false);

  const preview = buildSmsMessage(template, {
    namn: "Anna",
    företag: companyName.trim() || "Ditt företag",
    länk: "https://sicereview.se/review/xxxx",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (template.length > SMS_TEMPLATE_MAX_LENGTH) {
      toast.error(`Max ${SMS_TEMPLATE_MAX_LENGTH} tecken`);
      return;
    }

    setLoading(true);
    try {
      const result = await onSave(template.trim());
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("SMS-mall sparad");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunde inte spara");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sms_template">SMS-mall</Label>
        <textarea
          id="sms_template"
          rows={4}
          maxLength={SMS_TEMPLATE_MAX_LENGTH}
          className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Använd {"{namn}"}, {"{företag}"} och {"{länk}"} som platshållare.
        </p>
        <p
          className={`text-xs ${
            template.length > SMS_TEMPLATE_MAX_LENGTH
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {template.length}/{SMS_TEMPLATE_MAX_LENGTH} tecken
        </p>
      </div>

      <div className="space-y-2">
        <Label>Förhandsgranskning</Label>
        <div className="max-w-md rounded-2xl rounded-bl-sm bg-[#2f2f2f] px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
          {preview}
        </div>
        <p className="text-xs text-muted-foreground">{preview.length} tecken</p>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Sparar…" : "Spara"}
      </Button>
    </form>
  );
}
