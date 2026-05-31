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

function stepRow(number: number, text: string): string {
  return `
          <tr>
            <td style="padding:0 24px 12px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG_SOFT};border:1px solid ${BORDER};border-radius:8px;">
                <tr>
                  <td width="48" valign="top" style="padding:16px 0 16px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle" width="32" height="32" style="background-color:${ACCENT};border-radius:16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;">${number}</td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle" style="padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${TEXT};">${text}</td>
                </tr>
              </table>
            </td>
          </tr>`;
}

export function generateWelcomeEmail(companyName: string): string {
  const safeName = escapeHtml(companyName || "ditt företag");
  const dashboardUrl = "https://sicereview.se/dashboard";

  return `<!DOCTYPE html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Välkommen till SICE Review</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f7;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:${ACCENT};padding:28px 24px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Välkommen till SICE Review, ${safeName}!</div>
              <div style="font-size:14px;color:#dbeafe;margin-top:6px;">Vi är glada att ha dig ombord 🎉</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 8px 24px;font-family:Arial,Helvetica,sans-serif;">
              <h2 style="margin:0 0 16px 0;font-size:17px;color:${TEXT};">Kom igång på 3 enkla steg</h2>
            </td>
          </tr>

          ${stepRow(1, "Lägg till din Google-recensionslänk under Inställningar")}
          ${stepRow(2, "Skicka ditt första SMS från dashboarden")}
          ${stepRow(3, "Vänta på din första recension 🎉")}

          <tr>
            <td align="center" style="padding:20px 24px 28px 24px;">
              <a href="${dashboardUrl}" style="display:inline-block;background-color:${ACCENT};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:8px;">Gå till dashboarden</a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px 28px 24px;">
              <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 16px 0;" />
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">
                Har du frågor? Kontakta oss på <a href="mailto:info@sicereview.se" style="color:${ACCENT};text-decoration:none;">info@sicereview.se</a> — SICE Review
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
