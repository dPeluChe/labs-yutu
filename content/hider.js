/**
 * Yutu Labs - Element Hider
 * Dynamically hides YouTube elements based on extension settings
 * Only applies to windows opened by the extension (yutu_popup=true parameter)
 */

import { DEFAULT_SETTINGS, loadSettings as loadConfig } from './config.js';

let currentSettings = { ...DEFAULT_SETTINGS };
let isYutuPopupWindow = false;

/**
 * CSS selectors for elements to hide
 */
const SELECTORS = {
  reels: 'ytd-reel-shelf-renderer',
  sidebar: 'yt-lockup-view-model',
  description: '#description',
  header: 'ytd-masthead'
};

/**
 * Check if current page is a Yutu popup window
 */
function checkIfYutuPopup() {
  const urlParams = new URLSearchParams(window.location.search);
  isYutuPopupWindow = urlParams.get('yutu_popup') === 'true';

  if (isYutuPopupWindow) {
    console.log('✅ Yutu Labs: This is a popup window, applying element hiding');
  } else {
    console.log('ℹ️ Yutu Labs: This is a regular YouTube page, skipping element hiding');
  }

  return isYutuPopupWindow;
}

/**
 * Apply CSS to hide/show elements based on settings (only in Yutu popup windows)
 */
function applySettings(settings) {
  // Only apply in Yutu popup windows
  if (!isYutuPopupWindow) {
    console.log('ℹ️ Yutu Labs: Skipping - not a popup window');
    return;
  }

  console.log('🎨 Applying Yutu Labs settings:', settings);

  // Store current settings
  currentSettings = { ...settings };

  // Remove old style tag if exists
  const oldStyle = document.getElementById('yutu-hider-styles');
  if (oldStyle) {
    oldStyle.remove();
  }

  // Build CSS rules
  const cssRules = [];

  if (settings.hideReels) {
    cssRules.push(`${SELECTORS.reels} { display: none !important; }`);
  }

  if (settings.hideSidebar) {
    // Hide sidebar recommendations
    cssRules.push(`${SELECTORS.sidebar} { display: none !important; }`);

    // Also hide the secondary column (sidebar container)
    cssRules.push(`#secondary, #secondary-inner { display: none !important; }`);
  }

  if (settings.hideDescription) {
    cssRules.push(`${SELECTORS.description} { display: none !important; }`);
  }

  if (settings.hideHeader) {
    cssRules.push(`${SELECTORS.header} { display: none !important; }`);
  }

  // Apply new styles if there are rules
  if (cssRules.length > 0) {
    const style = document.createElement('style');
    style.id = 'yutu-hider-styles';
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
    if (areaName === 'local' && changes.yutuSettings) {
      console.log('🔄 Storage changed:', changes.yutuSettings.newValue);
      applySettings(changes.yutuSettings.newValue);
    }
  });
}

/**
 * Initialize hider
 */
function init() {
  console.log('🚀 Yutu Labs Hider initializing...');

  // Check if this is a Yutu popup window
  checkIfYutuPopup();

  // Only load settings and setup listeners if it's a popup window
  if (isYutuPopupWindow) {
    // Load initial settings
    loadSettings();

    // Setup listeners
    setupMessageListener();
    setupStorageListener();
  }

  console.log('✅ Yutu Labs Hider initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging (accessible from console)
if (typeof window !== 'undefined') {
  window.yutuHider = {
    applySettings,
    loadSettings,
    getSettings: () => currentSettings
  };
}
