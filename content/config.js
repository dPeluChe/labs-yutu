/**
 * Yush - Configuration Management
 * Centralized settings and storage utilities
 */

const HIDE_FLAGS_OFF = {
  hideReels: false,
  hideSidebar: false,
  hideDescription: false,
  hideHeader: false,
  hideActions: false,
  hideMerchShelf: false
};

export const DEFAULT_SETTINGS = {
  hideReels: true,
  hideSidebar: true,
  hideDescription: true,
  hideHeader: true,
  hideActions: true,
  hideMerchShelf: true,
  closeOnFinish: true,
  externalSites: {
    enabled: false,
    domains: []
  },
  customButtonSelector: '',
  // Same hide flags as the floating window, applied on regular /watch pages
  watchPage: { ...HIDE_FLAGS_OFF },
  // Hide the Shorts shelf on the Home feed
  hideHomeShorts: false,
  // Dim or hide Home cards older than `months` (YouTube resurfaces old videos)
  oldVideoFilter: { enabled: false, months: 6, mode: 'blur' }
};

export const STORAGE_KEY = 'yutuSettings';
const POPUP_SESSION_KEY = 'yutu_popup';

let _isPopupCached = null;

/**
 * Check if the current page is a Yush popup window.
 * Result is cached since the URL does not change during page lifetime.
 */
export function isFloatingWindow() {
  if (_isPopupCached === null) {
    const params = new URLSearchParams(window.location.search);
    const popupFromQuery = params.get('yutu_popup') === 'true';
    const popupFromSession = window.sessionStorage.getItem(POPUP_SESSION_KEY) === 'true';

    if (popupFromQuery) {
      window.sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
    }

    _isPopupCached = popupFromQuery || popupFromSession;
  }
  return _isPopupCached;
}

/**
 * Load settings from chrome.storage.local
 * @returns {Promise<Object>} Settings object
 */
export async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] || {};
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      externalSites: {
        ...DEFAULT_SETTINGS.externalSites,
        ...(stored.externalSites || {})
      },
      watchPage: { ...DEFAULT_SETTINGS.watchPage, ...(stored.watchPage || {}) },
      oldVideoFilter: { ...DEFAULT_SETTINGS.oldVideoFilter, ...(stored.oldVideoFilter || {}) }
    };
  } catch (error) {
    console.error('Error loading settings from storage:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save settings to chrome.storage.local
 * @param {Object} settings - Settings object to save
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: settings });
  } catch (error) {
    console.error('❌ Error saving settings to storage:', error);
    throw error;
  }
}
