import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  userId: z.string().uuid(),
  blocked: z.boolean(),
});

export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { error } = await service
    .from("profiles")
    .update({ is_blocked: body.blocked })
    .eq("id", body.userId);

  if (error) {
    console.error("[toggle-block] Update error:", error);
    return NextResponse.json(
      { error: "Failed to update account status" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, blocked: body.blocked });
}
