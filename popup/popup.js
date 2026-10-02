// Yutu Labs - Popup entry point

import { setupTabs } from './tabs.js';
import { loadSettings, setupAutoSave, setupSaveButton } from './settings.js';
import { setupSpeedControls, syncCurrentSpeed } from './speed.js';
import { setupExternalSites } from './sites.js';
import { setupCustomSelector } from './selector.js';

function init() {
  setupTabs();
  loadSettings();
  setupAutoSave();
  setupSaveButton();
  setupSpeedControls();
  syncCurrentSpeed();
  setupExternalSites();
  setupCustomSelector();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
