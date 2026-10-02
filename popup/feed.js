// Yutu Labs - Popup old-video filter (Feed tab)

import { loadSettings as loadConfig, saveSettings as saveConfig } from '../content/config.js';
import { flashStatus } from './status.js';

const $ = (id) => document.getElementById(id);

async function save() {
  const settings = await loadConfig();
  settings.oldVideoFilter = {
    enabled: $('old-enabled').checked,
    months: Number($('old-months').value),
    mode: $('old-mode').value
  };
  await saveConfig(settings);
  flashStatus($('feed-status'), 'Saved', 'success');
}

export async function setupFeed() {
  const { oldVideoFilter } = await loadConfig();
  $('old-enabled').checked = oldVideoFilter.enabled;
  $('old-months').value = String(oldVideoFilter.months);
  $('old-mode').value = oldVideoFilter.mode;

  for (const id of ['old-enabled', 'old-months', 'old-mode']) {
    $(id).addEventListener('change', save);
  }
}
