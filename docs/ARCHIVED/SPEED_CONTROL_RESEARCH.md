> **ARCHIVED**: 2026-10-01
> Research behind the speed controls, kept as reference.

---

# YouTube Speed Control Research

**Date**: January 22, 2025
**Goal**: Find working methods to change YouTube video playback speed

---

## 🔴 Problem: Current Implementation Not Working

**User Report**: Speed controls in popup don't work, even after reload.

**Potential Issues**:
1. Content script not reloaded after build
2. Message listener not receiving messages
3. `#movie_player` selector not finding element
4. `setPlaybackRate()` method not available
5. Video element not loaded when message sent

---

## 🌐 Research: How to Change YouTube Playback Speed

### Method 1: YouTube's Internal API (window.yt)

**Code**:
```javascript
// YouTube exposes player API
const player = window.yt?.player?.Application?.getInstance('movie_player');

if (player) {
  player.setPlaybackRate(1.5);
  console.log('✅ Speed set via window.yt');
}
```

**Pros**:
- ✅ Official YouTube API
- ✅ More reliable than DOM manipulation

**Cons**:
- ⚠️ Undocumented
- ⚠️ May not be available immediately

---

### Method 2: Video Element Directly (Most Reliable)

**Code**:
```javascript
// Direct access to HTML5 video element
const video = document.querySelector('video');

if (video) {
  video.playbackRate = 1.5;
  console.log('✅ Speed set via video element:', video.playbackRate);
}
```

**Pros**:
- ✅ Standard HTML5 video API
- ✅ Always works when video exists
- ✅ Simple and reliable

**Cons**:
- ❌ Doesn't sync with YouTube's UI (speed indicator not updated)

---

### Method 3: YouTube Player DOM API

**Code**:
```javascript
// YouTube's player DOM API
const player = document.querySelector('#movie_player');

if (player && player.setPlaybackRate) {
  player.setPlaybackRate(1.5);
  console.log('✅ Speed set via player DOM API');
}
```

**Pros**:
- ✅ Uses YouTube's player
- ✅ Syncs with YouTube UI

**Cons**:
- ⚠️ Method may not be available
- ⚠️ Player may not be ready

---

### Method 4: YouTube's Data Structure (ytInitialData)

**Code**:
```javascript
// Find player from YouTube's initial data
const ytData = document.querySelector('#initial-data')?.textContent;
const data = JSON.parse(ytData);

// Player API may be exposed
const playerConfig = data?.playerResponse?.playabilityStatus?.audioConfig;
```

**Pros**:
- ✅ Access to YouTube's internal data

**Cons**:
- ❌ Complex parsing
- ❌ Doesn't provide speed control API directly

---

## ✅ Recommended Solution: Video Element Directly

**Why This Works**:
- HTML5 video element always has `playbackRate` property
- YouTube's player controls the video element internally
- Changing `playbackRate` directly affects playback speed
- Most reliable method

**Implementation**:

```javascript
// In content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setPlaybackSpeed') {
    const speed = request.speed;

    // Method 1: Video element directly (MOST RELIABLE)
    const video = document.querySelector('video');

    if (video) {
      video.playbackRate = speed;
      console.log(`✅ Playback speed set to ${speed}x via video element`);
      console.log(`   Current speed: ${video.playbackRate}`);

      // Also try to update YouTube's UI
      updateYouTubeSpeedIndicator(speed);

      sendResponse({ success: true, speed, method: 'video-direct' });
      return true;
    }

    // Method 2: Wait for video to load
    const observer = new MutationObserver((mutations, obs) => {
      const video = document.querySelector('video');
      if (video) {
        video.playbackRate = speed;
        console.log(`✅ Playback speed set to ${speed}x (video loaded)`);
        obs.disconnect();
        sendResponse({ success: true, speed, method: 'video-waited' });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Stop waiting after 2 seconds
    setTimeout(() => {
      observer.disconnect();
      sendResponse({ success: false, error: 'Video not found' });
    }, 2000);

    return true;
  }
});

/**
 * Try to update YouTube's speed indicator in UI
 */
function updateYouTubeSpeedIndicator(speed) {
  // YouTube stores speed in localStorage
  localStorage.setItem('yt-player-playback-rate', JSON.stringify({
    data: speed,
    expiration: Date.now() + 86400000
  }));

  // Also try to find and click speed button in player
  const speedBtn = document.querySelector('.ytp-settings-button');
  if (speedBtn) {
    speedBtn.click();
    setTimeout(() => {
      const speedMenu = document.querySelector('.ytp-settings-menu');
      const speedOptions = speedMenu?.querySelectorAll('.ytp-menuitem');
      speedOptions?.forEach(option => {
        const optionSpeed = parseFloat(option.textContent);
        if (optionSpeed === speed) {
          option.click();
        }
      });
      speedBtn.click(); // Close menu
    }, 100);
  }
}
```

