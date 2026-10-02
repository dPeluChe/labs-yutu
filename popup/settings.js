// Yutu Labs - Popup hide-element settings

import { loadSettings as loadConfig, saveSettings as saveConfig } from '../content/config.js';
import { flashStatus } from './status.js';

const $ = (id) => document.getElementById(id);
const elements = {
  hideAll: $('hide-all'),
  hideReels: $('hide-reels'),
  hideSidebar: $('hide-sidebar'),
  hideDescription: $('hide-description'),
  hideHeader: $('hide-header'),
  hideActions: $('hide-actions'),
  hideMerchShelf: $('hide-merch-shelf'),
  closeOnFinish: $('close-on-finish'),
  saveBtn: $('save-btn'),
  saveStatus: $('save-status')
};

const hideFields = [
  'hideReels', 'hideSidebar', 'hideDescription',
  'hideHeader', 'hideActions', 'hideMerchShelf'
];

let autoSaveTimer = null;
const AUTO_SAVE_DELAY = 400;

export async function loadSettings() {
  try {
    const settings = await loadConfig();

    elements.hideReels.checked = settings.hideReels;
    elements.hideSidebar.checked = settings.hideSidebar;
    elements.hideDescription.checked = settings.hideDescription;
    elements.hideHeader.checked = settings.hideHeader;
    elements.hideActions.checked = settings.hideActions;
    elements.hideMerchShelf.checked = settings.hideMerchShelf;
    elements.closeOnFinish.checked = settings.closeOnFinish;
    syncHideAllCheckbox();


  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  try {
    // Load existing settings to preserve externalSites and other keys
    const existing = await loadConfig();
    const settings = {
      ...existing,
      hideReels: elements.hideReels.checked,
      hideSidebar: elements.hideSidebar.checked,
      hideDescription: elements.hideDescription.checked,
      hideHeader: elements.hideHeader.checked,
      hideActions: elements.hideActions.checked,
      hideMerchShelf: elements.hideMerchShelf.checked,
      closeOnFinish: elements.closeOnFinish.checked
    };

    showSaveStatus('Saving...', 'saving');
    elements.saveBtn.disabled = true;

    await saveConfig(settings);

    showSaveStatus('Changes saved', 'success');

    const tabs = await chrome.tabs.query({ url: '*://*.youtube.com/*' });
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateHiddenElements',
        settings
      }).catch(() => {});
    });

    setTimeout(() => {
      elements.saveBtn.disabled = false;
      hideSaveStatus();
    }, 2000);
  } catch (error) {
    console.error('Error saving settings:', error);
    showSaveStatus('Error saving', 'error');
    elements.saveBtn.disabled = false;
    setTimeout(hideSaveStatus, 3000);
  }
}

function showSaveStatus(message, type) {
  flashStatus(elements.saveStatus, message, type);
}

function hideSaveStatus() {
  flashStatus(elements.saveStatus, '', '', 0);
  elements.saveStatus.style.opacity = '0';
}

export function setupAutoSave() {
  const checkboxes = hideFields.map((key) => elements[key]);

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      syncHideAllCheckbox();
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(saveSettings, AUTO_SAVE_DELAY);
    });
  });

  elements.hideAll.addEventListener('change', () => {
    const checked = elements.hideAll.checked;
    hideFields.forEach((key) => { elements[key].checked = checked; });
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveSettings, AUTO_SAVE_DELAY);
  });

  elements.closeOnFinish.addEventListener('change', () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveSettings, AUTO_SAVE_DELAY);
  });
}

function syncHideAllCheckbox() {
  elements.hideAll.checked = hideFields.every((key) => elements[key].checked);
}

export function setupSaveButton() {
  elements.saveBtn.addEventListener('click', saveSettings);
}
