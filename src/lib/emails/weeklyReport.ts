export interface WeeklyReportData {
  companyName: string;
  weekStart: string;
  weekEnd: string;
  smsSent: number;
  responseRate: number;
  averageRating: number;
  lowRatings: number;
  highRatings: number;
  recentComments: { rating: number; comment: string; date: string }[];
}

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

function statCard(label: string, value: string): string {
  return `
    <td align="center" valign="top" width="33.33%" style="padding:0 6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG_SOFT};border:1px solid ${BORDER};border-radius:8px;">
        <tr>
          <td align="center" style="padding:18px 10px;font-family:Arial,Helvetica,sans-serif;">
            <div style="font-size:26px;line-height:1.1;font-weight:700;color:${ACCENT};">${value}</div>
            <div style="font-size:12px;line-height:1.4;color:${MUTED};margin-top:6px;text-transform:uppercase;letter-spacing:0.04em;">${label}</div>
          </td>
        </tr>
      </table>
    </td>`;
}

export function generateWeeklyReportEmail(data: WeeklyReportData): string {
  const {
    companyName,
    weekStart,
    weekEnd,
    smsSent,
    responseRate,
    averageRating,
    lowRatings,
    highRatings,
    recentComments,
  } = data;

  const totalRatings = highRatings + lowRatings;
  const highPercent = totalRatings > 0 ? Math.round((highRatings / totalRatings) * 100) : 0;
  const lowPercent = totalRatings > 0 ? 100 - highPercent : 0;

  const responseRateLabel = `${Number.isInteger(responseRate) ? responseRate : responseRate.toFixed(1)}%`;
  const averageRatingLabel =
    averageRating > 0
      ? (Number.isInteger(averageRating) ? `${averageRating}` : averageRating.toFixed(1))
      : "–";

  const ratingsBar =
    totalRatings > 0
      ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:6px;overflow:hidden;">
        <tr>
          ${
            highPercent > 0
              ? `<td width="${highPercent}%" style="background-color:#16a34a;height:14px;font-size:0;line-height:0;">&nbsp;</td>`
              : ""
          }
          ${
            lowPercent > 0
              ? `<td width="${lowPercent}%" style="background-color:#dc2626;height:14px;font-size:0;line-height:0;">&nbsp;</td>`
              : ""
          }
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};">
        <tr>
          <td align="left">● Höga betyg (4–5): <strong style="color:${TEXT};">${highRatings}</strong></td>
          <td align="right">● Låga betyg (1–3): <strong style="color:${TEXT};">${lowRatings}</strong></td>
        </tr>
      </table>`
      : `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">Inga betyg ännu denna vecka.</p>`;

  const commentsSection =
    recentComments.length > 0
      ? `
      <tr>
        <td style="padding:8px 24px 0 24px;">
          <h2 style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:${TEXT};">Senaste kommentarer</h2>
        </td>
      </tr>
      ${recentComments
        .slice(0, 3)
        .map(
          (c) => `
      <tr>
        <td style="padding:0 24px 12px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG_SOFT};border:1px solid ${BORDER};border-radius:8px;">
            <tr>
              <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:14px;color:#f59e0b;letter-spacing:2px;">${renderStars(c.rating)}</div>
                <div style="font-size:14px;line-height:1.5;color:${TEXT};margin-top:6px;">${escapeHtml(c.comment)}</div>
                <div style="font-size:12px;color:${MUTED};margin-top:8px;">${escapeHtml(c.date)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
        )
        .join("")}`
      : "";

  return `<!DOCTYPE html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>SICE Review – Veckorapport</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f7;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:${ACCENT};padding:24px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:20px;font-weight:700;color:#ffffff;">SICE Review – Veckorapport</div>
              <div style="font-size:14px;color:#dbeafe;margin-top:4px;">${escapeHtml(companyName)} · ${escapeHtml(weekStart)} – ${escapeHtml(weekEnd)}</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 8px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${statCard("SMS skickade", String(smsSent))}
                  ${statCard("Svarsfrekvens", responseRateLabel)}
                  ${statCard("Snittbetyg", averageRatingLabel)}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 24px 8px 24px;">
              <h2 style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:${TEXT};">Höga vs låga betyg</h2>
              ${ratingsBar}
            </td>
          </tr>

          ${commentsSection}

          <tr>
            <td style="padding:16px 24px 28px 24px;">
              <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 16px 0;" />
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">
                Du får detta email varje måndag. SICE Review – <a href="https://sicereview.se" style="color:${ACCENT};text-decoration:none;">sicereview.se</a>
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
