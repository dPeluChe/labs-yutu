/**
 * Yush - Old video filter
 * Marks Home cards older than N months so CSS can blur them (clears on hover) or hide them.
 */

import { DEFAULT_SETTINGS, subscribeSettings } from './config.js';
import { isHomePath } from './url-utils.js';
import { parseAgeInMonths } from './video-age.js';

const CARD_SELECTOR = 'ytd-rich-item-renderer';
const DATE_CANDIDATES = '.ytContentMetadataViewModelMetadataText, #metadata-line span';
const AGE_ATTR = 'data-yutu-age';
const OLD_ATTR = 'data-yutu-old';
const TRIES_ATTR = 'data-yutu-age-tries';
const MAX_TRIES = 4;

function readAgeMonths(card) {
  for (const node of card.querySelectorAll(DATE_CANDIDATES)) {
    const months = parseAgeInMonths(node.getAttribute('aria-label') || node.textContent);
    if (months !== null) return months;
  }
  return null;
}

export class OldVideoFilter {
  constructor({ manager, config = DEFAULT_SETTINGS.oldVideoFilter }) {
    this.manager = manager;
    this.config = { ...config };
  }

  init() {
    this.manager.onMutation(() => this.scan());
    window.addEventListener('yt-navigate-finish', () => setTimeout(() => this.refresh(), 250));
    subscribeSettings((settings) => {
      this.config = settings.oldVideoFilter;
      this.refresh();
    });
    this.scan();
  }

  scan() {
    if (!this.config.enabled || !isHomePath()) return;
    for (const card of document.querySelectorAll(`${CARD_SELECTOR}:not([${AGE_ATTR}])`)) {
      const months = readAgeMonths(card);
      if (months === null) {
        // metadata renders late; give up after a few passes (ads, live streams)
        const tries = Number(card.getAttribute(TRIES_ATTR) || 0) + 1;
        card.setAttribute(TRIES_ATTR, String(tries));
        if (tries >= MAX_TRIES) card.setAttribute(AGE_ATTR, '');
        continue;
      }
      card.setAttribute(AGE_ATTR, String(months));
      this.classify(card);
    }
  }

  classify(card) {
    const measured = card.getAttribute(AGE_ATTR);
    const isOld = this.config.enabled && measured !== '' && Number(measured) >= this.config.months;
    const next = isOld ? this.config.mode : null;
    if (card.getAttribute(OLD_ATTR) === next) return;
    if (next) card.setAttribute(OLD_ATTR, next);
    else card.removeAttribute(OLD_ATTR);
  }

  /** Re-evaluate already-measured cards after a settings or page change. */
  refresh() {
    if (!this.config.enabled || !isHomePath()) {
      for (const card of document.querySelectorAll(`[${OLD_ATTR}]`)) card.removeAttribute(OLD_ATTR);
      return;
    }
    for (const card of document.querySelectorAll(`[${AGE_ATTR}]`)) this.classify(card);
    this.scan();
  }
}
