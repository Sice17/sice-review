import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plainTextToHtml(text: string): string {
  const paragraphs = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return "<p></p>";
  }

  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

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

  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = "SICE Review <noreply@sicereview.se>";

  if (!resendKey || resendKey === "re_xxxxx") {
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 503 }
    );
  }

  const service = await createServiceClient();

  const [{ data: profilesData }, { data: usersData }] = await Promise.all([
    service
      .from("profiles")
      .select("id")
      .in("stripe_subscription_status", ["active", "trialing"]),
    service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const activeIds = new Set(
    (profilesData ?? []).map((p) => (p as { id: string }).id)
  );

  const recipients = (usersData?.users ?? []).filter(
    (u) => u.id && activeIds.has(u.id) && u.email
  );

  const html = `<!DOCTYPE html>
<html lang="sv">
<body style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#0f172a;max-width:600px;">
  ${plainTextToHtml(body.body)}
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
  <p style="font-size:12px;color:#64748b;">SICE Review – <a href="https://sicereview.se" style="color:#2563eb;">sicereview.se</a></p>
</body>
</html>`;

  const resend = new Resend(resendKey);
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: recipient.email!,
      subject: body.subject,
      html,
    });

    if (error) {
      console.error("[bulk-email] Failed for", recipient.email, error);
      failed += 1;
    } else {
      sent += 1;
    }
  }

  return NextResponse.json({ sent, failed });
}
