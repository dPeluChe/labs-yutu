import { YutuPiPManager, attachYouTubePlaybackMessageListener } from './content.js';
import { FloatingSpeedControls } from './floating-speed-controls.js';

function initYouTube() {
  const urlParams = new URLSearchParams(window.location.search);
  const isYutuPopupWindow = urlParams.get('yutu_popup') === 'true';

  const manager = new YutuPiPManager({
    enableYouTubeCards: !isYutuPopupWindow,
    enableExternalLinks: false,
    injectDebounceMs: 150
  });

  manager.init();

  // YouTube SPA navigation requires reinjection after virtual route changes.
  window.addEventListener('yt-navigate-finish', () => {
    setTimeout(() => manager.injectButtons(), 250);
  });

  window.yutuPiPManager = manager;

  attachYouTubePlaybackMessageListener();

  if (isYutuPopupWindow) {
    const floatingSpeedControls = new FloatingSpeedControls();
    floatingSpeedControls.init();
    window.yutuFloatingSpeedControls = floatingSpeedControls;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYouTube);
} else {
  initYouTube();
}
