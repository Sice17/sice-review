"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BillingButtonsProps {
  status: string | null;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export function BillingButtons({
  status,
  monthlyPriceId,
  yearlyPriceId,
}: BillingButtonsProps) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(
    null
  );

  async function handleCheckout(plan: "monthly" | "yearly") {
    const priceId = plan === "monthly" ? monthlyPriceId : yearlyPriceId;
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kunde inte starta checkout");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kunde inte öppna portalen");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel");
      setLoading(null);
    }
  }

  const usePortal =
    status === "active" || status === "trialing" || status === "past_due";

  if (usePortal) {
    const label =
      status === "past_due" ? "Uppdatera betalning" : "Hantera prenumeration";
    return (
      <Button onClick={handlePortal} disabled={loading !== null}>
        {loading === "portal" ? "Laddar…" : label}
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Aktivera prenumeration</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="font-medium">Månadsvis</p>
          <p className="mt-1 text-lg font-semibold">1 199 kr/mån</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Betala månad för månad, avsluta när som helst
          </p>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => handleCheckout("monthly")}
            disabled={loading !== null}
          >
            {loading === "monthly" ? "Laddar…" : "Välj månadsplan"}
          </Button>
        </div>

        <div className="relative rounded-lg border border-[#16a34a]/40 p-4">
          <Badge className="absolute -top-2.5 right-3 bg-[#052e16] text-[#16a34a] hover:bg-[#052e16]">
            Bäst värde
          </Badge>
          <p className="font-medium">Årsvis</p>
          <p className="mt-1 text-lg font-semibold">833 kr/mån</p>
          <p className="mt-2 text-sm text-muted-foreground">
            9 990 kr/år – Du sparar 4 398 kr
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => handleCheckout("yearly")}
            disabled={loading !== null}
          >
            {loading === "yearly" ? "Laddar…" : "Välj årsplan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
