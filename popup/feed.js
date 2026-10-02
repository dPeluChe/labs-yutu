// Yush - Popup old-video filter (Feed tab)

import { loadSettings as loadConfig, saveSettings as saveConfig } from '../content/config.js';
import { flashStatus } from './status.js';

const $ = (id) => document.getElementById(id);

async function save() {
  const settings = await loadConfig();
  settings.hideHomeShorts = $('hide-home-shorts').checked;
  settings.oldVideoFilter = {
    enabled: $('old-enabled').checked,
    months: Number($('old-months').value),
    mode: $('old-mode').value
  };
  await saveConfig(settings);
  flashStatus($('feed-status'), 'Saved', 'success');
  $('feed-reload-btn').classList.remove('is-hidden');
}

async function reloadYouTubeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes('youtube.com')) {
    flashStatus($('feed-status'), 'Open YouTube first', 'error');
    return;
  }
  await chrome.tabs.reload(tab.id);
  $('feed-reload-btn').classList.add('is-hidden');
  flashStatus($('feed-status'), 'Page reloaded', 'success');
}

export async function setupFeed() {
  const { oldVideoFilter, hideHomeShorts } = await loadConfig();
  $('hide-home-shorts').checked = hideHomeShorts;
  $('old-enabled').checked = oldVideoFilter.enabled;
  $('old-months').value = String(oldVideoFilter.months);
  $('old-mode').value = oldVideoFilter.mode;

  for (const id of ['hide-home-shorts', 'old-enabled', 'old-months', 'old-mode']) {
    $(id).addEventListener('change', save);
  }
  $('feed-reload-btn').addEventListener('click', reloadYouTubeTab);
}
