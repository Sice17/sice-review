"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetEmbedProps {
  companyId: string;
}

export function WidgetEmbed({ companyId }: WidgetEmbedProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<div id="sice-review-widget"></div>
<script src="https://sicereview.se/widget.js" data-company-id="${companyId}"></script>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3">
      <pre className="overflow-x-auto rounded-lg border border-[#2a2a2a] bg-[#111111] p-3 font-mono text-xs leading-relaxed text-[#94a3b8]">
        <code>{embedCode}</code>
      </pre>
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
            Kopierat! ✓
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Kopiera kod
          </>
        )}
      </Button>
    </div>
  );
}
