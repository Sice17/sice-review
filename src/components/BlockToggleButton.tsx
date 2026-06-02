"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface BlockToggleButtonProps {
  userId: string;
  isBlocked: boolean;
}

export function BlockToggleButton({ userId, isBlocked }: BlockToggleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(isBlocked);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/toggle-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, blocked: !blocked }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Kunde inte uppdatera kontot");
      }

      setBlocked((current) => !current);
      toast.success(blocked ? "Kontot är avblockerat" : "Kontot är blockerat");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={blocked ? "default" : "destructive"}
      onClick={handleToggle}
      disabled={loading}
      className={
        blocked
          ? "bg-[#052e16] text-[#16a34a] hover:bg-[#052e16]/90"
          : undefined
      }
    >
      {loading
        ? "Uppdaterar…"
        : blocked
          ? "Avblockera konto"
          : "Blockera konto"}
    </Button>
  );
}
