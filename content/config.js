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

const NESTED_KEYS = Object.keys(DEFAULT_SETTINGS).filter(
  (key) => DEFAULT_SETTINGS[key] && typeof DEFAULT_SETTINGS[key] === 'object'
);

/** Defaults overlaid with stored values, merging one level deep for object settings. */
export function mergeSettings(stored = {}) {
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  for (const key of NESTED_KEYS) merged[key] = { ...DEFAULT_SETTINGS[key], ...stored[key] };
  return merged;
}

const subscribers = new Set();

/** Calls `callback` with the complete (merged) settings whenever they change in storage. */
export function subscribeSettings(callback) {
  subscribers.add(callback);
  if (subscribers.size > 1) return;
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[STORAGE_KEY]) return;
    const settings = mergeSettings(changes[STORAGE_KEY].newValue);
    for (const notify of subscribers) notify(settings);
  });
}

/**
 * Load settings from chrome.storage.local
 * @returns {Promise<Object>} Settings object
 */
export async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return mergeSettings(result[STORAGE_KEY]);
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
