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

  const registeredAt = new Date().toLocaleString("sv-SE", {
    dateStyle: "long",
    timeStyle: "short",
  });

  void resend.emails
    .send({
      from: fromAddress,
      to: "sicek17@gmail.com",
      subject: "Ny kund registrerad! 🎉",
      html: `<!DOCTYPE html>
<html lang="sv">
<body style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#0f172a;">
  <h2 style="margin:0 0 16px 0;">Ny kund registrerad! 🎉</h2>
  <p><strong>Företag:</strong> ${body.companyName}</p>
  <p><strong>E-post:</strong> ${body.email}</p>
  <p><strong>Registrerad:</strong> ${registeredAt}</p>
</body>
</html>`,
    })
    .catch((err) => {
      console.error("[welcome-email] Admin notification failed:", err);
    });

  return NextResponse.json({ ok: true });
}
