/**
 * Yush - Old video filter
 * Marks Home cards older than N months so CSS can blur them (clears on hover) or hide them.
 */

import { loadSettings, STORAGE_KEY } from './config.js';
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
  constructor({ manager }) {
    this.manager = manager;
    this.config = { enabled: false, months: 6, mode: 'blur' };
  }

  async init() {
    this.config = (await loadSettings()).oldVideoFilter;
    this.manager.onMutation(() => this.scan());
    window.addEventListener('yt-navigate-finish', () => setTimeout(() => this.refresh(), 250));
    chrome.storage.onChanged.addListener((changes, areaName) => {
      const next = changes[STORAGE_KEY]?.newValue?.oldVideoFilter;
      if (areaName !== 'local' || !next) return;
      this.config = { ...this.config, ...next };
      this.refresh();
    });
    this.scan();
  }

  /** Home is the only feed with resurfaced old videos; detected by path, not by YouTube's markup. */
  isHome() {
    return window.location.pathname === '/';
  }

  scan() {
    if (!this.config.enabled || !this.isHome()) return;
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
    if (isOld) card.setAttribute(OLD_ATTR, this.config.mode);
    else card.removeAttribute(OLD_ATTR);
  }

  /** Re-evaluate already-measured cards after a settings change. */
  refresh() {
    if (!this.config.enabled || !this.isHome()) {
      for (const card of document.querySelectorAll(`[${OLD_ATTR}]`)) card.removeAttribute(OLD_ATTR);
      return;
    }
    for (const card of document.querySelectorAll(`[${AGE_ATTR}]`)) this.classify(card);
    this.scan();
  }
}
