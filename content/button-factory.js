/**
 * Yutu Labs - Button Factory
 *
 * Two buttons per card:
 *   1. Thumbnail icon — always visible, top-left of preview image
 *   2. Metadata "Open" — appears on card hover, inline in metadata row
 */

import { CARD_SELECTORS, VIDEO_LINK_SELECTOR, EXTERNAL_LINK_SELECTOR, GOOGLE_CONTEXT_SELECTOR } from './selectors.js';
import { extractVideoTarget } from './url-utils.js';

const THUMB_SELECTORS = [
  'a.ytLockupViewModelContentImage',
  'a#thumbnail',
  'ytd-thumbnail a',
  '.shortsLockupViewModelHostThumbnailParentContainer'
];

const META_SELECTORS = [
  'yt-lockup-metadata-view-model',
  '.shortsLockupViewModelHostOutsideMetadata',
  '#details',
  '#meta'
];

/**
 * Scan YouTube video cards and inject buttons.
 */
export function injectYouTubeCardButtons(onOpen, { customSelector = '' } = {}) {
  const cards = document.querySelectorAll(CARD_SELECTORS.join(','));

  cards.forEach((card) => {
    if (card.querySelector('.yutu-pip-btn')) return;

    const link = card.querySelector(VIDEO_LINK_SELECTOR);
    if (!link) return;

    const target = extractVideoTarget(link.href);
    if (!target) return;

    // 1. Thumbnail button (always visible icon)
    const thumb = findContainer(card, customSelector, THUMB_SELECTORS, link);
    if (thumb) {
      if (window.getComputedStyle(thumb).position === 'static') {
        thumb.style.position = 'relative';
      }
      thumb.appendChild(createThumbButton(target.url, onOpen));
    }

    // 2. Metadata "Open" button (hover to reveal)
    const meta = findContainer(card, null, META_SELECTORS, null);
    if (meta && meta !== thumb) {
      meta.appendChild(createMetaButton(target.url, onOpen));
    }
  });
}

/**
 * Scan links to YouTube/Vimeo on external pages.
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

function createThumbButton(targetUrl, onOpen) {
  const btn = document.createElement('button');
  btn.className = 'yutu-pip-btn';
  btn.setAttribute('aria-label', 'Open in floating window');
  btn.title = 'Open in floating window';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('height', '14');
  svg.setAttribute('width', '14');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z');
  svg.appendChild(path);
  btn.appendChild(svg);

  // Use capture phase + stopImmediatePropagation to prevent parent <a> from navigating
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    onOpen(targetUrl);
  }, true);

  return btn;
}

function createMetaButton(targetUrl, onOpen) {
  const btn = document.createElement('button');
  btn.className = 'yutu-pip-btn yutu-pip-btn--meta';
  btn.setAttribute('aria-label', 'Open in floating window');
  btn.title = 'Open in floating window';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('height', '10');
  svg.setAttribute('width', '10');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M8 5v14l11-7z');
  svg.appendChild(path);

  const span = document.createElement('span');
  span.textContent = 'Open';

  btn.appendChild(svg);
  btn.appendChild(span);

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

// --- Container finders ---

function findContainer(card, customSelector, selectors, link) {
  if (customSelector) {
    try {
      const el = card.querySelector(customSelector);
      if (el) return el;
    } catch { /* invalid */ }
  }

  for (const sel of selectors) {
    const el = card.querySelector(sel);
    if (el) return el;
  }

  // Fallback: walk up from link to find ancestor with img
  if (link) {
    if (link.querySelector('img')) return link;
    let candidate = link.parentElement;
    while (candidate && candidate !== card) {
      if (candidate.querySelector('img')) return candidate;
      candidate = candidate.parentElement;
    }
  }

  return null;
}

function isGoogleLinkContext(link) {
  return Boolean(link.closest('[jscontroller="rTuANe"], .WVV5ke, .g, .MjjYud, #search'));
}
