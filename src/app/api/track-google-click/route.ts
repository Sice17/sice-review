import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  feedbackId: z.string().uuid(),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    const parsed = await request.json();
    body = bodySchema.parse(parsed);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("feedback")
    .update({
      google_clicked: true,
      google_clicked_at: new Date().toISOString(),
    })
    .eq("id", body.feedbackId);

  if (error) {
    console.error("[track-google-click] Update error:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
