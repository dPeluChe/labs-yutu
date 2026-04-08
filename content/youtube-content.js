import { isYutuPopupWindow, loadSettings } from './config.js';
import { YutuPiPManager, attachPlaybackMessageListener } from './content.js';
import { FloatingSpeedControls } from './floating-speed-controls.js';

async function initYouTube() {
  const isPopup = isYutuPopupWindow();
  const settings = await loadSettings();

  const manager = new YutuPiPManager({
    enableYouTubeCards: !isPopup,
    enableExternalLinks: false,
    customButtonSelector: settings.customButtonSelector || ''
  });

  manager.init();
  attachPlaybackMessageListener();

  const floatingSpeedControls = new FloatingSpeedControls({
    enableOnRegularPages: true,
    manager
  });
  floatingSpeedControls.init();

  window.addEventListener('yt-navigate-finish', () => {
    setTimeout(() => manager.injectButtons(), 250);
  });

  // Listen for custom selector updates from popup
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateCustomSelector') {
      manager.customButtonSelector = message.customButtonSelector || '';
      // Remove existing buttons and re-inject with new selector
      document.querySelectorAll('.yutu-pip-btn').forEach(btn => btn.remove());
      manager.injectButtons();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYouTube);
} else {
  initYouTube();
}
