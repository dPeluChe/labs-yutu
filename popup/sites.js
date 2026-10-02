// Yush - Popup external sites whitelist

import { loadSettings as loadConfig, saveSettings as saveConfig } from '../content/config.js';
import { flashStatus } from './status.js';
import { normalizeDomain } from './domain.js';

const $ = (id) => document.getElementById(id);
const elements = {
  externalEnabled: $('external-enabled'),
  domainInput: $('domain-input'),
  addDomainBtn: $('add-domain-btn'),
  domainList: $('domain-list'),
  sitesStatus: $('sites-status')
};

let currentExternalSites = { enabled: false, domains: [] };

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
  const domain = normalizeDomain(elements.domainInput.value);

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

export async function setupExternalSites() {
  const settings = await loadConfig();
  currentExternalSites = settings.externalSites || { enabled: false, domains: [] };
  elements.externalEnabled.checked = currentExternalSites.enabled;
  renderDomainList();

  elements.addDomainBtn.addEventListener('click', addDomain);
  elements.domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addDomain();
  });

  elements.externalEnabled.addEventListener('change', () => {
    currentExternalSites.enabled = elements.externalEnabled.checked;
    saveExternalSites();
  });
}
