import { isFloatingWindow, loadSettings, subscribeSettings } from './config.js';
import { YushManager, attachPlaybackMessageListener } from './content.js';
import { FloatingSpeedControls } from './floating-speed-controls.js';
import { OldVideoFilter } from './old-video-filter.js';
import { setupPickerListener } from './element-picker.js';

async function initYouTube() {
  const isPopup = isFloatingWindow();
  const settings = await loadSettings();

  const manager = new YushManager({
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

  if (!isPopup) new OldVideoFilter({ manager, config: settings.oldVideoFilter }).init();

  window.addEventListener('yt-navigate-finish', () => {
    setTimeout(() => manager.injectButtons(), 250);
  });

  // Popup and element picker both persist the selector, so storage is the single source
  subscribeSettings((next) => manager.setCustomSelector(next.customButtonSelector));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYouTube);
} else {
  initYouTube();
}
