import { isYutuPopupWindow } from './config.js';
import { YutuPiPManager, attachPlaybackMessageListener } from './content.js';
import { FloatingSpeedControls } from './floating-speed-controls.js';

function initYouTube() {
  const isPopup = isYutuPopupWindow();

  const manager = new YutuPiPManager({
    enableYouTubeCards: !isPopup,
    enableExternalLinks: false
  });

  manager.init();

  // YouTube SPA navigation requires reinjection after virtual route changes.
  window.addEventListener('yt-navigate-finish', () => {
    setTimeout(() => manager.injectButtons(), 250);
  });

  attachPlaybackMessageListener();

  const floatingSpeedControls = new FloatingSpeedControls({
    enableOnRegularPages: true,
    manager
  });
  floatingSpeedControls.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYouTube);
} else {
  initYouTube();
}
