// Yutu Labs - Popup Configuration

import { loadSettings as loadConfig, saveSettings as saveConfig } from '../content/config.js';

// DOM Elements
const elements = {
  hideAll: document.getElementById('hide-all'),
  hideReels: document.getElementById('hide-reels'),
  hideSidebar: document.getElementById('hide-sidebar'),
  hideDescription: document.getElementById('hide-description'),
  hideHeader: document.getElementById('hide-header'),
  hideActions: document.getElementById('hide-actions'),
  hideMerchShelf: document.getElementById('hide-merch-shelf'),
  saveBtn: document.getElementById('save-btn'),
  saveStatus: document.getElementById('save-status'),
  speedButtons: document.querySelectorAll('.speed-btn'),
  speedStatus: document.getElementById('speed-status')
};

const hideFields = [
  'hideReels',
  'hideSidebar',
  'hideDescription',
  'hideHeader',
  'hideActions',
  'hideMerchShelf'
];

/**
 * Load settings from chrome.storage
 */
async function loadSettings() {
  try {
    const settings = await loadConfig();

    // Update checkboxes
    elements.hideReels.checked = settings.hideReels;
    elements.hideSidebar.checked = settings.hideSidebar;
    elements.hideDescription.checked = settings.hideDescription;
    elements.hideHeader.checked = settings.hideHeader;
    elements.hideActions.checked = settings.hideActions;
    elements.hideMerchShelf.checked = settings.hideMerchShelf;
    syncHideAllCheckbox();

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
      hideHeader: elements.hideHeader.checked,
      hideActions: elements.hideActions.checked,
      hideMerchShelf: elements.hideMerchShelf.checked
    };

    // Show saving status
    showSaveStatus('Saving...', 'saving');
    elements.saveBtn.disabled = true;

    // Save to storage
    await saveConfig(settings);

    // Show success status
    showSaveStatus('✓ Changes saved', 'success');

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
    showSaveStatus('✗ Error saving', 'error');
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
 * Setup speed control buttons
 */
function setupSpeedControls() {
  elements.speedButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const speed = parseFloat(btn.getAttribute('data-speed'));

      // Show feedback
      elements.speedStatus.textContent = `Setting speed to ${speed}x...`;
      elements.speedStatus.className = 'speed-status speed-status--loading';

      try {
        // Get active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tabs.length === 0 || !tabs[0].url.includes('youtube.com')) {
          elements.speedStatus.textContent = '❌ Please open YouTube first';
          elements.speedStatus.className = 'speed-status speed-status--error';
          return;
        }

        // Send message to content script
        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'setPlaybackSpeed',
          speed: speed
        });

        if (response && response.success) {
          elements.speedStatus.textContent = `✅ Speed set to ${speed}x`;
          elements.speedStatus.className = 'speed-status speed-status--success';

          // Update active state on buttons
          elements.speedButtons.forEach(b => {
            b.classList.remove('speed-btn--active');
          });
          btn.classList.add('speed-btn--active');

          // Clear success message after 2 seconds
          setTimeout(() => {
            if (elements.speedStatus.classList.contains('speed-status--success')) {
              elements.speedStatus.textContent = '';
              elements.speedStatus.className = 'speed-status';
            }
          }, 2000);
        } else {
          elements.speedStatus.textContent = `❌ Failed to set speed`;
          elements.speedStatus.className = 'speed-status speed-status--error';
        }
      } catch (error) {
        console.error('Error setting playback speed:', error);
        elements.speedStatus.textContent = '❌ Error setting speed';
        elements.speedStatus.className = 'speed-status speed-status--error';
      }
    });
  });
}

/**
 * Auto-save on checkbox change
 */
function setupAutoSave() {
  const checkboxes = hideFields.map((key) => elements[key]);

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      syncHideAllCheckbox();
      // Auto-save with slight delay for better UX
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(saveSettings, 500);
    });
  });

  elements.hideAll.addEventListener('change', () => {
    const checked = elements.hideAll.checked;
    hideFields.forEach((key) => {
      elements[key].checked = checked;
    });

    clearTimeout(window.autoSaveTimeout);
    window.autoSaveTimeout = setTimeout(saveSettings, 300);
  });
}

function syncHideAllCheckbox() {
  elements.hideAll.checked = hideFields.every((key) => elements[key].checked);
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

  // Setup speed controls
  setupSpeedControls();

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
