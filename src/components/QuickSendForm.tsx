"use client";

import { useState } from "react";
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

export function QuickSendForm() {
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Något gick fel");
      }

      toast.success("SMS skickat!");
      setCustomerPhone("");
      setCustomerName("");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunde inte skicka SMS");
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="customerPhone">Telefonnummer *</Label>
            <Input
              id="customerPhone"
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
              type="text"
              placeholder="Anna Andersson"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="sm:mb-0.5">
            {loading ? "Skickar…" : "Skicka SMS"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
