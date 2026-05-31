"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isValidSwedishPhone } from "@/lib/utils";

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text) as { success?: boolean; error?: string };
  } catch {
    throw new Error(text.slice(0, 200) || "Ogiltigt svar från servern");
  }
}

interface QuickSendFormProps {
  companyName?: string;
}

export function QuickSendForm({ companyName }: QuickSendFormProps) {
  const router = useRouter();
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  const previewName = customerName.trim() || "kunden";
  const previewCompany = companyName?.trim() || "ditt företag";
  const smsPreview = `Hej ${previewName}! Tack för att du anlitade ${previewCompany}. Vi uppskattar om du tar 30 sekunder och delar din upplevelse: https://sicereview.se/review/xxxx 🙏`;

  async function sendReview() {
    if (!isValidSwedishPhone(customerPhone)) {
      toast.error("Ange ett giltigt svenskt mobilnummer (07x eller +46)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/send-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone,
          customerName: customerName || undefined,
        }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok || data.success === false) {
        throw new Error(data.error ?? "Något gick fel");
      }

      toast.success("SMS skickat!");
      setCustomerPhone("");
      setCustomerName("");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kunde inte skicka SMS";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skicka recensionsförfrågan</CardTitle>
        <CardDescription>
          Kunden får ett SMS med en unik länk för att lämna omdöme.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void sendReview();
          }}
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="customerPhone">Telefonnummer *</Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              placeholder="070-123 45 67"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="customerName">Kundnamn (valfritt)</Label>
            <Input
              id="customerName"
              name="customerName"
              type="text"
              placeholder="Anna Andersson"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:mb-0.5 sm:w-auto"
          >
            {loading ? "Skickar…" : "Skicka SMS"}
          </Button>
        </form>

        <div className="mt-6 space-y-2">
          <Label>Förhandsgranskning av SMS</Label>
          <div className="max-w-md rounded-2xl rounded-bl-sm bg-[#2f2f2f] px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
            {smsPreview}
          </div>
          <p className="text-xs text-muted-foreground">
            {smsPreview.length} tecken
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
