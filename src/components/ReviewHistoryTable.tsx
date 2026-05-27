"use client";

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
import type { TransactionWithFeedback } from "@/lib/supabase/types";

const statusLabels: Record<string, string> = {
  sent: "Skickad",
  opened: "Öppnad",
  completed: "Klar",
};

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  sent: "secondary",
  opened: "default",
  completed: "default",
};

interface ReviewHistoryTableProps {
  transactions: TransactionWithFeedback[];
}

export function ReviewHistoryTable({ transactions }: ReviewHistoryTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Inga recensionsförfrågningar ännu. Skicka ditt första SMS ovan!
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Kund</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Betyg</TableHead>
            <TableHead>Kommentar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="whitespace-nowrap">
                {formatDate(tx.created_at)}
              </TableCell>
              <TableCell>{tx.customer_name ?? "—"}</TableCell>
              <TableCell className="whitespace-nowrap">{tx.customer_phone}</TableCell>
              <TableCell>
                <Badge
                  variant={statusVariant[tx.status] ?? "secondary"}
                  className={
                    tx.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : tx.status === "opened"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        : ""
                  }
                >
                  {statusLabels[tx.status] ?? tx.status}
                </Badge>
              </TableCell>
              <TableCell>
                {tx.feedback?.rating ? (
                  <span className="flex items-center gap-0.5">
                    {tx.feedback.rating}
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {tx.feedback?.comment ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
