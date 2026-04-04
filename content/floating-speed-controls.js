/**
 * Yutu Labs - Floating Window Speed Controls
 * Injects quick playback controls inside yutu popup windows.
 */

import { loadSettings, saveSettings, isYutuPopupWindow, STORAGE_KEY } from './config.js';

const CONTROL_ID = 'yutu-floating-speed-controls';
const POPUP_ROW_SLOT_ID = 'yutu-popup-speed-slot';
const PRESET_SPEEDS = [1, 1.25, 1.5, 2];
const SHORTCUTS_BY_CODE = {
  Digit1: 1,
  Digit2: 1.25,
  Digit3: 1.5,
  Digit4: 2
};

export class FloatingSpeedControls {
  constructor(options = {}) {
    this.enableOnRegularPages = options.enableOnRegularPages ?? false;
    this.manager = options.manager ?? null;
    this.video = null;
    this.closeOnFinish = true;
    this.isPopupWindow = false;
    this.popupRowResizeObserver = null;
    this.onRateChangeBound = this.onRateChange.bind(this);
    this.onVideoEndedBound = this.onVideoEnded.bind(this);
  }

  init() {
    this.isPopupWindow = isYutuPopupWindow();
    if (!this.isPopupWindow && !this.enableOnRegularPages) return;

    this.loadPreferences();
    const syncControls = () => {
      this.ensureControlsMounted();
      this.bindToCurrentVideo();
    };

    syncControls();
    if (this.manager) {
      this.manager.onMutation(syncControls);
    }
    window.addEventListener('yt-navigate-finish', () => setTimeout(syncControls, 250));
    this.setupKeyboardShortcuts();
    this.setupStorageListener();
  }

  ensureControlsMounted() {
    const existing = document.getElementById(CONTROL_ID);
    const anchor = this.getControlsAnchor();
    if (!anchor) return;

    if (existing?.isConnected && existing.parentElement === anchor) {
      this.syncLayoutMode(existing, anchor);
      return;
    }

    if (existing) {
      anchor.appendChild(existing);
      this.syncLayoutMode(existing, anchor);
      return;
    }

    const root = document.createElement('div');
    root.id = CONTROL_ID;
    root.className = 'yutu-floating-speed';
    if (!this.isPopupWindow) {
      root.classList.add('yutu-floating-speed--regular');
    }

    const label = document.createElement('div');
    label.className = 'yutu-floating-speed__label';
    const kbdIcon = document.createElement('span');
    kbdIcon.className = 'yutu-floating-speed__kbd-icon';
    kbdIcon.setAttribute('aria-hidden', 'true');
    kbdIcon.textContent = '\u2328';
    const kbdText = document.createElement('span');
    kbdText.className = 'yutu-floating-speed__kbd-text';
    kbdText.textContent = this.getShortcutHintText();
    label.appendChild(kbdIcon);
    label.appendChild(kbdText);

    const buttons = document.createElement('div');
    buttons.className = 'yutu-floating-speed__buttons';

    PRESET_SPEEDS.forEach((speed) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'yutu-floating-speed__btn';
      btn.dataset.speed = String(speed);
      btn.textContent = `${speed}x`;
      btn.title = this.getShortcutLabel(speed);
      btn.addEventListener('click', () => this.setSpeed(speed));
      buttons.appendChild(btn);
    });

    const closeToggle = document.createElement('label');
    closeToggle.className = 'yutu-floating-speed__close-wrap';
    const closeInput = document.createElement('input');
    closeInput.type = 'checkbox';
    closeInput.id = 'yutu-close-on-finish';
    closeInput.className = 'yutu-floating-speed__close-input';
    closeInput.checked = this.closeOnFinish;
    closeInput.addEventListener('change', (event) => {
      this.updateCloseOnFinish(Boolean(event.target.checked), { persist: true });
    });
    const closeText = document.createElement('span');
    closeText.className = 'yutu-floating-speed__close-text';
    closeText.textContent = 'Close on finish';
    closeToggle.appendChild(closeInput);
    closeToggle.appendChild(closeText);

