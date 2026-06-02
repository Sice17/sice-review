export const DEFAULT_SMS_TEMPLATE =
  "Hej {namn}! Tack för att du anlitade {företag}. Vi uppskattar om du tar 30 sekunder och delar din upplevelse: {länk} 🙏";

export const SMS_TEMPLATE_MAX_LENGTH = 320;

export interface SmsTemplateValues {
  namn: string;
  företag: string;
  länk: string;
}

export function buildSmsMessage(
  template: string | null | undefined,
  values: SmsTemplateValues
): string {
  const source = template?.trim() || DEFAULT_SMS_TEMPLATE;

  return source
    .replace(/\{namn\}/g, values.namn)
    .replace(/\{företag\}/g, values.företag)
    .replace(/\{länk\}/g, values.länk);
}

export function companyNameToSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}
