// Yutu Labs - Popup custom button selector

import { loadSettings as loadConfig, saveSettings as saveConfig } from '../content/config.js';
import { flashStatus } from './status.js';

const $ = (id) => document.getElementById(id);
const elements = {
  customSelectorInput: $('custom-selector-input'),
  selectorSaveBtn: $('selector-save-btn'),
  selectorResetBtn: $('selector-reset-btn'),
  selectorPickBtn: $('selector-pick-btn'),
  selectorSaveStatus: $('selector-save-status'),
  selectorStatusBadge: $('selector-status-badge')
};

function updateSelectorBadge(selector) {
  if (selector && selector.trim()) {
    elements.selectorStatusBadge.textContent = 'Custom active';
    elements.selectorStatusBadge.className = 'selector-badge selector-badge--custom';
  } else {
    elements.selectorStatusBadge.textContent = 'Using defaults';
    elements.selectorStatusBadge.className = 'selector-badge selector-badge--default';
  }
}

async function saveCustomSelector() {
  const selector = elements.customSelectorInput.value.trim();

  // Validate selector syntax
  if (selector) {
    try {
      document.querySelector(selector);
    } catch {
      flashStatus(elements.selectorSaveStatus, 'Invalid CSS selector', 'error');
      return;
    }
  }

  const settings = await loadConfig();
  settings.customButtonSelector = selector;
  await saveConfig(settings);

  updateSelectorBadge(selector);
  flashStatus(elements.selectorSaveStatus, selector ? 'Custom selector saved' : 'Cleared — using defaults', 'success');
}

async function resetCustomSelector() {
  elements.customSelectorInput.value = '';
  await saveCustomSelector();
}

async function startElementPicker() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs.length || !tabs[0].url?.includes('youtube.com')) {
      flashStatus(elements.selectorSaveStatus, 'Open YouTube first', 'error');
      return;
    }

    // The picker saves the selector itself (storage), so the popup can close right away
    await chrome.tabs.sendMessage(tabs[0].id, { action: 'startElementPicker' });
    window.close();
  } catch (error) {
    flashStatus(elements.selectorSaveStatus, 'Error starting picker', 'error');
  }
}

export async function setupCustomSelector() {
  const settings = await loadConfig();
  elements.customSelectorInput.value = settings.customButtonSelector || '';
  updateSelectorBadge(settings.customButtonSelector);

  elements.selectorSaveBtn.addEventListener('click', saveCustomSelector);
  elements.selectorResetBtn.addEventListener('click', resetCustomSelector);
  elements.selectorPickBtn.addEventListener('click', startElementPicker);
  elements.customSelectorInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveCustomSelector();
  });
}
