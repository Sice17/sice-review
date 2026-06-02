const ACCENT = "#2563eb";
const TEXT = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generateMilestoneEmail(
  companyName: string,
  count: number
): string {
  const safeName = escapeHtml(companyName || "ditt företag");
  const dashboardUrl = "https://sicereview.se/dashboard";

  return `<!DOCTYPE html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Grattis! Du har fått ${count} recensioner!</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f7;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:${ACCENT};padding:28px 24px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Grattis, ${safeName}! 🏆</div>
              <div style="font-size:14px;color:#dbeafe;margin-top:6px;">Du har nått ${count} recensioner</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${TEXT};">
                Fantastiskt jobbat! Du har nu samlat in <strong>${count} recensioner</strong> via SICE Review.
                Fortsätt skicka SMS efter avslutade jobb — varje recension stärker ditt företags rykte.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:${TEXT};">
                Tack för att du använder SICE Review! 🎉
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 24px 28px 24px;">
              <a href="${dashboardUrl}" style="display:inline-block;background-color:${ACCENT};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:8px;">Gå till dashboarden</a>
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

export function milestoneEmailSubject(count: number): string {
  return `Grattis! Du har fått ${count} recensioner! 🏆`;
}
