export function normalizeOptionalText(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}
