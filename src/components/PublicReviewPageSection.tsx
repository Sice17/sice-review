"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { companyNameToSlug } from "@/lib/sms-template";

interface PublicReviewPageSectionProps {
  companyName: string;
}

export function PublicReviewPageSection({
  companyName,
}: PublicReviewPageSectionProps) {
  const [copied, setCopied] = useState(false);

  const slug = companyName.trim() ? companyNameToSlug(companyName) : "ditt-foretag";
  const publicUrl = `https://sicereview.se/r/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="rounded-lg border bg-muted/50 px-3 py-2 font-mono text-sm text-foreground">
        {publicUrl}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="size-4" />
              Kopierad!
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Kopiera länk
            </>
          )}
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={`/r/${slug}`} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            Öppna sida
          </Link>
        </Button>
      </div>
    </div>
  );
}
