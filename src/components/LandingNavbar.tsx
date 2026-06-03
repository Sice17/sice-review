"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            SICE Review
          </Link>

          <div className="hidden items-center gap-1 md:flex md:gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Logga in</Link>
            </Button>
            <Button variant="ghost" asChild className="text-muted-foreground">
              <Link href="/contact">Kontakt</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Prova gratis i 14 dagar</Link>
            </Button>
          </div>

          <button
            type="button"
            aria-label="Meny"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-9 items-center justify-center rounded-md border text-foreground md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="mt-3 w-full overflow-hidden rounded-lg border border-border bg-[#0f0f0f] md:hidden">
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Logga in
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="block w-full border-t border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Kontakt
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMenuOpen(false)}
              className="block w-full border-t border-border px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-muted"
            >
              Prova gratis i 14 dagar
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
