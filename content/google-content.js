import { YutuPiPManager } from './content.js';

function initGoogle() {
  const manager = new YutuPiPManager({
    enableYouTubeCards: false,
    enableExternalLinks: true,
    externalScope: 'google'
  });

  manager.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogle);
} else {
  initGoogle();
}
