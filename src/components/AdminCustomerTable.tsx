"use client";

import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { subscriptionBadge } from "@/lib/subscription-status";

export interface AdminCustomerRow {
  id: string;
  companyName: string;
  email: string;
  subscriptionStatus: string | null;
  totalSms: number;
  responseRate: number;
  avgRating: string;
  googleClicks: number;
  createdAt: string;
}

interface AdminCustomerTableProps {
  customers: AdminCustomerRow[];
}

export function AdminCustomerTable({ customers }: AdminCustomerTableProps) {
  const router = useRouter();

  if (customers.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Inga kunder ännu.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead>Företag</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">SMS skickade</TableHead>
            <TableHead className="text-right">Svarsfrekvens</TableHead>
            <TableHead className="text-right">Snittbetyg</TableHead>
            <TableHead className="text-right">Google-klick</TableHead>
            <TableHead className="hidden whitespace-nowrap lg:table-cell">
              Registrerad
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            const badge = subscriptionBadge(customer.subscriptionStatus);
            return (
              <TableRow
                key={customer.id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => router.push(`/admin/${customer.id}`)}
              >
                <TableCell className="font-medium text-foreground">
                  {customer.companyName || "—"}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {customer.email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={badge.className}>
                    {badge.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{customer.totalSms}</TableCell>
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
          })}
        </TableBody>
      </Table>
    </div>
  );
}
