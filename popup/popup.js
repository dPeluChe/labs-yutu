// Yutu Labs - Popup Configuration

// Default settings
const DEFAULT_SETTINGS = {
  hideReels: false,
  hideSidebar: false,
  hideDescription: false,
  hideHeader: false
};

// DOM Elements
const elements = {
  hideReels: document.getElementById('hide-reels'),
  hideSidebar: document.getElementById('hide-sidebar'),
  hideDescription: document.getElementById('hide-description'),
  hideHeader: document.getElementById('hide-header'),
  saveBtn: document.getElementById('save-btn'),
  saveStatus: document.getElementById('save-status')
};

/**
 * Load settings from chrome.storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('yutuSettings');
    const settings = result.yutuSettings || DEFAULT_SETTINGS;

    // Update checkboxes
    elements.hideReels.checked = settings.hideReels;
    elements.hideSidebar.checked = settings.hideSidebar;
    elements.hideDescription.checked = settings.hideDescription;
    elements.hideHeader.checked = settings.hideHeader;

    console.log('✅ Settings loaded:', settings);
  } catch (error) {
    console.error('❌ Error loading settings:', error);
  }
}

/**
 * Save settings to chrome.storage
 */
async function saveSettings() {
  try {
    const settings = {
      hideReels: elements.hideReels.checked,
      hideSidebar: elements.hideSidebar.checked,
      hideDescription: elements.hideDescription.checked,
      hideHeader: elements.hideHeader.checked
    };

    // Show saving status
    showSaveStatus('Guardando...', 'saving');
    elements.saveBtn.disabled = true;

    // Save to storage
    await chrome.storage.local.set({ yutuSettings: settings });

    // Show success status
    showSaveStatus('✓ Cambios guardados', 'success');

    // Notify content scripts in all tabs
    const tabs = await chrome.tabs.query({ url: '*://*.youtube.com/*' });
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateHiddenElements',
        settings: settings
      }).catch(() => {
        // Ignore errors (content script may not be loaded)
      });
    });

    console.log('✅ Settings saved:', settings);

    // Reset button and status after delay
    setTimeout(() => {
      elements.saveBtn.disabled = false;
      hideSaveStatus();
    }, 2000);
  } catch (error) {
    console.error('❌ Error saving settings:', error);
    showSaveStatus('✗ Error al guardar', 'error');
    elements.saveBtn.disabled = false;

    setTimeout(hideSaveStatus, 3000);
  }
}

/**
 * Show save status message
 */
function showSaveStatus(message, type) {
  elements.saveStatus.textContent = message;
  elements.saveStatus.className = `save-status ${type}`;
  elements.saveStatus.style.opacity = '1';
}

/**
 * Hide save status message
 */
function hideSaveStatus() {
  elements.saveStatus.style.opacity = '0';
  setTimeout(() => {
    if (elements.saveStatus.style.opacity === '0') {
      elements.saveStatus.textContent = '';
      elements.saveStatus.className = 'save-status';
    }
  }, 300);
}

/**
 * Auto-save on checkbox change
 */
function setupAutoSave() {
  const checkboxes = [
    elements.hideReels,
    elements.hideSidebar,
    elements.hideDescription,
    elements.hideHeader
  ];

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // Auto-save with slight delay for better UX
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(saveSettings, 500);
    });
  });
}

/**
 * Initialize popup
 */
function init() {
  console.log('🚀 Yutu Labs Popup initializing...');

  // Load saved settings
  loadSettings();

  // Setup auto-save
  setupAutoSave();

  // Manual save button (optional, auto-save is enabled)
  elements.saveBtn.addEventListener('click', saveSettings);

  console.log('✅ Popup initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
