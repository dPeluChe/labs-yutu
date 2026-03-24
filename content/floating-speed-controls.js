/**
 * Yutu Labs - Floating Window Speed Controls
 * Injects quick playback controls inside yutu popup windows.
 */

import { loadSettings, saveSettings, isYutuPopupWindow, STORAGE_KEY } from './config.js';

const CONTROL_ID = 'yutu-floating-speed-controls';
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
    this.onRateChangeBound = this.onRateChange.bind(this);
    this.onVideoEndedBound = this.onVideoEnded.bind(this);
  }

  init() {
    this.isPopupWindow = isYutuPopupWindow();
    if (!this.isPopupWindow && !this.enableOnRegularPages) return;

    this.loadPreferences();
    this.ensureControlsMounted();
    this.bindToCurrentVideo();
    if (this.manager) {
      this.manager.onMutation(() => this.bindToCurrentVideo());
    }
    this.setupKeyboardShortcuts();
    this.setupStorageListener();

    window.addEventListener('yt-navigate-finish', () => {
      setTimeout(() => {
        this.ensureControlsMounted();
        this.bindToCurrentVideo();
      }, 300);
    });
  }

  ensureControlsMounted() {
    const anchor = this.getControlsAnchor();
    if (!anchor) return;

    const existing = document.getElementById(CONTROL_ID);
    if (existing) {
      if (existing.parentElement !== anchor) {
        anchor.appendChild(existing);
      }
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
    return document.querySelector('ytd-watch-metadata ytd-menu-renderer') ||
      document.querySelector('#menu ytd-menu-renderer') ||
      document.querySelector('ytd-watch-metadata ytd-menu-renderer #top-level-buttons-computed') ||
      document.querySelector('#menu ytd-menu-renderer #top-level-buttons-computed') ||
      document.querySelector('#movie_player') ||
      document.querySelector('.html5-video-player') ||
      document.querySelector('#player');
  }

  syncLayoutMode(root, anchor) {
    const isMenuRow = anchor.matches('ytd-menu-renderer, #top-level-buttons-computed');
    root.classList.toggle('yutu-floating-speed--menu', isMenuRow);

    if (isMenuRow && window.getComputedStyle(anchor).position === 'static') {
      anchor.style.position = 'relative';
    }
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
