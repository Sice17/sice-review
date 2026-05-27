import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

function getClient() {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured");
  }
  return twilio(accountSid, authToken);
}

export async function sendReviewSMS({
  to,
  customerName,
  companyName,
  reviewUrl,
}: {
  to: string;
  customerName?: string | null;
  companyName: string;
  reviewUrl: string;
}) {
  const body = customerName
    ? `Hej ${customerName}! Tack för att du anlitade ${companyName}. Vi uppskattar om du tar 30 sekunder och delar din upplevelse: ${reviewUrl} 🙏`
    : `Hej! Tack för att du anlitade ${companyName}. Dela gärna din upplevelse här: ${reviewUrl} 🙏`;

  const client = getClient();

  await client.messages.create({
    body,
    from: fromNumber!,
    to,
  });
}
