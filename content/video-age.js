/**
 * Yush - Video age parsing
 * Reads YouTube's relative dates ("3 months ago", "hace 2 años") into months.
 * Only English and Spanish UIs are recognized; anything else returns null.
 */

const EN = /(\d+)\s*(second|minute|hour|day|week|month|year)s?\s+ago/i;
const ES = /hace\s+(\d+)\s*(segundo|minuto|hora|d[ií]a|semana|mes|a[nñ]o)(?:s|es)?\b/i;

const MONTHS_PER_UNIT = {
  second: 0, minute: 0, hour: 0, day: 0,
  week: 7 / 30.44,
  month: 1,
  year: 12
};

const ES_UNITS = {
  segundo: 'second', minuto: 'minute', hora: 'hour', dia: 'day', día: 'day',
  semana: 'week', mes: 'month', ano: 'year', año: 'year'
};

/** @returns {number|null} age in months, or null when the text is not a relative date */
export function parseAgeInMonths(text) {
  if (!text) return null;
  const en = EN.exec(text);
  if (en) return Number(en[1]) * MONTHS_PER_UNIT[en[2].toLowerCase()];
  const es = ES.exec(text);
  if (es) return Number(es[1]) * MONTHS_PER_UNIT[ES_UNITS[es[2].toLowerCase()]];
  return null;
}
