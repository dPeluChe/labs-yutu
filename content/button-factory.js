/**
 * Yutu Labs - Button Factory
 * Creates and injects "Open" / "View" buttons into video cards and links.
 *
 * Two buttons per card (new lockup model):
 *   1. Thumbnail button — small icon on the preview image, visible on image hover
 *   2. Metadata button  — "Open" text in the metadata row, visible on card hover
 *
 * Classic layouts (ytd-thumbnail, #details) get a single button.
 */

import { CARD_SELECTORS, VIDEO_LINK_SELECTOR, EXTERNAL_LINK_SELECTOR, BUTTON_CONTAINER_SELECTORS, GOOGLE_CONTEXT_SELECTOR } from './selectors.js';
import { extractVideoTarget } from './url-utils.js';

// Selectors for the thumbnail <a> in the new lockup model
const THUMB_LINK_SELECTOR = 'a.ytLockupViewModelContentImage';

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

    // --- Thumbnail button (inside the <a> that wraps the image) ---
    const thumbLink = card.querySelector(THUMB_LINK_SELECTOR);
    if (thumbLink) {
      if (window.getComputedStyle(thumbLink).position === 'static') {
        thumbLink.style.position = 'relative';
      }
      thumbLink.appendChild(createThumbButton(target.url, onOpen));
    }

    // --- Metadata button (inline in the metadata row) ---
    const metaContainer = findButtonContainer(card, link, customSelector);
    if (metaContainer && metaContainer !== thumbLink) {
      metaContainer.appendChild(createCardButton(target.url, onOpen, {
        offsetLeftForMenu: shouldOffsetForMenu(metaContainer)
      }));
    }

    // If neither worked, try the fallback container for a single button
    if (!thumbLink && !metaContainer) {
      const fallback = findFallbackContainer(card, link);
      if (fallback) {
        if (window.getComputedStyle(fallback).position === 'static') {
          fallback.style.position = 'relative';
        }
        fallback.appendChild(createCardButton(target.url, onOpen));
      }
    }
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
    const anchor = getExternalInjectionAnchor(link);
    anchor.insertAdjacentElement('afterend', btn);
  });
}

// --- Button creators ---

/** Small icon-only button for the thumbnail overlay */
function createThumbButton(targetUrl, onOpen) {
  const btn = document.createElement('button');
  btn.className = 'yutu-pip-btn yutu-pip-btn--thumb';
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

  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOpen(targetUrl);
  };

  return btn;
}

/** Text button for the metadata row */
function createCardButton(targetUrl, onOpen, options = {}) {
  const btn = document.createElement('button');
  btn.className = 'yutu-pip-btn yutu-pip-btn--meta';
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

// --- Container finders ---

function findButtonContainer(card, link, customSelector) {
  if (customSelector) {
    try {
      const custom = card.querySelector(customSelector);
      if (custom) return custom;
    } catch { /* invalid selector */ }
  }

  for (const selector of BUTTON_CONTAINER_SELECTORS) {
    const el = card.querySelector(selector);
    if (el) return el;
  }

  return null;
}

/** Walk up from the link to find a thumbnail-like container */
function findFallbackContainer(card, link) {
  let candidate = link;
  while (candidate && candidate !== card) {
    if (candidate.querySelector('img')) return candidate;
    candidate = candidate.parentElement;
  }

  const img = card.querySelector('img');
  return img ? img.parentElement : null;
}

function shouldOffsetForMenu(container) {
  return Boolean(container.querySelector('.shortsLockupViewModelHostOutsideMetadataMenu')) ||
    Boolean(container.querySelector('button[aria-label="More actions"]'));
}

function isGoogleLinkContext(link) {
  return Boolean(link.closest(GOOGLE_CONTEXT_SELECTOR));
}

function getExternalInjectionAnchor(link) {
  return link.closest('.V9tjod') || link;
}
