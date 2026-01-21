# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Yutu Labs** is a Chrome extension (Manifest V3) that enhances the YouTube browsing experience using the Document Picture-in-Picture API. Users can click a "PiP" button on video thumbnails to open videos in a floating always-on-top window without navigating away from their current page (Home, Search, Sidebar).

### Technology Stack
- **Core API**: Document Picture-in-Picture API (Chrome 116+)
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
- Injects "PiP" buttons onto YouTube video thumbnails across different page types
- Manages Picture-in-Picture window lifecycle (create, close, cleanup)
- Uses MutationObserver to handle YouTube's dynamic DOM updates
- Handles Document PiP API feature detection and error handling

**Key Methods**:
- `injectButtons()`: Finds video cards using multiple selectors for different YouTube layouts
- `openPiPPlayer(videoId)`: Opens Document PiP window with YouTube embed iframe
- `setupPiPWindow(pipWindow, videoId)`: Creates window structure (header, player, styles)
- `handlePiPError(error)`: User-friendly error messages for common PiP failures
- `getVideoId(url)`: Extracts video ID from YouTube URLs

**Supported YouTube Layouts**:
```javascript
// Targets for button injection
'ytd-rich-item-renderer'      // Home grid
'ytd-grid-video-renderer'     // Grid views
'ytd-compact-video-renderer'  // Sidebar
'ytd-video-renderer'          // Search results
```

**PiP Window Strategy**:
1. Check for Document PiP API support (`'documentPictureInPicture' in window`)
2. Close any existing PiP window before opening new one
3. Request PiP window with 16:9 dimensions (1280x720)
4. Inject custom HTML structure (header with branding + iframe container)
5. Add inline styles (gradients, animations, responsive layout)
6. Create YouTube embed iframe with autoplay
7. Setup event listeners for window close/cleanup

#### 2. Background Service Worker (`background/background.js`)
Minimal implementation - currently just logs initialization. Extension logic is primarily in content scripts.

#### 3. Popup UI (`popup/`)
Extension toolbar popup with basic HTML/CSS/JS interface.

#### 4. Styling (`content/content.css`)
- `.yutu-play-btn`: Positioned absolutely on thumbnails, appears on hover with fade transition
- `.yutu-inline-player-container`: Full-width dark container with slideDown animation
- `.yutu-player-wrapper`: 16:9 aspect ratio wrapper, max 1200px width, centered

---

## Solution: Document Picture-in-Picture API

**See ATTEMPTS_AND_ALTERNATIVES.md and TECHNICAL_EVALUATION.md** for detailed technical history and research.

### Previous Embedding Issues (Resolved)
YouTube previously blocked iframe embeds when:
- Origin matched the embedder (youtube.com embedding youtube.com)
- Context appeared to be "recursive embedding"
- Referrer policies were manipulated

### Current Solution
**Document Picture-in-Picture API** completely bypasses these restrictions by:
- Creating a separate window context (not same-origin iframe)
- Using standard YouTube embed URL without restrictions
- Browser-native API (Chrome 116+) with official support

Implementation:
```javascript
const pipWindow = await window.documentPictureInPicture.requestWindow({
  width: 1280,
  height: 720
});

const iframe = pipWindow.document.createElement('iframe');
iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
```

**Result**: Videos play perfectly without "Video unavailable" errors (152/153).

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
- CSS injection for button/player styling

**Web Accessible Resources**:
- `content/player.html` (for extension-origin iframe approach, currently unused)

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
│   ├── content.js             # Main extension logic (YutuManager)
│   ├── content.css            # Injected styles
│   └── player.html            # (Legacy/unused alternative approach)
├── popup/
│   ├── popup.html             # Extension popup UI
│   ├── popup.css
│   └── popup.js
├── scripts/
│   └── build.mjs              # esbuild configuration
├── dist/                       # Build output (gitignored)
├── manifest.json              # Chrome extension manifest
├── package.json               # Node dependencies (esbuild, archiver)
└── ATTEMPTS_AND_ALTERNATIVES.md  # Technical history/alternatives
```

---

## Important Notes

- **YouTube DOM Changes**: YouTube frequently updates its UI. Selectors may need adjustment if button injection breaks after YouTube updates.
- **Iframe Restrictions**: Current embed approach may be blocked by YouTube's security policies. Monitor console for errors.
- **No React/Framework**: Extension uses vanilla JS for minimal bundle size and fast injection.
- **Spanish Documentation**: README and ATTEMPTS_AND_ALTERNATIVES are in Spanish; code comments are minimal/English.
