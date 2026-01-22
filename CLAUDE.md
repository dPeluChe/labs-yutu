# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Yutu Labs** is a Chrome extension (Manifest V3) that enhances the YouTube browsing experience by opening videos in floating windows. Users can click an "Abrir" button on video thumbnails to open videos in a small floating window without navigating away from their current page (Home, Search, Sidebar).

### Technology Stack
- **Core Solution**: window.open() for floating windows
- **Build System**: esbuild (ESM format, Chrome 110+ target)
- **Extension Type**: Chrome Manifest V3 with content scripts and service worker
- **Language**: Vanilla JavaScript (no framework)
- **Styling**: Plain CSS with animations and gradients

---

## Development Commands

```bash
# Install dependencies
npm install

# Build extension (outputs to dist/)
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Load extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the dist/ folder
```

### Build System Details
- Build script: `scripts/build.mjs`
- Uses esbuild to bundle three entry points:
  - `background/background.js` → Service worker
  - `content/content.js` → Content script injected into YouTube
  - `popup/popup.js` → Extension popup UI
- Copies static assets (manifest.json, CSS, HTML) to dist/
- Generates sourcemaps for debugging

---

## Architecture

### Extension Components

#### 1. Content Script (`content/content.js`)
**Core Class**: `YutuPiPManager`

Responsibilities:
- Injects "Abrir" buttons onto YouTube video thumbnails across different page types
- Opens videos in floating windows using window.open()
- Uses MutationObserver to handle YouTube's dynamic DOM updates
- Manages floating window lifecycle (open, track, cleanup)

**Key Methods**:
- `injectButtons()`: Finds video cards using multiple selectors for different YouTube layouts
- `openPiPPlayer(videoId)`: Opens video in floating window using window.open()
- `createButton(videoId)`: Creates button element with click handler
- `getVideoId(url)`: Extracts video ID from YouTube URLs

**Supported YouTube Layouts**:
```javascript
// Targets for button injection
'ytd-rich-item-renderer'      // Home grid
'ytd-grid-video-renderer'     // Grid views
'ytd-compact-video-renderer'  // Sidebar
'ytd-video-renderer'          // Search results
```

**Floating Window Strategy**:
1. Close any existing floating window before opening new one
2. Calculate position (bottom-right corner with 50px margins)
3. Define dimensions (854x480 for 16:9 aspect ratio)
4. Open youtube.com/watch?v=VIDEO_ID with autoplay using window.open()
5. Track window state with interval checker
6. Clean up when window closes

#### 2. Background Service Worker (`background/background.js`)
Minimal implementation - currently just logs initialization. Extension logic is primarily in content scripts.

#### 3. Popup UI (`popup/`)
Extension toolbar popup with basic HTML/CSS/JS interface.

#### 4. Styling (`content/content.css`)
- `.yutu-play-btn`: Positioned absolutely on thumbnails, appears on hover with fade transition
- `.yutu-inline-player-container`: Full-width dark container with slideDown animation
- `.yutu-player-wrapper`: 16:9 aspect ratio wrapper, max 1200px width, centered

---

## Solution: window.open() Floating Windows

**See docs/FINAL_SOLUTION.md** for complete history and decision process.

### YouTube Embedding Restrictions (Unresolvable)
YouTube aggressively blocks ALL iframe embed attempts when:
- Origin matches the embedder (youtube.com embedding youtube.com)
- Context appears to be "recursive embedding"
- Even with Document Picture-in-Picture API
- Even with YouTube IFrame Player API (official)
- Even with youtube-nocookie.com proxy

**Error**: `embedder.identity.missing.referrer` (Error 153) - persistent across all embed methods.

### Final Solution: window.open()
After multiple failed attempts with various embedding techniques, the pragmatic solution uses **window.open()** to open videos in native browser windows:

Implementation:
```javascript
openPiPPlayer(videoId) {
  const width = 854;   // 16:9 aspect ratio
  const height = 480;
  const left = window.screen.width - width - 50;
  const top = window.screen.height - height - 100;

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;

  this.currentPiPWindow = window.open(
    videoUrl,
    'YutuLabsPlayer',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes`
  );
}
```

**Result**: Videos always play perfectly using YouTube's official player. No embedding restrictions apply.

---

## Development Patterns

### MutationObserver Pattern
Content script uses MutationObserver on `document.body` to detect when YouTube's SPA navigation adds new video cards:
```javascript
observe() {
  this.observer = new MutationObserver((mutations) => {
    let shouldInject = false;
    for (const m of mutations) {
      if (m.addedNodes.length) {
        shouldInject = true;
        break;
      }
    }
    if (shouldInject) {
      this.injectButtons();
    }
  });
  this.observer.observe(document.body, { childList: true, subtree: true });
}
```

### Selector Strategy
Extension uses CSS selector chains to handle YouTube's evolving component architecture (Polymer/Lit-based custom elements). Searches for `a[href*="/watch?v="]` within component containers to extract video IDs.

### State Management
Player state tracked via DOM:
- `existingPlayer.dataset.videoId` stores currently playing video
- Single player instance enforced (toggle or replace behavior)
- No global state objects, relies on DOM queries

---

## Chrome Extension Manifest

**Key Permissions**:
- `storage`: For future settings/preferences
- `scripting`: For content script injection
- `host_permissions`: `*://*.youtube.com/*`

**Content Scripts**:
- Runs at `document_end` to ensure YouTube's initial DOM is loaded
- CSS injection for button styling

---

## Testing Workflow

1. Make code changes
2. Run `npm run build` (or keep `npm run watch` running)
3. Go to `chrome://extensions/`
4. Click "Reload" button on Yutu Labs extension
5. Refresh YouTube tab or navigate to youtube.com
6. Test on different page types:
   - Home feed (grid layout)
   - Search results
   - Channel pages
   - Sidebar recommendations

### Debugging
- **Content Script**: Check YouTube page console for logs starting with "Yutu Labs:"
- **Background Worker**: chrome://extensions/ → "Inspect service worker"
- **Sourcemaps**: Enabled in build, use browser DevTools to debug original source

---

## File Structure Reference

```
labs-yutu/
├── background/
│   └── background.js          # Service worker (minimal)
├── content/
│   ├── content.js             # Main extension logic (YutuPiPManager)
│   ├── content.css            # Button styles
│   └── player.html            # (Obsolete - can be removed)
├── popup/
│   ├── popup.html             # Extension popup UI
│   ├── popup.css
│   └── popup.js
├── scripts/
│   └── build.mjs              # esbuild configuration
├── docs/                       # Documentation
│   ├── ATTEMPTS_AND_ALTERNATIVES.md
│   ├── TECHNICAL_EVALUATION.md
│   ├── ERROR_153_DEBUGGING.md
│   ├── FINAL_SOLUTION.md      # Complete solution history
│   ├── TESTING.md
│   └── REFACTOR_SUMMARY.md
├── dist/                       # Build output (gitignored)
├── manifest.json              # Chrome extension manifest
├── package.json               # Node dependencies (esbuild)
├── README.md                  # User documentation
└── CLAUDE.md                  # This file
```

---

## Important Notes

- **YouTube DOM Changes**: YouTube frequently updates its UI. Selectors may need adjustment if button injection breaks after YouTube updates.
- **Popup Blockers**: Users must allow popups for youtube.com. The extension handles this gracefully with a message.
- **No React/Framework**: Extension uses vanilla JS for minimal bundle size and fast injection.
- **Spanish Documentation**: README and docs are in Spanish; code comments are English.
- **Simple Solution**: After extensive testing of embed techniques, window.open() proved to be the most reliable solution.
