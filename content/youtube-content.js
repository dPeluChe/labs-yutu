import { YutuPiPManager, attachYouTubePlaybackMessageListener } from './content.js';

function initYouTube() {
  const manager = new YutuPiPManager({
    enableYouTubeCards: true,
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYouTube);
} else {
  initYouTube();
}
