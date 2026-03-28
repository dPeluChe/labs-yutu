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
  attachPlaybackMessageListener();

  const floatingSpeedControls = new FloatingSpeedControls({
    enableOnRegularPages: true,
    manager
  });
  floatingSpeedControls.init();

  window.addEventListener('yt-navigate-finish', () => {
    setTimeout(() => manager.injectButtons(), 250);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYouTube);
} else {
  initYouTube();
}
