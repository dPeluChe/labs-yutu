// Yutu Labs - Popup Configuration

import { loadSettings as loadConfig, saveSettings as saveConfig } from '../content/config.js';

// --- DOM Elements ---

const elements = {
  hideAll: document.getElementById('hide-all'),
  hideReels: document.getElementById('hide-reels'),
  hideSidebar: document.getElementById('hide-sidebar'),
  hideDescription: document.getElementById('hide-description'),
  hideHeader: document.getElementById('hide-header'),
  hideActions: document.getElementById('hide-actions'),
  hideMerchShelf: document.getElementById('hide-merch-shelf'),
  closeOnFinish: document.getElementById('close-on-finish'),
  saveBtn: document.getElementById('save-btn'),
  saveStatus: document.getElementById('save-status'),
  speedButtons: document.querySelectorAll('.speed-btn'),
  speedStatus: document.getElementById('speed-status'),
  // Tabs
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  // Sites
  externalEnabled: document.getElementById('external-enabled'),
  domainInput: document.getElementById('domain-input'),
  addDomainBtn: document.getElementById('add-domain-btn'),
  domainList: document.getElementById('domain-list'),
  sitesStatus: document.getElementById('sites-status')
};

const hideFields = [
  'hideReels', 'hideSidebar', 'hideDescription',
  'hideHeader', 'hideActions', 'hideMerchShelf'
];

let currentExternalSites = { enabled: false, domains: [] };

let autoSaveTimer = null;
const AUTO_SAVE_DELAY = 400;

// --- Tab Switching ---

function setupTabs() {
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.tabButtons.forEach(b => b.classList.remove('tab-btn--active'));
      elements.tabPanels.forEach(p => p.classList.add('tab-panel--hidden'));
      btn.classList.add('tab-btn--active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('tab-panel--hidden');
    });
  });
}

// --- Settings (Hide Elements) ---

async function loadSettings() {
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

    // Load external sites
    currentExternalSites = settings.externalSites || { enabled: false, domains: [] };
    elements.externalEnabled.checked = currentExternalSites.enabled;
    renderDomainList();
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

let statusTimer = null;

function flashStatus(el, message, type, duration = 2500) {
  clearTimeout(statusTimer);
  el.textContent = message;
  el.className = `save-status ${type}`;
  el.style.opacity = '1';
  if (duration > 0) {
    statusTimer = setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => {
        if (el.style.opacity === '0') {
          el.textContent = '';
          el.className = 'save-status';
        }
      }, 300);
    }, duration);
  }
}

function showSaveStatus(message, type) {
  flashStatus(elements.saveStatus, message, type);
}

function hideSaveStatus() {
  flashStatus(elements.saveStatus, '', '', 0);
  elements.saveStatus.style.opacity = '0';
}

function setupAutoSave() {
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

// --- Speed Controls ---

async function syncCurrentSpeed() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || !tabs[0].url?.includes('youtube.com')) return;

    const response = await chrome.tabs.sendMessage(tabs[0].id, {
      action: 'getPlaybackSpeed'
    });

    if (response?.success) {
      const currentSpeed = response.speed;
      elements.speedButtons.forEach(btn => {
        const btnSpeed = parseFloat(btn.getAttribute('data-speed'));
        btn.classList.toggle('speed-btn--active', Math.abs(btnSpeed - currentSpeed) < 0.01);
      });
    }
  } catch {
    // Content script may not be loaded yet
  }
}

function setupSpeedControls() {
  elements.speedButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const speed = parseFloat(btn.getAttribute('data-speed'));

      elements.speedStatus.textContent = `Setting speed to ${speed}x...`;
      elements.speedStatus.className = 'speed-status speed-status--loading';

      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tabs.length === 0 || !tabs[0].url.includes('youtube.com')) {
          elements.speedStatus.textContent = 'Please open YouTube first';
          elements.speedStatus.className = 'speed-status speed-status--error';
          return;
        }

        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'setPlaybackSpeed',
          speed
        });

        if (response?.success) {
          elements.speedStatus.textContent = `Speed set to ${speed}x`;
          elements.speedStatus.className = 'speed-status speed-status--success';

          elements.speedButtons.forEach(b => b.classList.remove('speed-btn--active'));
          btn.classList.add('speed-btn--active');

          setTimeout(() => {
            if (elements.speedStatus.classList.contains('speed-status--success')) {
              elements.speedStatus.textContent = '';
              elements.speedStatus.className = 'speed-status';
            }
          }, 2000);
        } else {
          elements.speedStatus.textContent = 'Failed to set speed';
          elements.speedStatus.className = 'speed-status speed-status--error';
        }
      } catch (error) {
        console.error('Error setting playback speed:', error);
        elements.speedStatus.textContent = 'Error setting speed';
        elements.speedStatus.className = 'speed-status speed-status--error';
      }
    });
  });
}

// --- External Sites (Whitelist) ---

function renderDomainList() {
  elements.domainList.textContent = '';

  if (currentExternalSites.domains.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'domain-list-empty';
    empty.textContent = 'No domains added yet';
    elements.domainList.appendChild(empty);
    return;
  }

  currentExternalSites.domains.forEach(domain => {
    const li = document.createElement('li');
    li.className = 'domain-item';

    const name = document.createElement('span');
    name.className = 'domain-name';
    name.textContent = domain;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'domain-remove';
    removeBtn.setAttribute('aria-label', `Remove ${domain}`);
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', () => removeDomain(domain));

    li.appendChild(name);
    li.appendChild(removeBtn);
    elements.domainList.appendChild(li);
  });
}

async function addDomain() {
  let domain = elements.domainInput.value.trim().toLowerCase();
  if (!domain) return;

  // Normalize: strip protocol, path, and www
  domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

  if (!domain || currentExternalSites.domains.includes(domain)) {
    elements.domainInput.value = '';
    return;
  }

  // Request host permission (requires user gesture from popup click)
  try {
    const granted = await chrome.permissions.request({
      origins: [`*://${domain}/*`, `*://*.${domain}/*`]
    });

    if (!granted) {
      showSitesStatus('Permission denied', 'error');
      return;
    }
  } catch (error) {
    showSitesStatus('Permission error: ' + error.message, 'error');
    return;
  }

  currentExternalSites.domains.push(domain);
  elements.domainInput.value = '';
  await saveExternalSites();
  renderDomainList();
  showSitesStatus(`Added ${domain}`, 'success');
}

async function removeDomain(domain) {
  currentExternalSites.domains = currentExternalSites.domains.filter(d => d !== domain);

  try {
    await chrome.permissions.remove({
      origins: [`*://${domain}/*`, `*://*.${domain}/*`]
    });
  } catch { /* ignore */ }

  await saveExternalSites();
  renderDomainList();
}

async function saveExternalSites() {
  const settings = await loadConfig();
  settings.externalSites = currentExternalSites;
  await saveConfig(settings);

  await chrome.runtime.sendMessage({
    action: 'updateExternalSites',
    settings: currentExternalSites
  });
}

function showSitesStatus(message, type) {
  flashStatus(elements.sitesStatus, message, type);
}

function setupExternalSites() {
  elements.addDomainBtn.addEventListener('click', addDomain);
  elements.domainInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addDomain();
  });

  elements.externalEnabled.addEventListener('change', () => {
    currentExternalSites.enabled = elements.externalEnabled.checked;
    saveExternalSites();
  });
}

// --- Init ---

function init() {
  setupTabs();
  loadSettings();
  setupAutoSave();
  setupSpeedControls();
  syncCurrentSpeed();
  setupExternalSites();
  elements.saveBtn.addEventListener('click', saveSettings);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
