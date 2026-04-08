/**
 * Yutu Labs - Button Factory
 * Creates and injects "Open" / "View" buttons into video cards and links.
 */

import { CARD_SELECTORS, VIDEO_LINK_SELECTOR, EXTERNAL_LINK_SELECTOR, BUTTON_CONTAINER_SELECTORS, GOOGLE_CONTEXT_SELECTOR } from './selectors.js';
import { extractVideoTarget } from './url-utils.js';

/**
 * Scan YouTube video cards and inject an "Open" button on each.
 * @param {Function} onOpen - Called with the target URL when the user clicks Open.
 * @param {Object} options
 * @param {string} options.customSelector - User-defined CSS selector override (tried first).
 */
export function injectYouTubeCardButtons(onOpen, { customSelector = '' } = {}) {
  const cards = document.querySelectorAll(CARD_SELECTORS.join(','));

  cards.forEach((card) => {
    if (card.querySelector('.yutu-pip-btn')) return;

    const link = card.querySelector(VIDEO_LINK_SELECTOR);
    if (!link) return;

    const target = extractVideoTarget(link.href);
    if (!target) return;

    const container = findButtonContainer(card, link, customSelector);
    if (!container) return;

    const btn = createCardButton(target.url, onOpen, {
      offsetLeftForMenu: shouldOffsetForMenu(container)
    });

    if (window.getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    container.appendChild(btn);
  });
}

/**
 * Scan links to YouTube/Vimeo on the current page and inject a compact "View" button.
 * @param {Function} onOpen - Called with the target URL when the user clicks View.
 * @param {Object} options
 * @param {string} options.scope - 'google' restricts injection to Google SERP context, 'all' injects everywhere.
 */
export function injectExternalVideoLinkButtons(onOpen, { scope = 'all' } = {}) {
  const links = document.querySelectorAll(EXTERNAL_LINK_SELECTOR);

  links.forEach((link) => {
    if (link.dataset.yutuInlineInjected === '1') return;

    if (scope === 'google' && !isGoogleLinkContext(link)) return;

    const target = extractVideoTarget(link.href);
    if (!target) return;

    // Avoid duplicate if a card-level button already handles this link
    const resultCard = link.closest('[jscontroller="rTuANe"], .WVV5ke');
    if (resultCard && resultCard.querySelector('.yutu-inline-open-btn')) {
      link.dataset.yutuInlineInjected = '1';
      return;
    }

    if (link.closest(CARD_SELECTORS.join(','))) return;

    link.dataset.yutuInlineInjected = '1';

    const btn = createInlineButton(target.url, onOpen);
    const anchor = getExternalInjectionAnchor(link);
    anchor.insertAdjacentElement('afterend', btn);
  });
}

// --- Internal helpers ---

function createCardButton(targetUrl, onOpen, options = {}) {
  const btn = document.createElement('button');
  btn.className = 'yutu-pip-btn';
  if (options.offsetLeftForMenu) {
    btn.classList.add('yutu-pip-btn--offset-menu');
  }

  btn.setAttribute('aria-label', 'Open in floating window');
  btn.title = 'Open in floating window';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('height', '12');
  svg.setAttribute('width', '12');
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

/**
 * Find a container for the "Open" button.
 * 1. Try user's custom selector (if configured).
 * 2. Try known selectors (fast path for current YouTube markup).
 * 3. Fallback: walk up from the video link to find the first ancestor
 *    that contains a thumbnail image — this survives YouTube DOM reshuffles
 *    because a card always has a link wrapping a thumbnail <img>.
 */
function findButtonContainer(card, link, customSelector) {
  // User-defined override takes priority
  if (customSelector) {
    try {
      const custom = card.querySelector(customSelector);
      if (custom) return custom;
    } catch { /* invalid selector — fall through to defaults */ }
  }

  for (const selector of BUTTON_CONTAINER_SELECTORS) {
    const el = card.querySelector(selector);
    if (el) return el;
  }

  if (!link) return null;

  // Fallback: find the thumbnail wrapper by walking up from the link.
  // Look for the closest ancestor (still inside the card) that contains an <img>.
  let candidate = link;
  while (candidate && candidate !== card) {
    if (candidate.querySelector('img')) {
      return candidate;
    }
    candidate = candidate.parentElement;
  }

  // Last resort: use the card's first child with an <img>
  const imgHolder = card.querySelector('img');
  if (imgHolder) {
    return imgHolder.parentElement;
  }

  return null;
}

function shouldOffsetForMenu(container) {
  return container.classList.contains('ytLockupMetadataViewModelMenuButton') ||
    container.tagName?.toLowerCase() === 'yt-lockup-metadata-view-model' ||
    Boolean(container.querySelector('.shortsLockupViewModelHostOutsideMetadataMenu')) ||
    Boolean(container.querySelector('button[aria-label="More actions"]'));
}

function isGoogleLinkContext(link) {
  return Boolean(link.closest(GOOGLE_CONTEXT_SELECTOR));
}

function getExternalInjectionAnchor(link) {
  return link.closest('.V9tjod') || link;
}
