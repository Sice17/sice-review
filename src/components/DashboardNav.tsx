"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface DashboardNavProps {
  companyName: string;
}

export function DashboardNav({ companyName }: DashboardNavProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold truncate max-w-[200px] sm:max-w-none">
            {companyName || "SICE Review"}
          </span>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Inställningar
            </Link>
          </nav>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logga ut
        </Button>
      </div>
    </header>
  );
}
