import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  transactionId: z.string().uuid(),
  rating: z.number().int().min(4).max(5),
  comment: z.string().nullable().optional(),
});

const ACCENT = "#2563eb";
const TEXT = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const BG_SOFT = "#f8fafc";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStars(rating: number): string {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(clamped) + "☆".repeat(5 - clamped);
}

function buildEmail({
  companyName,
  rating,
  comment,
  customerName,
  dashboardUrl,
}: {
  companyName: string;
  rating: number;
  comment: string | null;
  customerName: string;
  dashboardUrl: string;
}): string {
  const commentBlock = comment
    ? `
          <tr>
            <td style="padding:8px 24px 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG_SOFT};border:1px solid ${BORDER};border-radius:8px;">
                <tr>
                  <td style="padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${TEXT};">
                    “${escapeHtml(comment)}”
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Ny recension</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f7;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:${ACCENT};padding:24px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:20px;font-weight:700;color:#ffffff;">Ny recension 🎉</div>
              <div style="font-size:14px;color:#dbeafe;margin-top:4px;">${escapeHtml(companyName)}</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 8px 24px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:${TEXT};">
                ${escapeHtml(customerName)} har lämnat ett omdöme:
              </p>
              <div style="font-size:24px;color:#f59e0b;letter-spacing:4px;margin-top:12px;">${renderStars(rating)}</div>
              <div style="font-size:13px;color:${MUTED};margin-top:6px;">${rating} av 5 stjärnor</div>
            </td>
          </tr>

          ${commentBlock}

          <tr>
            <td align="center" style="padding:24px;">
              <a href="${dashboardUrl}" style="display:inline-block;background-color:${ACCENT};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;">Gå till dashboard</a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px 28px 24px;">
              <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 16px 0;" />
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">
                SICE Review – <a href="https://sicereview.se" style="color:${ACCENT};text-decoration:none;">sicereview.se</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    const parsed = await request.json();
    body = bodySchema.parse(parsed);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { data: transaction, error } = await supabase
    .from("transactions")
    .select("id, contractor_id, customer_name, customer_phone, created_at")
    .eq("id", body.transactionId)
    .maybeSingle();

  const tx = transaction as
    | {
        id: string;
        contractor_id: string;
        customer_name: string | null;
        customer_phone: string;
        created_at: string;
      }
    | null;

  if (error || !tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const { data: contractor } = await supabase
    .from("profiles")
    .select("id, company_name")
    .eq("id", tx.contractor_id)
    .maybeSingle();

  const contractorProfile = contractor as
    | { id: string; company_name: string | null }
    | null;

  const { data: authUser, error: authError } =
    await supabase.auth.admin.getUserById(tx.contractor_id);

  if (authError || !authUser?.user?.email) {
    return NextResponse.json(
      { error: "Contractor email not found" },
      { status: 404 }
    );
  }

  const companyName = contractorProfile?.company_name || "Ditt företag";
  const customerName = tx.customer_name || "En kund";
  const comment = body.comment && body.comment.trim().length > 0 ? body.comment : null;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://sicereview.se"}/dashboard`;
  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = "SICE Review <noreply@sicereview.se>";

  if (!resendKey || resendKey === "re_xxxxx") {
    console.log("[good-review-notify] Skipping email — RESEND_API_KEY not configured", {
      transaction_id: tx.id,
      rating: body.rating,
      customer_name: customerName,
      comment,
      contractor_email: authUser.user.email,
    });
    return NextResponse.json({ ok: true, emailSkipped: true });
  }

  const resend = new Resend(resendKey);

  const { error: emailError } = await resend.emails.send({
    from: fromAddress,
    to: authUser.user.email,
    subject: `Ny recension – ${body.rating} stjärnor ⭐`,
    html: buildEmail({
      companyName,
      rating: body.rating,
      comment,
      customerName,
      dashboardUrl,
    }),
  });

  if (emailError) {
    console.error("[good-review-notify] Resend error:", emailError);
    return NextResponse.json(
      { error: "Failed to send notification email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
