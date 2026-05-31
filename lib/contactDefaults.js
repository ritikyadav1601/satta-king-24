export const DEFAULT_KHAIWAL_NAME = "DEVA BHAI";
export const DEFAULT_CONTACT_NUMBER = "918696496366";

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
