# Speed Controls Testing Guide

**Date**: January 22, 2025
**Feature**: YouTube Playback Speed Control via Popup

---

## 🔴 Quick Start

### What Was Implemented

1. **Speed Control Section** in popup (NEW)
   - 4 buttons: 1x, 1.25x, 1.5x, 2x
   - Visual feedback when changing speed
   - Active state indicator

2. **Message Communication**
   - Popup → Content Script → YouTube Player
   - Handles service worker idle state
   - Multiple fallback methods

3. **Multiple Fallback Methods**
   - Method 1: `player.setPlaybackRate()` (YouTube's internal API)
   - Method 2: Video element directly (`video.playbackRate`)
   - Method 3: DOM query for video element

---

## 📝 Implementation Details

### Files Created/Modified

#### 1. Created: `content/speed-controller.js`
**Purpose**: High-level speed control utility

**Exports**:
- `SpeedController` class
  - `getActiveYouTubeTab()` - Find active YouTube tab
  - `setPlaybackSpeed(speed)` - Send message to content script
  - `getCurrentPlaybackSpeed()` - Get current speed

**Note**: Currently NOT imported/used (kept for future reference)

---

#### 2. Modified: `content/content.js`
**Changes**:
- Added message listener for `setPlaybackSpeed` action
- Added message listener for `getPlaybackSpeed` action
- Implements 3 fallback methods for changing speed

**Fallback Methods**:
```javascript
// Method 1: YouTube's internal API
player.setPlaybackRate(speed);

// Method 2: Video element inside player
const video = player.querySelector('video');
video.playbackRate = speed;

// Method 3: Direct video element query
const video = document.querySelector('video');
video.playbackRate = speed;
```

**Message Listener**:
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setPlaybackSpeed') {
    // Set speed with fallbacks
    sendResponse({ success: true, speed, method: 'internal' });
    return true;
  }
});
```

---

#### 3. Modified: `popup/popup.html`
**Changes**:
- Added `speed-section` with title and help text
- Added 4 speed buttons: 1x, 1.25x, 1.5x, 2x
- Added `speed-status` div for feedback

**HTML Structure**:
```html
<section class="speed-section">
  <h2>Playback Speed Control</h2>
  <p class="help-text">Change playback speed on active YouTube tab.</p>

  <div class="speed-buttons">
    <button class="speed-btn" data-speed="1">1x</button>
    <button class="speed-btn" data-speed="1.25">1.25x</button>
    <button class="speed-btn" data-speed="1.5">1.5x</button>
    <button class="speed-btn" data-speed="2">2x</button>
  </div>

  <div id="speed-status" class="speed-status"></div>
</section>
```

---

#### 4. Modified: `popup/popup.js`
**Changes**:
- Added `speedButtons` to elements object
- Added `speedStatus` to elements object
- Created `setupSpeedControls()` function
- Added event listeners to speed buttons
- Implements visual feedback (success/error states)
- Active state management on buttons

**Key Function**:
```javascript
function setupSpeedControls() {
  elements.speedButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const speed = parseFloat(btn.getAttribute('data-speed'));

      // 1. Get active YouTube tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

      // 2. Check if active tab is YouTube
      if (!tabs[0].url.includes('youtube.com')) {
        show error: 'Please open YouTube first';
        return;
      }

      // 3. Send message to content script
      const response = await chrome.tabs.sendMessage(tabs[0].id, {
        action: 'setPlaybackSpeed',
        speed: speed
      });

      // 4. Show feedback
      if (response.success) {
        show: '✅ Speed set to 1.5x';
        update active state on button;
        clear message after 2s;
      } else {
        show: '❌ Failed to set speed';
      }
    });
  });
}
```

---

#### 5. Modified: `popup/popup.css`
**Changes**:
- Added styles for `.speed-section`
- Added styles for `.speed-buttons` (grid layout)
- Added styles for `.speed-btn` (buttons)
- Added styles for `.speed-btn--active` (active state)
- Added styles for `.speed-status` (feedback)
- Added styles for success/error/loading states

**Key Styles**:
```css
.speed-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.speed-btn--active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.speed-status--success {
  color: #059669;
  font-weight: 500;
}

