/**
 * Yutu Labs - Element Hider
 * Dynamically hides YouTube elements based on extension settings
 * Only applies to windows opened by the extension (yutu_popup=true parameter)
 */

import { DEFAULT_SETTINGS, STORAGE_KEY, loadSettings as loadConfig, isYutuPopupWindow } from './config.js';
import { HIDER_SELECTORS } from './selectors.js';

let currentSettings = { ...DEFAULT_SETTINGS };
const POPUP_LAYOUT_STYLE_ID = 'yutu-popup-layout-styles';
const POPUP_TITLE_ID = 'yutu-popup-floating-title';
const HIDER_STYLE_ID = 'yutu-hider-styles';


/**
 * Apply CSS to hide/show elements based on settings (only in Yutu popup windows)
 */
function applySettings(settings) {
  // Only apply in Yutu popup windows
  if (!isYutuPopupWindow()) {
    return;
  }

  console.log('🎨 Applying Yutu Labs settings:', settings);

  // Store current settings
  currentSettings = { ...settings };
  applyPopupLayoutStyles();

  // Remove old style tag if exists
  const oldStyle = document.getElementById(HIDER_STYLE_ID);
  if (oldStyle) {
    oldStyle.remove();
  }

  // Build CSS rules
  const cssRules = [];

  if (settings.hideReels) {
    cssRules.push(`${HIDER_SELECTORS.reels} { display: none !important; }`);
  }

  if (settings.hideSidebar) {
    cssRules.push(`${HIDER_SELECTORS.sidebar} { display: none !important; }`);
  }

  if (settings.hideDescription) {
    cssRules.push(`${HIDER_SELECTORS.description} { display: none !important; }`);
  }

  if (settings.hideHeader) {
    cssRules.push(`${HIDER_SELECTORS.header} { display: none !important; }`);
  }

  // Apply new styles if there are rules
  if (cssRules.length > 0) {
    const style = document.createElement('style');
    style.id = HIDER_STYLE_ID;
    style.textContent = cssRules.join('\n');
    document.head.appendChild(style);

    console.log(`✅ Applied ${cssRules.length} CSS rules`);
  } else {
    console.log('ℹ️ No elements to hide');
  }
}

/**
 * Load settings from chrome.storage
 */
async function loadSettings() {
  try {
    const settings = await loadConfig();

    console.log('📦 Loaded settings from storage:', settings);
    applySettings(settings);
  } catch (error) {
    console.error('❌ Error loading settings:', error);
  }
}

/**
 * Setup message listener for settings updates from popup
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateHiddenElements') {
      console.log('📨 Received settings update:', request.settings);
      applySettings(request.settings);
      sendResponse({ success: true });
    }
  });
}

/**
 * Setup storage change listener
 */
function setupStorageListener() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      applySettings(changes[STORAGE_KEY].newValue);
    }
  });
}

function applyPopupLayoutStyles() {
  let style = document.getElementById(POPUP_LAYOUT_STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = POPUP_LAYOUT_STYLE_ID;
    document.head.appendChild(style);
  }

  const popupRules = [
    // We render our own title bar above ytd-app.
    'ytd-watch-metadata #title { display: none !important; }'
  ];

  if (currentSettings.hideActions) {
    popupRules.push('segmented-like-dislike-button-view-model { display: none !important; }');
    popupRules.push('ytd-menu-renderer yt-button-shape#button-shape { display: none !important; }');
  }

  if (currentSettings.hideMerchShelf) {
    popupRules.push('ytd-merch-shelf-renderer { display: none !important; }');
    popupRules.push('#merch-shelf { display: none !important; }');
    popupRules.push('#below ytd-merch-shelf-renderer { display: none !important; }');
  }

  style.textContent = popupRules.join('\n');
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
  const titleText = titleNode?.textContent?.trim() || fallbackTitle || 'YouTube';
  titleBar.textContent = titleText;
}

function setupPopupLayoutObserver() {
  const reapplyPopupState = () => {
    applyPopupLayoutStyles();
    syncPopupTopTitle();
    void loadSettings();
  };

  window.addEventListener('yt-navigate-finish', () => {
    setTimeout(reapplyPopupState, 250);
    setTimeout(reapplyPopupState, 1200);
  });
}

/**
 * Initialize hider
 */
function init() {
  console.log('🚀 Yutu Labs Hider initializing...');

  // Only load settings and setup listeners if it's a popup window
  if (isYutuPopupWindow()) {
    // Load initial settings
    loadSettings();

    // Setup listeners
    setupMessageListener();
    setupStorageListener();
    applyPopupLayoutStyles();
    syncPopupTopTitle();
    setupPopupLayoutObserver();
  }

  console.log('✅ Yutu Labs Hider initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
