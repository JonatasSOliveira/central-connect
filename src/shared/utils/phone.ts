export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export function formatPhoneBrDynamic(phone: string | null | undefined): string {
  const digits = normalizePhone(phone).slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length < 3) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

  const isNineDigits = digits.length > 10;
  const localPrefixLength = isNineDigits ? 5 : 4;
  const ddd = digits.slice(0, 2);
  const prefix = digits.slice(2, 2 + localPrefixLength);
  const suffix = digits.slice(2 + localPrefixLength);

  if (suffix.length === 0) {
    return `(${ddd}) ${prefix}`;
  }

  return `(${ddd}) ${prefix}-${suffix}`;
}
