import { YutuPiPManager } from './content.js';

function initExternal() {
  const manager = new YutuPiPManager({
    enableYouTubeCards: false,
    enableExternalLinks: true,
    externalScope: 'all',
    injectDebounceMs: 150
  });

  manager.init();
  window.yutuPiPManager = manager;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExternal);
} else {
  initExternal();
}
