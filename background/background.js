// Background service worker for Yutu Labs

const STORAGE_KEY = 'yutuSettings';
const EXTERNAL_SCRIPT_ID = 'yutu-external-sites';

// MV3 workers are suspended after ~30s idle, so the window id lives in session storage
const WINDOW_ID_KEY = 'yutuFloatingWindowId';

async function getFloatingWindowId() {
  const result = await chrome.storage.session.get(WINDOW_ID_KEY);
  return result[WINDOW_ID_KEY] ?? null;
}

async function setFloatingWindowId(id) {
  if (id === null) await chrome.storage.session.remove(WINDOW_ID_KEY);
  else await chrome.storage.session.set({ [WINDOW_ID_KEY]: id });
}

// Restore dynamic content scripts on startup
restoreExternalSiteScripts();

// Listen for window close events
chrome.windows.onRemoved.addListener(async (windowId) => {
  if (windowId === await getFloatingWindowId()) await setFloatingWindowId(null);
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openFloatingWindow') {
    handleOpenFloatingWindow(request).then(sendResponse);
    return true;
  }

  if (request.action === 'closeFloatingWindow') {
    (async () => handleCloseFloatingWindow(sender.tab?.windowId || await getFloatingWindowId()))().then(sendResponse);
    return true;
  }

  if (request.action === 'updateExternalSites') {
    handleUpdateExternalSites(request.settings).then(sendResponse);
    return true;
  }

});

// --- Floating Window ---

async function handleOpenFloatingWindow(request) {
  try {
    const previousId = await getFloatingWindowId();
    if (previousId) {
      try { await chrome.windows.remove(previousId); } catch { /* already closed */ }
      await setFloatingWindowId(null);
    }
    return await createNewWindow(request);
  } catch (error) {
    return { success: false, windowId: null, error: error.message };
  }
}

async function handleCloseFloatingWindow(windowId) {
  if (!windowId) return { success: false, error: 'No floating window found' };

  try {
    await chrome.windows.remove(windowId);
    if (windowId === await getFloatingWindowId()) await setFloatingWindowId(null);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createNewWindow(request) {
  const width = 854;
  const height = 480;

  const displays = await chrome.system.display.getInfo();
  const display = displays[0];

  const left = display.workArea.left + display.workArea.width - width - 20;
  const top = display.workArea.top + display.workArea.height - height - 20;

  const url = resolveOpenUrl(request);
  if (!url) return { success: false, windowId: null, error: 'Invalid or unsupported video URL' };

  const win = await chrome.windows.create({
    url,
    type: 'popup',
    width,
    height,
    left: Math.max(display.workArea.left, left),
    top: Math.max(display.workArea.top, top),
    focused: true
  });

  await setFloatingWindowId(win.id);
  return { success: true, windowId: win.id, error: null };
}

function resolveOpenUrl(request) {
  if (request.targetUrl) return normalizeVideoUrl(request.targetUrl);
  if (request.videoId) return normalizeVideoUrl(`https://www.youtube.com/watch?v=${request.videoId}`);
  return null;
}

function normalizeVideoUrl(rawUrl) {
  try {
    const parsedUrl = new URL(rawUrl);
    if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname === 'youtu.be') {
      parsedUrl.searchParams.set('autoplay', '1');
      parsedUrl.searchParams.set('yutu_popup', 'true');
      return parsedUrl.toString();
    }
    if (parsedUrl.hostname.includes('vimeo.com')) {
      parsedUrl.searchParams.set('autoplay', '1');
      return parsedUrl.toString();
    }
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

// --- External Sites Dynamic Registration ---

async function restoreExternalSiteScripts() {
  try {
    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [EXTERNAL_SCRIPT_ID] });
    if (existing.length > 0) return;

    const result = await chrome.storage.local.get(STORAGE_KEY);
    const settings = result[STORAGE_KEY] || {};
    const ext = settings.externalSites || { enabled: false, domains: [] };

    if (ext.enabled && ext.domains.length > 0) {
      await registerExternalScripts(ext.domains);
    }
  } catch {
    // First install or no settings yet
  }
}

async function handleUpdateExternalSites(externalSites) {
  try {
    await unregisterExternalScripts();

    if (externalSites.enabled && externalSites.domains.length > 0) {
      await registerExternalScripts(externalSites.domains);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function registerExternalScripts(domains) {
  const matches = domains.flatMap(domain => [
    `*://${domain}/*`,
    `*://*.${domain}/*`
  ]);

  await chrome.scripting.registerContentScripts([{
    id: EXTERNAL_SCRIPT_ID,
    matches,
    excludeMatches: ['*://*.youtube.com/*', '*://google.com/*', '*://*.google.com/*'],
    js: ['content/external-content.js'],
    css: ['content/content.css'],
    runAt: 'document_end'
  }]);
}

async function unregisterExternalScripts() {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [EXTERNAL_SCRIPT_ID] });
  } catch {
    // Not registered, ignore
  }
}
