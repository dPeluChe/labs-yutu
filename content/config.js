/**
 * Yutu Labs - Configuration Management
 * Centralized settings and storage utilities
 */

export const DEFAULT_SETTINGS = {
  hideReels: true,
  hideSidebar: true,
  hideDescription: true,
  hideHeader: true,
  hideActions: true,
  hideMerchShelf: true
};

export const STORAGE_KEY = 'yutuSettings';

/**
 * Load settings from chrome.storage.local
 * @returns {Promise<Object>} Settings object
 */
export async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return {
      ...DEFAULT_SETTINGS,
      ...(result[STORAGE_KEY] || {})
    };
  } catch (error) {
    console.error('❌ Error loading settings from storage:', error);
    return DEFAULT_SETTINGS;
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
    console.log('✅ Settings saved to storage:', settings);
  } catch (error) {
    console.error('❌ Error saving settings to storage:', error);
    throw error;
  }
}
