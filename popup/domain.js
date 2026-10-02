// Yush - Domain normalization for the external-sites whitelist

/** Strip protocol, path and leading www; returns '' when nothing usable is left. */
export function normalizeDomain(input) {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '');
}
