// Background service worker for Yutu Labs

console.log('Yutu Labs background service worker loaded');

// Track floating windows
let floatingWindowId = null;
let contentScriptTabId = null;

// Listen for window close events
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === floatingWindowId) {
    console.log('📭 Floating window closed:', windowId);
    floatingWindowId = null;
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Store content script tab ID for potential future use
  if (sender.tab) {
    contentScriptTabId = sender.tab.id;
  }

  if (request.action === 'openFloatingWindow') {
    console.log('🎬 Opening floating window for video:', request.videoId);

    // Define response function to ensure we always respond
    const respond = (success, windowId = null, error = null) => {
      try {
        sendResponse({ success, windowId, error });
      } catch (e) {
        // Channel already closed, ignore
        if (e.message.includes('message channel closed')) {
          console.log('ℹ️ Message channel already closed');
        }
      }
    };

    // Close existing floating window if any
    if (floatingWindowId) {
      chrome.windows.remove(floatingWindowId, () => {
        if (chrome.runtime.lastError) {
          // Window may already be closed
          console.log('ℹ️ Previous floating window already closed');
        }
        floatingWindowId = null;
        createNewWindow(request.videoId, respond);
      });
    } else {
      createNewWindow(request.videoId, respond);
    }

    return true; // Keep message channel open for async response
  }
});

/**
 * Create new floating window with Yutu popup marker
 */
function createNewWindow(videoId, respond) {
  // Calculate window dimensions
  const width = 854;
  const height = 480;

  // Get screen info
  chrome.system.display.getInfo((displays) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting display info:', chrome.runtime.lastError);
      respond(false, null, chrome.runtime.lastError.message);
      return;
    }

    // Use primary display or first available
    const display = displays[0];

    // Calculate position: bottom-right corner of screen
    // Ensure window is fully within visible bounds
    const left = display.workArea.left + display.workArea.width - width - 20;
    const top = display.workArea.top + display.workArea.height - height - 20;

    console.log('🖥️ Display bounds:', display.workArea);
    console.log('📐 Window position:', { left, top, width, height });

    // Build URL with yutu_popup parameter
    const url = 'https://www.youtube.com/watch?v=' + videoId + '&autoplay=1&yutu_popup=true';

    // Create floating window
    chrome.windows.create({
      url: url,
      type: 'popup',
      width: width,
      height: height,
      left: Math.max(display.workArea.left, left),
      top: Math.max(display.workArea.top, top),
      focused: true
    }, (window) => {
      if (chrome.runtime.lastError) {
        console.error('Error creating window:', chrome.runtime.lastError);
        respond(false, null, chrome.runtime.lastError.message);
      } else {
        console.log('✅ Floating window created:', window.id);
        floatingWindowId = window.id;
        respond(true, window.id, null);
      }
    });
  });
}