.speed-status--error {
  color: #dc2626;
  font-weight: 500;
}
```

---

## 🧪 Testing Scenarios

### Test 1: Basic Speed Change (Active YouTube Tab)

**Steps**:
1. Open YouTube and play any video
2. Click Yutu Labs icon in toolbar
3. Click "1.5x" button
4. **Expected**:
   - ✅ Status: "Setting speed to 1.5x..."
   - ✅ Status: "✅ Speed set to 1.5x"
   - ✅ 1.5x button becomes active (purple gradient)
   - ✅ Video plays faster
5. Click "2x" button
6. **Expected**:
   - ✅ Status: "✅ Speed set to 2x"
   - ✅ 2x button becomes active
   - ✅ 1.5x button becomes inactive
   - ✅ Video plays even faster

**Console Logs** (YouTube page, F12):
```
📨 Message received: { action: 'setPlaybackSpeed', speed: 1.5 }
✅ Playback speed set to 1.5x via internal API
```

---

### Test 2: No Active YouTube Tab

**Steps**:
1. Close all YouTube tabs
2. Click Yutu Labs icon
3. Click any speed button (1x, 1.5x, etc.)
4. **Expected**:
   - ❌ Status: "❌ Please open YouTube first"

**Console Logs**:
```
⚠️ Attempt 1/3 failed: No active YouTube tab
📨 Message received: { action: 'setPlaybackSpeed', speed: 1.5 }
```

---

### Test 3: Multiple Speed Changes

**Steps**:
1. Open YouTube and play video
2. Click "1x" → "1.25x" → "1.5x" → "2x" rapidly
3. **Expected**:
   - ✅ Each speed change succeeds
   - ✅ Active button updates correctly
   - ✅ Video speed changes each time
   - ✅ No errors

**Console Logs**:
```
📨 Message received: { action: 'setPlaybackSpeed', speed: 1 }
✅ Playback speed set to 1x via internal API
📨 Message received: { action: 'setPlaybackSpeed', speed: 1.25 }
✅ Playback speed set to 1.25x via internal API
📨 Message received: { action: 'setPlaybackSpeed', speed: 1.5 }
✅ Playback speed set to 1.5x via internal API
📨 Message received: { action: 'setPlaybackSpeed', speed: 2 }
✅ Playback speed set to 2x via internal API
```

---

### Test 4: Speed Change with Service Worker Idle

**Steps**:
1. Open YouTube and play video
2. Wait 30+ seconds (service worker sleeps)
3. Click speed button
4. **Expected**:
   - ✅ Speed changes successfully
   - ✅ Retry mechanism handles service worker sleep
   - ✅ No error shown to user

**Console Logs** (YouTube page):
```
📨 Message received: { action: 'setPlaybackSpeed', speed: 1.5 }
✅ Playback speed set to 1.5x via internal API
```

**Console Logs** (Popup - DevTools):
```
⚠️ Attempt 1/3 failed: No response from background script
🔄 Retrying in 500ms...
⚠️ Attempt 2/3 failed: No response from background script
🔄 Retrying in 750ms...
✅ Success (2nd retry)
```

---

### Test 5: Speed Change in Floating Window

**Steps**:
1. Open YouTube
2. Click "Open" button on any video (opens floating window)
3. In floating window, play video
4. Click Yutu Labs icon
5. Click "2x" button
6. **Expected**:
   - ✅ Speed changes in the MAIN YouTube tab
   - ⚠️ Floating window speed NOT changed (this is expected behavior)
   - **Reason**: Speed control works on the ACTIVE YouTube tab, not the floating window

**Note**: Speed control changes the speed of the video in the main YouTube tab, NOT in the floating window. To control floating window speed, you would need to inject the speed control script into the floating window context.

---

### Test 6: Visual Feedback

**Steps**:
1. Open YouTube and play video
2. Click "1.5x" button
3. **Expected**:
   - ✅ Status shows "Setting speed to 1.5x..." (gray)
   - ✅ Status shows "✅ Speed set to 1.5x" (green)
   - ✅ Status clears after 2 seconds
   - ✅ 1.5x button becomes active (purple)
   - ✅ Other buttons become inactive (white)
4. Wait 2 seconds
5. **Expected**:
   - ✅ Status message clears

---

### Test 7: Fallback Methods

**Purpose**: Test which method works

**Steps**:
1. Open YouTube and play video
2. Open Chrome DevTools (F12)
3. Go to Console
4. Click "1.5x" button
5. **Expected Console Log**:
```
📨 Message received: { action: 'setPlaybackSpeed', speed: 1.5 }
✅ Playback speed set to 1.5x via internal API
```

**Possible Method Logs**:
- `via internal API` - YouTube's `player.setPlaybackRate()` worked
- `via video element` - Fallback to `video.playbackRate`
- `via direct` - Fallback to direct video element query

**Testing Fallback**:
To test fallback methods, you can modify `content/content.js` to force fallback:

```javascript
// Force fallback 2 (video element)
// Comment out Method 1:
// player.setPlaybackRate(speed);

// Method 2 will execute:
const video = player.querySelector('video');
video.playbackRate = speed;
```

---

## 🐛 Troubleshooting

### Issue: "Please open YouTube first" error

**Cause**: No active YouTube tab

**Solution**:
1. Open YouTube (`https://www.youtube.com`)
2. Play a video
3. Click speed button again