    // "Close on finish" only makes sense for extension-created popup windows.
    if (!this.isPopupWindow) {
      closeToggle.style.display = 'none';
    }

    root.appendChild(label);
    root.appendChild(buttons);
    root.appendChild(closeToggle);
    anchor.appendChild(root);
    this.syncLayoutMode(root, anchor);

    this.syncActiveSpeed();
    this.syncCloseToggle();
  }

  getControlsAnchor() {
    if (this.isPopupWindow) {
      const topRow = document.querySelector('ytd-watch-metadata #top-row');
      if (topRow) {
        let slot = document.getElementById(POPUP_ROW_SLOT_ID);
        if (!slot || slot.parentElement !== topRow) {
          slot = document.createElement('div');
          slot.id = POPUP_ROW_SLOT_ID;
          slot.className = 'yutu-popup-speed-slot item style-scope ytd-watch-metadata';

          const actionsItem = topRow.querySelector(':scope > #actions');
          if (actionsItem) {
            topRow.insertBefore(slot, actionsItem);
          } else {
            topRow.appendChild(slot);
          }
        }
        return slot;
      }
    }

    // Prefer metadata area below the video (where Share/Save buttons live)
    const metadataAnchor =
      document.querySelector('ytd-watch-metadata ytd-menu-renderer') ||
      document.querySelector('#menu ytd-menu-renderer') ||
      document.querySelector('ytd-watch-metadata ytd-menu-renderer #top-level-buttons-computed') ||
      document.querySelector('#menu ytd-menu-renderer #top-level-buttons-computed');

    if (metadataAnchor) return metadataAnchor;

    // Only fall back to player container on regular pages (not popup windows)
    // to avoid overlaying controls on the video in the compact popup layout.
    if (this.isPopupWindow) return null;

    return document.querySelector('#movie_player') ||
      document.querySelector('.html5-video-player') ||
      document.querySelector('#player');
  }

  syncLayoutMode(root, anchor) {
    const isPopupRow = anchor.id === POPUP_ROW_SLOT_ID;
    const isMenuRow = anchor.matches('ytd-menu-renderer, #top-level-buttons-computed');

    root.classList.toggle('yutu-floating-speed--popup-row', isPopupRow);
    root.classList.toggle('yutu-floating-speed--menu', isMenuRow);

    if (isPopupRow) {
      this.setupPopupRowPositioning(anchor, root);
    }

    if (isMenuRow && window.getComputedStyle(anchor).position === 'static') {
      anchor.style.position = 'relative';
    }
  }

  setupPopupRowPositioning(anchor, root) {
    const topRow = anchor.parentElement;
    if (!topRow) return;

    if (window.getComputedStyle(topRow).position === 'static') {
      topRow.style.position = 'relative';
    }

    const updateMetrics = () => {
      const owner = topRow.querySelector(':scope > #owner');
      const actions = topRow.querySelector(':scope > #actions');
      const rowWidth = Math.round(topRow.getBoundingClientRect().width);
      const ownerWidth = Math.round(owner?.getBoundingClientRect().width || 0);
      const actionsWidth = Math.round(actions?.getBoundingClientRect().width || 0);
      const gutter = 24;
      const safeWidth = Math.max(180, rowWidth - (Math.max(ownerWidth, actionsWidth) * 2) - gutter);

      anchor.style.setProperty('--yutu-popup-safe-width', `${safeWidth}px`);
      root.classList.toggle('yutu-floating-speed--compact', safeWidth < 320);
    };

    updateMetrics();

    if (!window.ResizeObserver) return;
    if (this.popupRowResizeObserver) {
      this.popupRowResizeObserver.disconnect();
    }

    this.popupRowResizeObserver = new ResizeObserver(updateMetrics);
    this.popupRowResizeObserver.observe(topRow);

    const owner = topRow.querySelector(':scope > #owner');
    const actions = topRow.querySelector(':scope > #actions');
    if (owner) this.popupRowResizeObserver.observe(owner);
    if (actions) this.popupRowResizeObserver.observe(actions);
  }

  bindToCurrentVideo() {
    const currentVideo = document.querySelector('video');
    if (!currentVideo) return;

    if (this.video === currentVideo) {
      this.syncActiveSpeed();
      return;
    }

    if (this.video) {
      this.video.removeEventListener('ratechange', this.onRateChangeBound);
      this.video.removeEventListener('ended', this.onVideoEndedBound);
    }

    this.video = currentVideo;
    this.video.addEventListener('ratechange', this.onRateChangeBound);
    this.video.addEventListener('ended', this.onVideoEndedBound);

    this.syncActiveSpeed();
  }

  setSpeed(speed) {
    if (!this.video) {
      this.bindToCurrentVideo();
    }

    if (!this.video) return;

    this.video.playbackRate = speed;
    this.syncActiveSpeed();
  }

  onRateChange() {
    this.syncActiveSpeed();
  }

  onVideoEnded() {
    if (!this.isPopupWindow || !this.closeOnFinish) return;
    this.requestCloseFloatingWindow();
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (event) => {
      // Works on macOS Option (Alt) regardless of keyboard layout symbols.
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (this.isTypingContext(event.target)) return;

      const speed = SHORTCUTS_BY_CODE[event.code];
      if (!speed) return;

      event.preventDefault();
      this.setSpeed(speed);
    });
  }

  isTypingContext(target) {
    if (!target) return false;
    const tagName = target.tagName?.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
    return Boolean(target.isContentEditable);
  }

  getShortcutLabel(speed) {
    const entry = Object.entries(SHORTCUTS_BY_CODE).find(([, value]) => value === speed);
    if (!entry) return `${speed}x`;
    const digit = entry[0].replace('Digit', '');
    return `${speed}x (${this.getShortcutModifierLabel()}+${digit})`;
  }

  getShortcutHintText() {
    return `${this.getShortcutModifierLabel()}+1..4`;
  }

  getShortcutModifierLabel() {
    return this.isMacPlatform() ? '⌥' : 'Alt';
  }

  isMacPlatform() {
    const platform = navigator.platform || navigator.userAgentData?.platform || '';
    return /mac/i.test(platform);
  }

  syncActiveSpeed() {
    const root = document.getElementById(CONTROL_ID);
    if (!root) return;

    const activeRate = this.video?.playbackRate ?? 1;

    root.querySelectorAll('.yutu-floating-speed__btn').forEach((btn) => {
      const btnSpeed = Number(btn.dataset.speed);
      const isActive = Math.abs(btnSpeed - activeRate) < 0.01;
      btn.classList.toggle('yutu-floating-speed__btn--active', isActive);
    });
  }

  syncCloseToggle() {
    const input = document.getElementById('yutu-close-on-finish');
    if (!input) return;
    input.checked = this.closeOnFinish;
  }

  async loadPreferences() {
    try {
      const settings = await loadSettings();
      this.closeOnFinish = settings.closeOnFinish !== false;
      this.syncCloseToggle();
    } catch (error) {
      console.warn('Yutu Labs: failed loading close-on-finish preference', error);
    }
  }

  async updateCloseOnFinish(value, { persist } = { persist: false }) {
    this.closeOnFinish = value;
    this.syncCloseToggle();

    if (!persist) return;

    try {
      const settings = await loadSettings();
      await saveSettings({
        ...settings,
        closeOnFinish: value
      });
    } catch (error) {
      console.warn('Yutu Labs: failed saving close-on-finish preference', error);
    }
  }

  setupStorageListener() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local' || !changes[STORAGE_KEY]?.newValue) return;
      const closeOnFinish = changes[STORAGE_KEY].newValue.closeOnFinish;
      this.updateCloseOnFinish(closeOnFinish !== false);
    });
  }

  async requestCloseFloatingWindow() {
    try {
      await chrome.runtime.sendMessage({ action: 'closeFloatingWindow' });
    } catch (error) {
      // Fallback when messaging fails.
      window.close();
    }
  }
}
