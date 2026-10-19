export const DEFAULT_KHAIWAL_NAME = "DEVA BHAI";
export const DEFAULT_CONTACT_NUMBER = "919588518048";

// Fallback only: floating WhatsApp now uses the first khaiwal chart number/name from the database.
// These values are used only if the database has no khaiwal entry.
export const FLOATING_WHATSAPP_NUMBER = "918950312367";
export const FLOATING_WHATSAPP_TEXT = "VP bhai";

export function normalizeWhatsAppNumber(number = DEFAULT_CONTACT_NUMBER) {
  const digits = String(number).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits || DEFAULT_CONTACT_NUMBER;
}

export function withDefaultAd(ad = {}) {
  return {
    ...ad,
    khaiwalName: ad.khaiwalName || DEFAULT_KHAIWAL_NAME,
    gpayNumber: ad.gpayNumber || DEFAULT_CONTACT_NUMBER,
    whatsappNumber: normalizeWhatsAppNumber(ad.whatsappNumber || DEFAULT_CONTACT_NUMBER)
  };
}
