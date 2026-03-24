// Background service worker for Yutu Labs

console.log('Yutu Labs background service worker loaded');

// Track floating windows
let floatingWindowId = null;

// Listen for window close events
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === floatingWindowId) {
    floatingWindowId = null;
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openFloatingWindow') {
    handleOpenFloatingWindow(request).then(sendResponse);
    return true;
  }

  if (request.action === 'closeFloatingWindow') {
    const windowId = sender.tab?.windowId || floatingWindowId;
    handleCloseFloatingWindow(windowId).then(sendResponse);
    return true;
  }
});

async function handleOpenFloatingWindow(request) {
  try {
    // Close existing floating window if any
    if (floatingWindowId) {
      try {
        await chrome.windows.remove(floatingWindowId);
      } catch {
        // Window may already be closed
      }
      floatingWindowId = null;
    }

    return await createNewWindow(request);
  } catch (error) {
    return { success: false, windowId: null, error: error.message };
  }
}

async function handleCloseFloatingWindow(windowId) {
  if (!windowId) {
    return { success: false, error: 'No floating window found' };
  }

  try {
    await chrome.windows.remove(windowId);
    if (windowId === floatingWindowId) {
      floatingWindowId = null;
    }
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
  if (!url) {
    return { success: false, windowId: null, error: 'Invalid or unsupported video URL' };
  }

  const win = await chrome.windows.create({
    url,
    type: 'popup',
    width,
    height,
    left: Math.max(display.workArea.left, left),
    top: Math.max(display.workArea.top, top),
    focused: true
  });

  floatingWindowId = win.id;
  return { success: true, windowId: win.id, error: null };
}

function resolveOpenUrl(request) {
  if (request.targetUrl) {
    return normalizeVideoUrl(request.targetUrl);
  }

  if (request.videoId) {
    return normalizeVideoUrl(`https://www.youtube.com/watch?v=${request.videoId}`);
  }

  return null;
}

function normalizeVideoUrl(rawUrl) {
  try {
    const parsedUrl = new URL(rawUrl);

    if (isYouTubeUrl(parsedUrl)) {
      parsedUrl.searchParams.set('autoplay', '1');
      parsedUrl.searchParams.set('yutu_popup', 'true');
      return parsedUrl.toString();
    }

    if (isVimeoUrl(parsedUrl)) {
      parsedUrl.searchParams.set('autoplay', '1');
      return parsedUrl.toString();
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function isYouTubeUrl(parsedUrl) {
  return parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname === 'youtu.be';
}

function isVimeoUrl(parsedUrl) {
  return parsedUrl.hostname.includes('vimeo.com');
}
