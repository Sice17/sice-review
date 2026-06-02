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

export async function sendSMS({ to, body }: { to: string; body: string }) {
  const { accountSid, authToken, fromNumber } = getTwilioConfig();
  const client = twilio(accountSid, authToken);

  await client.messages.create({
    body,
    from: fromNumber,
    to,
  });
}

export async function sendReviewSMS({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  await sendSMS({ to, body });
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
  const body = customerName
    ? `Hej ${customerName}! Vi vill påminna om att ${companyName} gärna vill höra din upplevelse 🙏 Det tar bara 30 sekunder: ${reviewUrl}`
    : `Hej! Vi vill påminna om att ${companyName} gärna vill höra din upplevelse 🙏 Det tar bara 30 sekunder: ${reviewUrl}`;

  await sendSMS({ to, body });
}

export async function sendFollowUpSMS({
  to,
  customerName,
  reviewUrl,
}: {
  to: string;
  customerName?: string | null;
  reviewUrl: string;
}) {
  const body = customerName
    ? `Hej ${customerName}! Vi hoppas allt gick bra med jobbet. Om du har en minut skulle vi uppskatta om du delar din upplevelse: ${reviewUrl} 🙏`
    : `Hej! Vi hoppas allt gick bra med jobbet. Om du har en minut skulle vi uppskatta om du delar din upplevelse: ${reviewUrl} 🙏`;

  await sendSMS({ to, body });
}
