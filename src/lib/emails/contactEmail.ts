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

export function generateContactNotificationEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `<!DOCTYPE html>
<html lang="sv">
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;">
          <tr>
            <td style="background-color:${ACCENT};padding:24px;">
              <div style="font-size:20px;font-weight:700;color:#ffffff;">Nytt kontaktmeddelande</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:${TEXT};font-size:15px;line-height:1.6;">
              <p style="margin:0 0 12px 0;"><strong>Namn:</strong> ${safeName}</p>
              <p style="margin:0 0 12px 0;"><strong>E-post:</strong> <a href="mailto:${safeEmail}" style="color:${ACCENT};">${safeEmail}</a></p>
              <p style="margin:0 0 16px 0;"><strong>Ämne:</strong> ${safeSubject}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG_SOFT};border:1px solid ${BORDER};border-radius:8px;">
                <tr>
                  <td style="padding:16px;">${safeMessage}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateContactConfirmationEmail(name: string): string {
  const safeName = escapeHtml(name);

  return `<!DOCTYPE html>
<html lang="sv">
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;">
          <tr>
            <td style="background-color:${ACCENT};padding:24px;">
              <div style="font-size:20px;font-weight:700;color:#ffffff;">Tack för ditt meddelande!</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:${TEXT};font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px 0;">Hej ${safeName},</p>
              <p style="margin:0 0 16px 0;">Vi har tagit emot ditt meddelande och återkommer inom 24 timmar.</p>
              <p style="margin:0;color:${MUTED};font-size:13px;">SICE Review – <a href="https://sicereview.se" style="color:${ACCENT};text-decoration:none;">sicereview.se</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
