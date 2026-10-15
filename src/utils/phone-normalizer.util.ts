export function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone;

  let cleaned = phone.replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.slice(1);
  } else if (cleaned.startsWith('62')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}