---

## 🎯 Solution for Floating Window Speed Controls

**Problem**: Floating window is separate context, can't control from main popup.

**Solution**: Inject speed controls directly into floating window when created.

### Implementation Steps:

**1. Create speed control HTML for floating window**:

```javascript
// In background/background.js
function createSpeedControlHTML(speed) {
  return `
    <div class="yutu-speed-controls">
      <div class="yutu-speed-title">Speed</div>
      <div class="yutu-speed-buttons">
        <button class="yutu-speed-btn" data-speed="1">1x</button>
        <button class="yutu-speed-btn" data-speed="1.25">1.25x</button>
        <button class="yutu-speed-btn" data-speed="1.5">1.5x</button>
        <button class="yutu-speed-btn" data-speed="2">2x</button>
      </div>
    </div>
    <style>
      .yutu-speed-controls {
        position: fixed;
        bottom: 60px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        border-radius: 8px;
        padding: 8px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .yutu-speed-title {
        color: white;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
      }
      .yutu-speed-buttons {
        display: flex;
        gap: 4px;
      }
      .yutu-speed-btn {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        transition: all 0.2s;
      }
      .yutu-speed-btn:hover {
        background: rgba(255,255,255,0.4);
      }
      .yutu-speed-btn--active {
        background: #667eea;
        border-color: #667eea;
      }
    </style>
  `;
}
```

**2. Inject into floating window**:

```javascript
// In background/background.js
function createFloatingWindow(videoId, settings) {
  const url = `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;

  chrome.windows.create({
    url: url,
    type: 'popup',
    width: 854,
    height: 480,
    left: window.screen.width - 904,
    top: window.screen.height - 530,
    focused: true
  }, (window) => {
    // Wait for window to load
    setTimeout(async () => {
      try {
        const tabs = await chrome.tabs.query({ windowId: window.id });
        const tab = tabs[0];

        // Inject speed controls
        const speedHTML = createSpeedControlHTML();

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (html) => {
            document.body.insertAdjacentHTML('beforeend', html);

            // Add event listeners
            document.querySelectorAll('.yutu-speed-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                const speed = parseFloat(btn.getAttribute('data-speed'));

                // Update active state
                document.querySelectorAll('.yutu-speed-btn').forEach(b =>
                  b.classList.remove('yutu-speed-btn--active')
                );
                btn.classList.add('yutu-speed-btn--active');

                // Set video speed
                const video = document.querySelector('video');
                if (video) {
                  video.playbackRate = speed;
                }
              });
            });
          },
          args: [speedHTML]
        });

      } catch (error) {
        console.error('Error injecting speed controls:', error);
      }
    }, 2000); // Wait 2s for YouTube to load
  });
}
```

**3. Handle speed changes**:

```javascript
// Speed control button handler (injected into floating window)
button.addEventListener('click', () => {
  const speed = parseFloat(btn.getAttribute('data-speed'));

  // Set video speed
  const video = document.querySelector('video');
  if (video) {
    video.playbackRate = speed;
    console.log(`✅ Speed set to ${speed}x in floating window`);
  }
});
```

---

## 📊 Comparison: Methods

| Method | Reliability | Syncs UI | Works in Floating Window |
|--------|--------------|-----------|-------------------------|
| window.yt API | Medium | ✅ Yes | ❌ No |
| Video element | ✅ High | ❌ No | ✅ Yes |
| Player DOM API | Medium | ✅ Yes | ❌ No |
| Direct window.open | ✅ High | ✅ Yes | ✅ Yes |

---

## ✅ Final Recommendation

### For Main YouTube Tab:
Use **video element directly** - most reliable

### For Floating Window:
Use **script injection with video element** - separate context

---

*Last updated: January 22, 2025*
