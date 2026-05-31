"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface DashboardNavProps {
  companyName: string;
}

export function DashboardNav({ companyName }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  function linkClass(href: string) {
    const active = pathname === href;
    return cn(
      "transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    );
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
            {companyName || "SICE Review"}
          </span>
          {/* Desktop nav */}
          <nav className="hidden gap-4 text-sm sm:flex">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className={linkClass("/dashboard/settings")}
            >
              Inställningar
            </Link>
          </nav>
        </div>

        {/* Desktop logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          Logga ut
        </Button>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Meny"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex size-9 items-center justify-center rounded-md border text-foreground sm:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t px-4 py-2 sm:hidden">
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Inställningar
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Logga ut
          </button>
        </nav>
      )}
    </header>
  );
}
