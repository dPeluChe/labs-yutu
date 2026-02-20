import { YutuPiPManager } from './content.js';

function initGoogle() {
  const manager = new YutuPiPManager({
    enableYouTubeCards: false,
    enableExternalLinks: true,
    externalScope: 'google',
    injectDebounceMs: 150
  });

  manager.init();
  window.yutuPiPManager = manager;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogle);
} else {
  initGoogle();
}
