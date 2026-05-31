"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface BillingButtonsProps {
  status: string | null;
}

export function BillingButtons({ status }: BillingButtonsProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kunde inte starta checkout");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel");
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kunde inte öppna portalen");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel");
      setLoading(false);
    }
  }

  const usePortal =
    status === "active" || status === "trialing" || status === "past_due";

  if (usePortal) {
    const label =
      status === "past_due" ? "Uppdatera betalning" : "Hantera prenumeration";
    return (
      <Button onClick={handlePortal} disabled={loading}>
        {loading ? "Laddar…" : label}
      </Button>
    );
  }

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? "Laddar…" : "Aktivera prenumeration"}
    </Button>
  );
}
