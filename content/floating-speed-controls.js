/**
 * Yush - Floating Window Speed Controls
 * Injects quick playback controls inside yutu popup windows.
 */

import { loadSettings, saveSettings, isFloatingWindow, STORAGE_KEY } from './config.js';
import { SHORTCUTS_BY_CODE, isTypingContext } from './speed-shortcuts.js';
import { CONTROL_ID, CLOSE_INPUT_ID, buildSpeedControls } from './speed-controls-ui.js';
import { POPUP_ROW_SLOT_ID, getControlsAnchor } from './speed-anchor.js';

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
    this.isPopupWindow = isFloatingWindow();
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
    const anchor = getControlsAnchor(this.isPopupWindow);
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

    const root = buildSpeedControls({
      isPopupWindow: this.isPopupWindow,
      closeOnFinish: this.closeOnFinish,
      onSpeed: (speed) => this.setSpeed(speed),
      onCloseChange: (value) => this.updateCloseOnFinish(value, { persist: true })
    });
    anchor.appendChild(root);
    this.syncLayoutMode(root, anchor);

    this.syncActiveSpeed();
    this.syncCloseToggle();
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
      if (isTypingContext(event.target)) return;

      const speed = SHORTCUTS_BY_CODE[event.code];
      if (!speed) return;

      event.preventDefault();
      this.setSpeed(speed);
    });
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
    const input = document.getElementById(CLOSE_INPUT_ID);
    if (!input) return;
    input.checked = this.closeOnFinish;
  }

  async loadPreferences() {
    try {
      const settings = await loadSettings();
      this.closeOnFinish = settings.closeOnFinish !== false;
      this.syncCloseToggle();
    } catch (error) {
      console.warn('Yush: failed loading close-on-finish preference', error);
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
      console.warn('Yush: failed saving close-on-finish preference', error);
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
