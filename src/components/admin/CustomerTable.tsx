"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Search, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import { subscriptionBadge } from "@/lib/subscription-status";

export interface CustomerRow {
  id: string;
  companyName: string;
  email: string;
  subscriptionStatus: string | null;
  isBlocked: boolean;
  totalSms: number;
  responseRate: number;
  avgRating: string;
  googleClicks: number;
  createdAt: string;
}

type SortKey = "companyName" | "totalSms" | "responseRate" | "googleClicks";
type SortDirection = "asc" | "desc";

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = activeKey === sortKey;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        {isActive &&
          (direction === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          ))}
      </button>
    </TableHead>
  );
}

interface CustomerTableProps {
  customers: CustomerRow[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    let rows = customers;

    if (query) {
      rows = rows.filter(
        (customer) =>
          customer.companyName.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query)
      );
    }

    if (!sortKey) {
      return rows;
    }

    return [...rows].sort((a, b) => {
      let cmp = 0;

      switch (sortKey) {
        case "companyName":
          cmp = a.companyName.localeCompare(b.companyName, "sv");
          break;
        case "totalSms":
          cmp = a.totalSms - b.totalSms;
          break;
        case "responseRate":
          cmp = a.responseRate - b.responseRate;
          break;
        case "googleClicks":
          cmp = a.googleClicks - b.googleClicks;
          break;
      }

      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [customers, search, sortKey, sortDirection]);

  if (customers.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Inga kunder ännu.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Sök företag eller email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <SortableHeader
                label="Företag"
                sortKey="companyName"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
              />
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <SortableHeader
                label="SMS skickade"
                sortKey="totalSms"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
                className="text-right"
              />
              <SortableHeader
                label="Svarsfrekvens"
                sortKey="responseRate"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
                className="text-right"
              />
              <TableHead className="text-right">Snittbetyg</TableHead>
              <SortableHeader
                label="Google-klick"
                sortKey="googleClicks"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
                className="text-right"
              />
              <TableHead className="hidden whitespace-nowrap lg:table-cell">
                Registrerad
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  Inga kunder matchar sökningen.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => {
                const badge = subscriptionBadge(customer.subscriptionStatus);
                return (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => router.push(`/admin/${customer.id}`)}
                  >
                    <TableCell className="font-medium text-foreground">
                      <span className="inline-flex flex-wrap items-center gap-2">
                        {customer.companyName || "—"}
                        {customer.isBlocked && (
                          <Badge variant="destructive">Blockerad</Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {customer.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={badge.className}>
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.totalSms}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.responseRate}%
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.avgRating === "—" ? (
                        "—"
                      ) : (
                        <span className="inline-flex items-center justify-end gap-0.5">
                          {customer.avgRating}
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.googleClicks}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
