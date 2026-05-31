"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import type { TransactionWithFeedback } from "@/lib/supabase/types";

const PAGE_SIZE = 10;

const statusLabels: Record<string, string> = {
  sent: "Skickad",
  opened: "Öppnad",
  completed: "Slutförd",
  reminded: "Påminnelse skickad",
};

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  sent: "secondary",
  opened: "default",
  completed: "default",
  reminded: "default",
};

interface ReviewHistoryTableProps {
  transactions: TransactionWithFeedback[];
}

export function ReviewHistoryTable({ transactions }: ReviewHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const totalResults = transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalResults);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (
      expandedRowId &&
      !paginatedTransactions.some((tx) => tx.id === expandedRowId)
    ) {
      setExpandedRowId(null);
    }
  }, [expandedRowId, paginatedTransactions]);

  if (transactions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Inga recensionsförfrågningar ännu. Skicka ditt första SMS ovan!
      </p>
    );
  }

  function toggleRow(id: string) {
    setExpandedRowId((current) => (current === id ? null : id));
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="w-8" />
            <TableHead className="hidden sm:table-cell">Datum</TableHead>
            <TableHead>Kund</TableHead>
            <TableHead className="hidden sm:table-cell">Telefon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Betyg</TableHead>
            <TableHead className="hidden sm:table-cell">Kommentar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTransactions.map((tx) => {
            const isExpanded = expandedRowId === tx.id;

            return (
              <Fragment key={tx.id}>
                <TableRow
                  aria-expanded={isExpanded}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => toggleRow(tx.id)}
                >
                  <TableCell className="w-8 pr-0">
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap sm:table-cell">
                    {formatDate(tx.created_at)}
                  </TableCell>
                  <TableCell>{tx.customer_name ?? "—"}</TableCell>
                  <TableCell className="hidden whitespace-nowrap sm:table-cell">
                    {tx.customer_phone}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariant[tx.status] ?? "secondary"}
                      className={
                        tx.status === "completed"
                          ? "bg-[#052e16] text-[#16a34a]"
                          : tx.status === "opened"
                            ? "bg-[#0c1f3d] text-[#60a5fa]"
                            : tx.status === "reminded"
                              ? "bg-[#2e1f05] text-[#f59e0b]"
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
                  <TableCell className="hidden max-w-[200px] truncate sm:table-cell sm:whitespace-nowrap">
                    {tx.feedback?.comment ?? "—"}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={7} className="whitespace-normal p-4">
                      <div className="space-y-3 text-sm">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Kund
                            </p>
                            <p className="mt-1">{tx.customer_name ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Telefon
                            </p>
                            <p className="mt-1">{tx.customer_phone}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Betyg
                            </p>
                            <p className="mt-1 flex items-center gap-1">
                              {tx.feedback?.rating ? (
                                <>
                                  {tx.feedback.rating}
                                  <Star className="size-4 fill-amber-400 text-amber-400" />
                                </>
                              ) : (
                                "—"
                              )}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Kommentar
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-foreground">
                            {tx.feedback?.comment ?? "Ingen kommentar"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{endIndex} of {totalResults} results
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
