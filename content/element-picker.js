/**
 * Yush - Visual Element Picker
 * Lets users click on a YouTube element to generate a CSS selector.
 * Activated from the popup "Selector" tab.
 */

import { loadSettings, saveSettings } from './config.js';

let active = false;
let overlay = null;
let highlight = null;
let label = null;
let banner = null;
let lastTarget = null;

export function startPicker(onPick) {
  if (active) return;
  active = true;

  // Banner
  banner = document.createElement('div');
  banner.className = 'yutu-picker-banner';
  banner.textContent = 'Click an element to use as button container — Press Esc to cancel';
  document.body.appendChild(banner);

  // Highlight box
  highlight = document.createElement('div');
  highlight.className = 'yutu-picker-highlight';
  document.body.appendChild(highlight);

  // Selector label
  label = document.createElement('div');
  label.className = 'yutu-picker-label';
  label.style.display = 'none';
  document.body.appendChild(label);

  // Transparent overlay to capture events
  overlay = document.createElement('div');
  overlay.className = 'yutu-picker-overlay';
  document.body.appendChild(overlay);

  overlay.addEventListener('mousemove', onMove);
  overlay.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);

  function onMove(e) {
    // Hide overlay briefly to get real element underneath
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = '';

    if (!el || el === overlay || el === banner || el === highlight || el === label) {
      highlight.style.display = 'none';
      label.style.display = 'none';
      lastTarget = null;
      return;
    }

    lastTarget = el;
    const rect = el.getBoundingClientRect();
    highlight.style.display = 'block';
    highlight.style.top = rect.top + 'px';
    highlight.style.left = rect.left + 'px';
    highlight.style.width = rect.width + 'px';
    highlight.style.height = rect.height + 'px';

    const selector = buildSelector(el);
    label.textContent = selector;
    label.style.display = 'block';
    label.style.top = Math.max(0, rect.top - 28) + 'px';
    label.style.left = rect.left + 'px';
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (lastTarget) {
      const selector = buildSelector(lastTarget);
      cleanup();
      onPick(selector);
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      cleanup();
      onPick(null); // cancelled
    }
  }

  function cleanup() {
    active = false;
    overlay?.remove();
    highlight?.remove();
    label?.remove();
    banner?.remove();
    document.removeEventListener('keydown', onKey);
    overlay = highlight = label = banner = lastTarget = null;
  }
}

/**
 * Build a readable CSS selector for an element.
 * Prefers class names, falls back to tag + nth-child.
 */
function buildSelector(el) {
  const parts = [];
  let current = el;
  let depth = 0;

  while (current && current !== document.body && depth < 4) {
    const tag = current.tagName.toLowerCase();

    // Skip custom element wrappers that are too generic
    if (tag === 'ytd-rich-item-renderer' || tag === 'ytd-video-renderer') break;

    // Prefer unique class names
    const classes = Array.from(current.classList)
      .filter(c =>
        !c.startsWith('style-scope') &&
        !c.startsWith('yt-') &&
        !c.startsWith('ytCore') &&
        c.length < 50
      );

    if (current.id && !current.id.startsWith('_')) {
      parts.unshift(`#${current.id}`);
      break;
    } else if (classes.length > 0) {
      parts.unshift(`.${classes[0]}`);
    } else {
      parts.unshift(tag);
    }

    current = current.parentElement;
    depth++;
  }

  return parts.join(' > ') || el.tagName.toLowerCase();
}

/**
 * Listen for picker activation from popup.
 */
export function setupPickerListener() {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'startElementPicker') {
      startPicker(async (selector) => {
        if (selector) {
          // Save directly to storage since popup is closed
          const settings = await loadSettings();
          settings.customButtonSelector = selector;
          await saveSettings(settings);
        }
      });
      sendResponse({ started: true });
    }
  });
}
