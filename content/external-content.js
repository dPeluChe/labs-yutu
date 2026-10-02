import { YushManager } from './content.js';

function initExternal() {
  const isGoogle = /(^|\.)google\.com$/.test(location.hostname);
  const manager = new YushManager({
    enableYouTubeCards: false,
    enableExternalLinks: true,
    externalScope: isGoogle ? 'google' : 'all'
  });

  manager.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExternal);
} else {
  initExternal();
}
