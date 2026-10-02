// Yush - Popup hide-element settings (floating window + regular watch page)

import { loadSettings as loadConfig, saveSettings as saveConfig } from '../content/config.js';
import { HIDE_OPTIONS } from '../content/hide-rules.js';
import { flashStatus } from './status.js';

const $ = (id) => document.getElementById(id);
const AUTO_SAVE_DELAY = 400;

const GROUPS = {
  popup: {
    help: 'Applies to <strong>floating windows</strong> (when clicking "Open"). Your normal YouTube view is not affected.',
    read: (settings) => settings,
    write: (settings, flags) => Object.assign(settings, flags)
  },
  watch: {
    help: 'Applies to <strong>regular watch pages</strong>. Hiding the header also hides search while watching.',
    read: (settings) => settings.watchPage,
    write: (settings, flags) => { settings.watchPage = flags; }
  }
};

let autoSaveTimer = null;

const inputId = (group, key) => `hide-${group}-${key}`;

function toggleRow(id, title, description, extraClass = '') {
  const label = document.createElement('label');
  label.className = `toggle-label ${extraClass}`.trim();
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  input.className = 'toggle-input';
  const text = document.createElement('div');
  text.className = 'toggle-text';
  const titleEl = document.createElement('span');
  titleEl.className = 'toggle-title';
  titleEl.textContent = title;
  const descEl = document.createElement('span');
  descEl.className = 'toggle-description';
  descEl.textContent = description;
  text.append(titleEl, descEl);
  label.append(input, text);
  return label;
}

function renderGroups() {
  for (const group of Object.keys(GROUPS)) {
    const container = $(`hide-group-${group}`);
    container.append(toggleRow(inputId(group, 'all'), 'Hide all', 'Enable every rule in this group', 'toggle-label--master'));
    for (const option of HIDE_OPTIONS) {
      container.append(toggleRow(inputId(group, option.key), option.title, option.description));
    }
  }
}

function readGroupFlags(group) {
  return Object.fromEntries(HIDE_OPTIONS.map((o) => [o.key, $(inputId(group, o.key)).checked]));
}

function syncMaster(group) {
  $(inputId(group, 'all')).checked = HIDE_OPTIONS.every((o) => $(inputId(group, o.key)).checked);
}

export async function loadSettings() {
  try {
    const settings = await loadConfig();
    for (const [group, spec] of Object.entries(GROUPS)) {
      const flags = spec.read(settings);
      for (const o of HIDE_OPTIONS) $(inputId(group, o.key)).checked = Boolean(flags[o.key]);
      syncMaster(group);
    }
    $('close-on-finish').checked = settings.closeOnFinish;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  const saveBtn = $('save-btn');
  const status = $('save-status');
  try {
    const settings = await loadConfig();
    for (const [group, spec] of Object.entries(GROUPS)) spec.write(settings, readGroupFlags(group));
    settings.closeOnFinish = $('close-on-finish').checked;

    flashStatus(status, 'Saving...', 'saving');
    saveBtn.disabled = true;
    await saveConfig(settings);
    flashStatus(status, 'Changes saved', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    flashStatus(status, 'Error saving', 'error', 3000);
  } finally {
    setTimeout(() => { saveBtn.disabled = false; }, 2000);
  }
}

function scheduleSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveSettings, AUTO_SAVE_DELAY);
}

function setupSegment() {
  const buttons = document.querySelectorAll('.segment-btn');
  const select = (group) => {
    buttons.forEach((b) => b.classList.toggle('segment-btn--active', b.dataset.group === group));
    for (const name of Object.keys(GROUPS)) {
      $(`hide-group-${name}`).classList.toggle('toggle-group--hidden', name !== group);
    }
    $('hide-help').innerHTML = GROUPS[group].help;
  };
  buttons.forEach((b) => b.addEventListener('click', () => select(b.dataset.group)));
  select('popup');
}

export function setupAutoSave() {
  renderGroups();
  setupSegment();

  for (const group of Object.keys(GROUPS)) {
    for (const o of HIDE_OPTIONS) {
      $(inputId(group, o.key)).addEventListener('change', () => {
        syncMaster(group);
        scheduleSave();
      });
    }
    $(inputId(group, 'all')).addEventListener('change', (event) => {
      for (const o of HIDE_OPTIONS) $(inputId(group, o.key)).checked = event.target.checked;
      scheduleSave();
    });
  }

  $('close-on-finish').addEventListener('change', scheduleSave);
}

export function setupSaveButton() {
  $('save-btn').addEventListener('click', saveSettings);
}
