"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function DataManagement() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export-data", { method: "POST" });
      if (!res.ok) {
        throw new Error("Export misslyckades");
      }

      const blob = await res.blob();
      const date = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sice-review-export-${date}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Din data har exporterats");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Kunde inte exportera data"
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete-account", {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Kunde inte radera kontot");
      }

      toast.success("Ditt konto har raderats");
      setConfirmOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Kunde inte radera kontot"
      );
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Exportera min data</p>
          <p className="text-sm text-muted-foreground">
            Ladda ner all din data (profil, förfrågningar och omdömen) som en
            JSON-fil.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "Exporterar…" : "Exportera min data"}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 border-t pt-6">
        <div className="space-y-1">
          <p className="text-sm font-medium">Radera konto</p>
          <p className="text-sm text-muted-foreground">
            Raderar ditt konto och all din data permanent.
          </p>
        </div>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger render={<Button variant="destructive" />}>
            Radera konto
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Är du säker?</DialogTitle>
              <DialogDescription>
                Detta raderar ditt konto och all din data permanent. Denna
                åtgärd kan inte ångras.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Avbryt
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Raderar…" : "Ja, radera mitt konto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
