import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  feedbackId: z.string().uuid(),
  comment: z.string().min(1),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("feedback")
    .update({ comment: body.comment.trim() })
    .eq("id", body.feedbackId);

  if (error) {
    console.error("[update-feedback-comment] Update error:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
