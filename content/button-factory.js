/**
 * Yutu Labs - Button Factory
 * Creates and injects "Open" buttons into video cards and links.
 *
 * Strategy: inject a single small button inside the thumbnail <a> tag.
 * Always visible (like YouTube's duration badge), no hover dependency.
 */

import { CARD_SELECTORS, VIDEO_LINK_SELECTOR, EXTERNAL_LINK_SELECTOR, GOOGLE_CONTEXT_SELECTOR } from './selectors.js';
import { extractVideoTarget } from './url-utils.js';

const THUMB_SELECTORS = [
  'a.ytLockupViewModelContentImage',
  'a#thumbnail',
  'ytd-thumbnail a',
  '.shortsLockupViewModelHostThumbnailParentContainer'
];

/**
 * Scan YouTube video cards and inject a button on each thumbnail.
 */
export function injectYouTubeCardButtons(onOpen, { customSelector = '' } = {}) {
  const cards = document.querySelectorAll(CARD_SELECTORS.join(','));

  cards.forEach((card) => {
    if (card.querySelector('.yutu-pip-btn')) return;

    const link = card.querySelector(VIDEO_LINK_SELECTOR);
    if (!link) return;

    const target = extractVideoTarget(link.href);
    if (!target) return;

    const container = findThumbContainer(card, link, customSelector);
    if (!container) return;

    if (window.getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    container.appendChild(createButton(target.url, onOpen));
  });
}

/**
 * Scan links to YouTube/Vimeo on the current page and inject a compact "View" button.
 */
export function injectExternalVideoLinkButtons(onOpen, { scope = 'all' } = {}) {
  const links = document.querySelectorAll(EXTERNAL_LINK_SELECTOR);

  links.forEach((link) => {
    if (link.dataset.yutuInlineInjected === '1') return;
    if (scope === 'google' && !isGoogleLinkContext(link)) return;

    const target = extractVideoTarget(link.href);
    if (!target) return;

    const resultCard = link.closest('[jscontroller="rTuANe"], .WVV5ke');
    if (resultCard && resultCard.querySelector('.yutu-inline-open-btn')) {
      link.dataset.yutuInlineInjected = '1';
      return;
    }
    if (link.closest(CARD_SELECTORS.join(','))) return;

    link.dataset.yutuInlineInjected = '1';
    const btn = createInlineButton(target.url, onOpen);
    const anchor = link.closest('.V9tjod') || link;
    anchor.insertAdjacentElement('afterend', btn);
  });
}

// --- Button creators ---

function createButton(targetUrl, onOpen) {
  const btn = document.createElement('button');
  btn.className = 'yutu-pip-btn';
  btn.setAttribute('aria-label', 'Open in floating window');
  btn.title = 'Open in floating window';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('height', '14');
  svg.setAttribute('width', '14');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');

  // "open in new window" icon
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z');
  svg.appendChild(path);
  btn.appendChild(svg);

  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOpen(targetUrl);
  };

  return btn;
}

function createInlineButton(targetUrl, onOpen) {
  const btn = document.createElement('button');
  btn.className = 'yutu-inline-open-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open video in floating window');
  btn.title = 'Open in floating window';
  btn.textContent = 'View';

  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOpen(targetUrl);
  };

  return btn;
}

// --- Container finder ---

function findThumbContainer(card, link, customSelector) {
  // User override
  if (customSelector) {
    try {
      const el = card.querySelector(customSelector);
      if (el) return el;
    } catch { /* invalid */ }
  }

  // Try known thumbnail containers
  for (const sel of THUMB_SELECTORS) {
    const el = card.querySelector(sel);
    if (el) return el;
  }

  // Fallback: the link itself if it contains an image
  if (link.querySelector('img')) return link;

  // Walk up from link to find ancestor with img
  let candidate = link.parentElement;
  while (candidate && candidate !== card) {
    if (candidate.querySelector('img')) return candidate;
    candidate = candidate.parentElement;
  }

  return null;
}

function isGoogleLinkContext(link) {
  return Boolean(link.closest('[jscontroller="rTuANe"], .WVV5ke, .g, .MjjYud, #search'));
}
