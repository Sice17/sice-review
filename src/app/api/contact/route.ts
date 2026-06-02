import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import {
  generateContactConfirmationEmail,
  generateContactNotificationEmail,
} from "@/lib/emails/contactEmail";

const SUBJECT_OPTIONS = [
  "Allmän fråga",
  "Teknisk support",
  "Fakturering",
  "Partnerskap",
  "Annat",
] as const;

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.enum(SUBJECT_OPTIONS),
  message: z.string().min(20),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Ogiltig begäran" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = "SICE Review <noreply@sicereview.se>";

  if (!resendKey || resendKey === "re_xxxxx") {
    console.log("[contact] Skipping email — RESEND_API_KEY not configured", body);
    return NextResponse.json({ ok: true, emailSkipped: true });
  }

  const resend = new Resend(resendKey);

  const { error: notifyError } = await resend.emails.send({
    from: fromAddress,
    to: "info@sicereview.se",
    replyTo: body.email,
    subject: `Kontakt: ${body.subject} — ${body.name}`,
    html: generateContactNotificationEmail(body),
  });

  if (notifyError) {
    console.error("[contact] Notification email failed:", notifyError);
    return NextResponse.json(
      { error: "Kunde inte skicka meddelandet" },
      { status: 500 }
    );
  }

  const { error: confirmError } = await resend.emails.send({
    from: fromAddress,
    to: body.email,
    subject: "Vi har tagit emot ditt meddelande — SICE Review",
    html: generateContactConfirmationEmail(body.name),
  });

  if (confirmError) {
    console.error("[contact] Confirmation email failed:", confirmError);
  }

  return NextResponse.json({ ok: true });
}
