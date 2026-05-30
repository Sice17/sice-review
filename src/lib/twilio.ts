import twilio from "twilio";

function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken) {
    throw new Error(
      "Twilio credentials saknas. Kontrollera TWILIO_ACCOUNT_SID och TWILIO_AUTH_TOKEN i .env.local"
    );
  }

  if (!fromNumber) {
    throw new Error(
      "Twilio avsändarnummer saknas. Kontrollera TWILIO_PHONE_NUMBER i .env.local"
    );
  }

  return { accountSid, authToken, fromNumber };
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
  const { accountSid, authToken, fromNumber } = getTwilioConfig();

  const body = customerName
    ? `Hej ${customerName}! Tack för att du anlitade ${companyName}. Vi uppskattar om du tar 30 sekunder och delar din upplevelse: ${reviewUrl} 🙏`
    : `Hej! Tack för att du anlitade ${companyName}. Dela gärna din upplevelse här: ${reviewUrl} 🙏`;

  const client = twilio(accountSid, authToken);

  await client.messages.create({
    body,
    from: fromNumber,
    to,
  });
}

export async function sendReminderSMS({
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
  const { accountSid, authToken, fromNumber } = getTwilioConfig();

  const body = customerName
    ? `Hej ${customerName}! Vi vill påminna om att ${companyName} gärna vill höra din upplevelse 🙏 Det tar bara 30 sekunder: ${reviewUrl}`
    : `Hej! Vi vill påminna om att ${companyName} gärna vill höra din upplevelse 🙏 Det tar bara 30 sekunder: ${reviewUrl}`;

  const client = twilio(accountSid, authToken);

  await client.messages.create({
    body,
    from: fromNumber,
    to,
  });
}
