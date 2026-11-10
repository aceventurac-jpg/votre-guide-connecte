export function safeWebsite(value?: string) {
  try { const url = new URL(value ?? ''); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null; } catch { return null; }
}
export function phoneLink(value?: string) {
  const phone = (value ?? '').replace(/[^+\d]/g, '');
  return phone.length >= 6 ? `tel:${phone}` : null;
}
export function placeActionAvailability(details: { website?: string; phone?: string }) {
  return { website: safeWebsite(details.website), phone: phoneLink(details.phone), canConfirmOrder: false, canConfirmAppointment: false };
}