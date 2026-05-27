"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface BillingButtonsProps {
  isActive: boolean;
}

export function BillingButtons({ isActive }: BillingButtonsProps) {
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

  if (isActive) {
    return (
      <Button onClick={handlePortal} disabled={loading}>
        {loading ? "Laddar…" : "Hantera prenumeration"}
      </Button>
    );
  }

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? "Laddar…" : "Aktivera prenumeration"}
    </Button>
  );
}
