import { isYutuPopupWindow, loadSettings, STORAGE_KEY } from './config.js';
import { YutuPiPManager, attachPlaybackMessageListener } from './content.js';
import { FloatingSpeedControls } from './floating-speed-controls.js';
import { OldVideoFilter } from './old-video-filter.js';
import { setupPickerListener } from './element-picker.js';

async function initYouTube() {
  const isPopup = isYutuPopupWindow();
  const settings = await loadSettings();

  const manager = new YutuPiPManager({
    enableYouTubeCards: !isPopup,
    enableExternalLinks: false,
    customButtonSelector: settings.customButtonSelector || '',
    observeSelector: 'ytd-page-manager'
  });

  manager.init();
  attachPlaybackMessageListener();
  setupPickerListener();

  const floatingSpeedControls = new FloatingSpeedControls({
    enableOnRegularPages: true,
    manager
  });
  floatingSpeedControls.init();

  if (!isPopup) new OldVideoFilter({ manager }).init();

  window.addEventListener('yt-navigate-finish', () => {
    setTimeout(() => manager.injectButtons(), 250);
  });

  // Popup and element picker both persist the selector, so storage is the single source
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[STORAGE_KEY]?.newValue) return;
    manager.setCustomSelector(changes[STORAGE_KEY].newValue.customButtonSelector);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYouTube);
} else {
  initYouTube();
}