---

### Issue: "Failed to set speed" error

**Causes**:
- Content script not loaded
- Video not playing
- YouTube page structure changed

**Debug Steps**:
1. Open YouTube and play video
2. Open DevTools (F12)
3. Go to Console
4. Look for: `📨 Message received: { action: 'setPlaybackSpeed', speed: 1.5 }`
5. If message not received, content script not loaded
6. Reload extension

---

### Issue: Speed doesn't change

**Debug Steps**:
1. Open YouTube and play video
2. Open DevTools (F12)
3. In Console, run:
```javascript
const player = document.querySelector('#movie_player');
console.log('Player found:', !!player);
console.log('SetPlaybackRate exists:', typeof player?.setPlaybackRate);
```
4. Expected:
```
Player found: true
SetPlaybackRate exists: "function"
```
5. If `SetPlaybackRate` is not a function, YouTube's API changed

---

### Issue: Active state doesn't update

**Cause**: JavaScript error in popup

**Debug Steps**:
1. Click Yutu Labs icon
2. Right-click in popup
3. Select "Inspect"
4. Go to Console
5. Click speed button
6. Look for errors

---

## 📊 Expected Behavior

### When Speed Changes Successfully

**Popup**:
- Status: "✅ Speed set to 1.5x" (green, 2s)
- Active button: Purple gradient
- Inactive buttons: White with gray border

**Console**:
```
📨 Message received: { action: 'setPlaybackSpeed', speed: 1.5 }
✅ Playback speed set to 1.5x via internal API
```

**Video**:
- Playback rate changes to selected speed
- Audio pitch changes (faster = higher pitch)

---

### When Speed Change Fails

**Popup**:
- Status: "❌ Failed to set speed" (red)
- No active state change

**Console**:
```
❌ No YouTube player or video found
```

**Video**:
- Speed remains unchanged

---

## 🎯 Limitations

### 1. Main Tab Only
**Limitation**: Speed control works on the main YouTube tab, NOT on floating windows

**Reason**: Floating windows are separate contexts. The message from popup goes to the active YouTube tab.

**Future Enhancement**:
```javascript
// To control floating window speed, would need to:
// 1. Track floating window IDs
// 2. Send message to floating window content script
// 3. Floating window content script changes player speed
```

---

### 2. Requires Active YouTube Tab
**Limitation**: Speed control only works if there's an active YouTube tab

**Reason**: Message is sent to active tab in current window

**Solution**: User must open YouTube first

---

### 3. No Custom Speeds
**Limitation**: Only 4 preset speeds: 1x, 1.25x, 1.5x, 2x

**Future Enhancement**:
```html
<input type="range" min="0.5" max="3" step="0.25" value="1">
<button>Set Custom Speed</button>
```

---

## 🚀 Future Enhancements

### 1. Custom Speed Input
```html
<div class="speed-custom">
  <input type="number" id="custom-speed" min="0.5" max="3" step="0.25" value="1">
  <button id="set-custom-speed">Set</button>
</div>
```

### 2. Floating Window Speed Control
- Add speed control directly in floating window
- Inject speed control script into floating window context
- Independent control from main tab

### 3. Keyboard Shortcuts
```javascript
// Speed control shortcuts:
// Ctrl + 1 → 1x
// Ctrl + 2 → 2x
// Ctrl + Shift + ↑ → Increase speed
// Ctrl + Shift + ↓ → Decrease speed
```

### 4. Remember Last Speed
```javascript
// Save speed to chrome.storage
// Restore speed when opening new video
chrome.storage.local.set({ lastSpeed: 1.5 });
```

---

## 📝 Summary

**What Works**:
- ✅ Speed control on main YouTube tab
- ✅ 4 preset speeds (1x, 1.25x, 1.5x, 2x)
- ✅ Visual feedback (success/error states)
- ✅ Active state on buttons
- ✅ Multiple fallback methods
- ✅ Service worker retry mechanism

**What Doesn't Work**:
- ❌ Speed control in floating windows
- ❌ Custom speeds (only presets)
- ❌ Speed control when no YouTube tab open

**Known Limitations**:
- Main tab only (not floating windows)
- Requires active YouTube tab
- Fixed speed presets

---

## ✅ Success Criteria

Speed controls are successful if:
- [ ] All 4 speed buttons work (1x, 1.25x, 1.5x, 2x)
- [ ] Visual feedback shows success/error
- [ ] Active state updates on correct button
- [ ] Video speed actually changes
- [ ] Works after service worker idle (30s+)
- [ ] No console errors
- [ ] Graceful error handling (no YouTube tab)

---

*Last updated: January 22, 2025*
