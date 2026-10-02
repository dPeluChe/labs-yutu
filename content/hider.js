/**
 * Yutu Labs - Element Hider
 * Floating windows (yutu_popup=true) use the top-level hide flags and get a custom title bar.
 * Regular tabs use `watchPage` flags, scoped to /watch via html[data-yutu-watch].
 */

import { loadSettings, STORAGE_KEY, isYutuPopupWindow } from './config.js';
import { buildHideCss } from './hide-rules.js';

const HIDER_STYLE_ID = 'yutu-hider-styles';
const POPUP_TITLE_ID = 'yutu-popup-floating-title';
const WATCH_SCOPE = 'html[data-yutu-watch]';
const POPUP_ONLY_CSS = 'ytd-watch-metadata #title { display: none !important; }';

const isPopup = isYutuPopupWindow();
let currentSettings = null;

function setStyle(css) {
  let style = document.getElementById(HIDER_STYLE_ID);
  if (!css) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement('style');
    style.id = HIDER_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
}

function applySettings(settings) {
  currentSettings = settings;
  if (isPopup) {
    setStyle([buildHideCss(settings), POPUP_ONLY_CSS].join('\n'));
  } else {
    setStyle(buildHideCss(settings.watchPage, WATCH_SCOPE));
  }
}

function syncWatchFlag() {
  document.documentElement.toggleAttribute('data-yutu-watch', location.pathname === '/watch');
}

function syncPopupTopTitle() {
  const appRoot = document.querySelector('ytd-app');
  if (!appRoot) return;

  let titleBar = document.getElementById(POPUP_TITLE_ID);
  if (!titleBar) {
    titleBar = document.createElement('div');
    titleBar.id = POPUP_TITLE_ID;
    document.body.insertBefore(titleBar, appRoot);
  }

  const titleNode = document.querySelector('ytd-watch-metadata h1 yt-formatted-string');
  const fallbackTitle = (document.title || '').replace(/\s*-\s*YouTube\s*$/i, '').trim();
  titleBar.textContent = titleNode?.textContent?.trim() || fallbackTitle || 'YouTube';
}

async function reload() {
  try {
    applySettings(await loadSettings());
  } catch (error) {
    console.error('Yutu Labs: error loading settings', error);
  }
}

function onNavigate() {
  syncWatchFlag();
  if (!isPopup) return;
  // YouTube re-renders the watch page late after SPA navigation
  for (const delay of [250, 1200]) {
    setTimeout(() => {
      if (currentSettings) applySettings(currentSettings);
      syncPopupTopTitle();
    }, delay);
  }
}

function init() {
  syncWatchFlag();
  reload();
  if (isPopup) syncPopupTopTitle();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) reload();
  });
  window.addEventListener('yt-navigate-finish', onNavigate);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
