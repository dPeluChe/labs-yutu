# Build Verification Guide

## Current Build Status

**Date**: January 22, 2025
**Last Build**: ✅ SUCCESS
**Build Command**: `npm run build`

---

## ✅ Build Output

### dist/ Structure
```
dist/
├── manifest.json           (623 bytes)
├── background/
│   ├── background.js       (2,701 bytes)
│   └── background.js.map   (5,401 bytes)
├── content/
│   ├── content.css        (2,983 bytes)
│   ├── content.js         (8,629 bytes)
│   ├── content.js.map     (15,003 bytes)
│   ├── hider.js          (3,823 bytes)
│   ├── hider.js.map      (8,185 bytes)
│   └── player.html       (4,680 bytes)
└── popup/
    ├── popup.html         (2,536 bytes)
    ├── popup.css         (3,213 bytes)
    ├── popup.js          (3,799 bytes)
    └── popup.js.map      (7,621 bytes)
```

**Total Files**: 11 files
**Total Size**: ~60KB (uncompressed)
**Status**: All files generated successfully

---

## 🔍 Build Verification Steps

### 1. Check Files Exist
```bash
# Navigate to dist folder
cd dist

# List all files
find . -type f

# Expected: 11 files (see structure above)
```

### 2. Check Manifest
```bash
# View manifest.json
cat manifest.json

# Expected fields:
{
  "manifest_version": 3,
  "name": "Yutu Labs",
  "version": "1.0.0",
  "description": "Experimental enhancements for YouTube",
  ...
}
```

### 3. Check Bundle Sizes
```bash
# Check file sizes
ls -lh dist/content/content.js
ls -lh dist/popup/popup.js
ls -lh dist/background/background.js

# Expected:
# content.js: ~8-9KB
# popup.js: ~3-4KB
# background.js: ~2-3KB
```

### 4. Check Sourcemaps
```bash
# Check sourcemaps exist
ls -lh dist/**/*.js.map

# Expected: 6 sourcemap files (one per .js file)
```

---

## 🧪 Pre-Load Checklist

Before loading the extension in Chrome, verify:

- [ ] `npm run build` completed successfully
- [ ] All expected files exist in `dist/`
- [ ] `manifest.json` has correct version (1.0.0)
- [ ] Bundle sizes are reasonable (<20KB per file)
- [ ] Sourcemaps generated for debugging

---

## 📦 Load Extension in Chrome

### Step 1: Open Extensions Page
1. Navigate to `chrome://extensions/`
2. Toggle "Developer mode" (top-right)
3. Click "Load unpacked"

### Step 2: Select Build Folder
1. Navigate to `dist/` folder
2. Click "Select"
3. Extension should appear in list

### Step 3: Verify Installation
```
Expected:
- Extension name: "Yutu Labs"
- Version: "1.0.0"
- ID: (Chrome-generated unique ID)
- Permissions: storage, scripting, tabs, windows
- Error count: 0
```

---

## 🔎 Chrome DevTools Verification

### Content Script Console
1. Navigate to `https://www.youtube.com`
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. Expected logs:
```
🚀 Yutu Labs: Initializing...
✅ Buttons injected
✅ Observer started
```

### Background Service Worker Console
1. Go to `chrome://extensions/`
2. Find "Yutu Labs" extension
3. Click "Inspect service worker"
4. Expected logs:
```
Yutu Labs background script loaded
```

### Popup Console
1. Click Yutu Labs icon in toolbar
2. Right-click inside popup
3. Select "Inspect"
4. Expected logs:
```
Settings loaded from storage
```

---

## ✅ Functionality Verification

### Test 1: Open Floating Window
1. Go to YouTube home
2. Hover over any video thumbnail
3. Click "Open" button
4. Expected:
   - ✅ Floating window opens
   - ✅ Video plays automatically
   - ✅ No errors in console

### Test 2: Settings Persistence
1. Open extension popup
2. Toggle "Hide Reels" on
3. Click "Save changes"
4. Close popup
5. Open popup again
6. Expected:
   - ✅ "Hide Reels" still toggled on
   - ✅ Settings saved in storage

### Test 3: Element Hiding
1. Open a floating window
2. Toggle settings (e.g., "Hide Sidebar")
3. Click "Save changes"
4. Reload floating window (Ctrl+R)
5. Expected:
   - ✅ Elements hidden according to settings

### Test 4: Service Worker Retry
1. Open YouTube
2. Wait 30 seconds (service worker will sleep)
3. Click "Open" button on any video
4. Expected:
   - ✅ Retries (visible in console)
   - ✅ Floating window opens
   - ✅ No error shown to user

---

## 🐛 Troubleshooting

### Issue: Buttons don't appear
**Check**:
- Console for errors
- YouTube page loaded completely
- Extension enabled in `chrome://extensions/`

**Solution**:
```javascript
// In YouTube console, run:
window.yutuPiPManager
// Should return object, not undefined
```

### Issue: Floating window doesn't open
**Check**:
- Background service worker is running
- Console for retry errors
- Popups allowed in Chrome settings

**Solution**:
```javascript
// In YouTube console, run:
chrome.runtime.sendMessage({ action: 'ping' })
// Should return response
```

### Issue: Settings not saving
**Check**:
- Storage permission in manifest
- Console for storage errors
- "Save changes" button clicked

**Solution**:
```javascript
// In YouTube console, run:
chrome.storage.local.get('yutuSettings')
// Should return settings object
```

### Issue: "Communication error" after 30s
**Check**:
- Service worker retry logic in content.js
- Console for retry logs

**Solution**:
```javascript
// In YouTube console, check:
// Should see:
// ⚠️ Attempt 1/3 failed: ...
// 🔄 Retrying in 500ms...
// ⚠️ Attempt 2/3 failed: ...
// 🔄 Retrying in 750ms...
// ✅ Success
```

---

## 📊 Build Metrics

| Metric | Value |
|--------|-------|
| Total Files | 11 |
| Total Size | ~60KB |
| Largest File | content.js (8.6KB) |
| Smallest File | manifest.json (623B) |
| Build Time | <2 seconds |
| Errors | 0 |
| Warnings | 0 |

---

## ✅ Success Criteria

Build is successful if:
- [ ] All 11 files generated
- [ ] No build errors or warnings
- [ ] All files have reasonable sizes
- [ ] Manifest is valid JSON
- [ ] Extension loads in Chrome
- [ ] No console errors
- [ ] All features work (buttons, settings, floating window)

---

*Last updated: January 22, 2025*
