/**
 * Yutu Labs - Floating Window Speed Controls
 * Injects quick playback controls inside yutu popup windows.
 */

const CONTROL_ID = 'yutu-floating-speed-controls';
const PRESET_SPEEDS = [1, 1.25, 1.5, 2];
const SHORTCUTS_BY_CODE = {
  Digit1: 1,
  Digit2: 1.25,
  Digit3: 1.5,
  Digit4: 2
};

export class FloatingSpeedControls {
  constructor() {
    this.video = null;
    this.videoObserver = null;
    this.onRateChangeBound = this.onRateChange.bind(this);
  }

  init() {
    if (!this.isYutuPopupWindow()) return;

    this.ensureControlsMounted();
    this.bindToCurrentVideo();
    this.observeVideoChanges();
    this.setupKeyboardShortcuts();

    window.addEventListener('yt-navigate-finish', () => {
      setTimeout(() => {
        this.ensureControlsMounted();
        this.bindToCurrentVideo();
      }, 300);
    });
  }

  isYutuPopupWindow() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('yutu_popup') === 'true';
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

    const label = document.createElement('div');
    label.className = 'yutu-floating-speed__label';
    const shortcutHint = this.getShortcutHintText();
    label.innerHTML = `
      <span class="yutu-floating-speed__kbd-icon" aria-hidden="true">⌨</span>
      <span class="yutu-floating-speed__kbd-text">${shortcutHint}</span>
    `;

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

    root.appendChild(label);
    root.appendChild(buttons);
    anchor.appendChild(root);
    this.syncLayoutMode(root, anchor);

    this.syncActiveSpeed();
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
    }

    this.video = currentVideo;
    this.video.addEventListener('ratechange', this.onRateChangeBound);

    this.syncActiveSpeed();
  }

  observeVideoChanges() {
    if (this.videoObserver) return;

    this.videoObserver = new MutationObserver(() => {
      this.bindToCurrentVideo();
    });

    this.videoObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
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
}
