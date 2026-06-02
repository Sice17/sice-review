import Link from "next/link";

interface AdminHeaderProps {
  active?: "customers" | "email";
}

export function AdminHeader({ active }: AdminHeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">SICE Review</span>
            <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-500">
              Admin
            </span>
          </div>
          <nav className="hidden items-center gap-4 text-sm sm:flex">
            <Link
              href="/admin"
              className={
                active === "customers"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              Kunder
            </Link>
            <Link
              href="/admin/email"
              className={
                active === "email"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              Skicka email
            </Link>
          </nav>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Till dashboard
        </Link>
      </div>
    </header>
  );
}
