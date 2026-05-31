import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { generateWelcomeEmail } from "@/lib/emails/welcomeEmail";

const bodySchema = z.object({
  email: z.string().email(),
  companyName: z.string().min(1),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    const parsed = await request.json();
    body = bodySchema.parse(parsed);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = "SICE Review <noreply@sicereview.se>";

  if (!resendKey || resendKey === "re_xxxxx") {
    console.log("[welcome-email] Skipping email — RESEND_API_KEY not configured", {
      email: body.email,
      company_name: body.companyName,
    });
    return NextResponse.json({ ok: true, emailSkipped: true });
  }

  const resend = new Resend(resendKey);

  const { error: emailError } = await resend.emails.send({
    from: fromAddress,
    to: body.email,
    subject: "Välkommen till SICE Review! 🎉",
    html: generateWelcomeEmail(body.companyName),
  });

  if (emailError) {
    console.error("[welcome-email] Resend error:", emailError);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
