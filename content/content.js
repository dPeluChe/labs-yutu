/**
 * Yush - Core Manager
 * Orchestrates button injection and DOM observation.
 * Delegates URL parsing, button creation, and messaging to dedicated modules.
 */

import { injectYouTubeCardButtons, injectExternalVideoLinkButtons, resetInjectedButtons } from './button-factory.js';
import { openFloatingWindow } from './messaging.js';

export { attachPlaybackMessageListener } from './messaging.js';

const DEFAULT_DEBOUNCE_MS = 150;

export class YushManager {
  constructor(options = {}) {
    this.observer = null;
    this.injectTimer = null;
    this._subscriberTimer = null;
    this.injectDebounceMs = options.injectDebounceMs ?? DEFAULT_DEBOUNCE_MS;
    this.enableYouTubeCards = options.enableYouTubeCards ?? false;
    this.enableExternalLinks = options.enableExternalLinks ?? false;
    this.externalScope = options.externalScope ?? 'all';
    this.customButtonSelector = options.customButtonSelector ?? '';
    this.observeSelector = options.observeSelector ?? null;
    this.mutationSubscribers = [];

    this.handleOpen = (targetUrl) => openFloatingWindow(targetUrl);
  }

  init() {
    this.injectButtons();
    this.observe();
    this.setupCleanup();
  }

  onMutation(callback) {
    this.mutationSubscribers.push(callback);
  }

  // --- Observation ---

  observe() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          this.scheduleInject();
          this.scheduleMutationSubscribers();
          return;
        }
      }
    });

    const root = (this.observeSelector && document.querySelector(this.observeSelector)) || document.body;
    this.observer.observe(root, {
      childList: true,
      subtree: true
    });
  }

  scheduleInject() {
    if (this.injectTimer) clearTimeout(this.injectTimer);

    this.injectTimer = setTimeout(() => {
      this.injectButtons();
      this.injectTimer = null;
    }, this.injectDebounceMs);
  }

  scheduleMutationSubscribers() {
    if (this._subscriberTimer) return;
    this._subscriberTimer = setTimeout(() => {
      this._subscriberTimer = null;
      for (const cb of this.mutationSubscribers) cb();
    }, this.injectDebounceMs);
  }

  // --- Injection ---

  setCustomSelector(selector) {
    const next = selector || '';
    if (next === this.customButtonSelector) return;
    this.customButtonSelector = next;
    resetInjectedButtons();
    this.injectButtons();
  }

  injectButtons() {
    if (this.enableYouTubeCards) {
      injectYouTubeCardButtons(this.handleOpen, {
        customSelector: this.customButtonSelector
      });
    }

    if (this.enableExternalLinks) {
      injectExternalVideoLinkButtons(this.handleOpen, { scope: this.externalScope });
    }
  }

  // --- Cleanup ---

  setupCleanup() {
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.injectTimer) {
      clearTimeout(this.injectTimer);
      this.injectTimer = null;
    }
    if (this._subscriberTimer) {
      clearTimeout(this._subscriberTimer);
      this._subscriberTimer = null;
    }
  }
}
