import { YutuPiPManager } from './content.js';

function initExternal() {
  const manager = new YutuPiPManager({
    enableYouTubeCards: false,
    enableExternalLinks: true,
    externalScope: 'all'
  });

  manager.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExternal);
} else {
  initExternal();
}
