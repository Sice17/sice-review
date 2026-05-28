import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  transaction_id: z.string().uuid(),
  rating: z.number().int().min(1).max(3),
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

  const { data: transaction, error } = await supabase
    .from("transactions")
    .select("id, contractor_id, customer_name, customer_phone, created_at")
    .eq("id", body.transaction_id)
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

  const { data: feedback } = await supabase
    .from("feedback")
    .select("comment")
    .eq("transaction_id", tx.id)
    .maybeSingle();

  const feedbackRow = feedback as { comment: string | null } | null;

  const { data: contractor } = await supabase
    .from("profiles")
    .select("id, company_name, phone")
    .eq("id", tx.contractor_id)
    .maybeSingle();

  const contractorProfile = contractor as
    | { id: string; company_name: string; phone: string | null }
    | null;

  const { data: authUser, error: authError } =
    await supabase.auth.admin.getUserById(tx.contractor_id);

  if (authError || !authUser?.user?.email) {
    return NextResponse.json(
      { error: "Contractor email not found" },
      { status: 404 }
    );
  }

  const customerName = tx.customer_name || "Okänd kund";
  const comment = feedbackRow?.comment || "Ingen kommentar";
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = "SICE Review <noreply@sicereview.se>";

  if (!resendKey || resendKey === "re_xxxxx") {
    console.log("[bad-review-notify] Skipping email — RESEND_API_KEY not configured", {
      transaction_id: tx.id,
      rating: body.rating,
      customer_name: customerName,
      customer_phone: tx.customer_phone,
      comment,
      contractor_email: authUser.user.email,
    });
    return NextResponse.json({ ok: true, emailSkipped: true });
  }

  const resend = new Resend(resendKey);

  const { error: emailError } = await resend.emails.send({
    from: fromAddress,
    to: authUser.user.email,
    subject: `⚠️ Ny privat feedback – ${body.rating} stjärnor från ${customerName}`,
    html: `
      <h2>Ny privat feedback mottagen</h2>
      <p>Du har fått en låg betygning via SICE Review som sparats privat i din dashboard.</p>
      <ul>
        <li><strong>Kund:</strong> ${customerName}</li>
        <li><strong>Telefon:</strong> ${tx.customer_phone}</li>
        <li><strong>Betyg:</strong> ${body.rating} av 5 stjärnor</li>
        <li><strong>Kommentar:</strong> ${comment}</li>
      </ul>
      <p>
        <a href="${dashboardUrl}">Öppna dashboard</a>
      </p>
    `,
  });

  if (emailError) {
    console.error("[bad-review-notify] Resend error:", emailError);
    return NextResponse.json(
      { error: "Failed to send notification email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
