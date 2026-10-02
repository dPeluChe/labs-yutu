# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Yutu Labs** is a Chrome extension (Manifest V3) that enhances the YouTube browsing experience by opening videos in floating windows. Users can click an "Abrir" button on video thumbnails to open videos in a small floating window without navigating away from their current page (Home, Search, Sidebar).

### Technology Stack
- **Core Solution**: `chrome.windows.create({type:'popup'})` from the service worker
- **Build System**: esbuild (IIFE bundles, Chrome 110+ target); only `dist/` is loadable
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
- Cleans `dist/`, then bundles five entry points:
  - `background/background.js` → Service worker
  - `content/youtube-content.js` → YouTube cards, speed controls, picker
  - `content/hider.js` → Hides elements in Yutu popup windows
  - `content/external-content.js` → Google (scope `google`) and opt-in sites
  - `popup/popup.js` → Extension popup UI
- Copies manifest, CSS, HTML and `icons/` to dist/
- Sourcemaps only in watch mode (`npm run icons` regenerates the PNGs)

---

## Architecture

### Extension Components

#### 1. Content Script (`content/content.js`)
**Core Class**: `YutuPiPManager` (`content/content.js`, entry is `youtube-content.js`)

Responsibilities:
- Injects "Abrir" buttons onto YouTube video thumbnails across different page types
- Asks the service worker to open floating windows (`messaging.js`)
- Uses MutationObserver to handle YouTube's dynamic DOM updates
- Manages floating window lifecycle (open, track, cleanup)

**Key Methods**:
- `injectButtons()` finds cards via `selectors.js` and delegates to `button-factory.js` (thumbnail + metadata buttons, `data-yutu-injected` marker)
- `url-utils.js`: `extractVideoTarget(url)`

**Supported YouTube Layouts**:
```javascript
// Targets for button injection
'ytd-rich-item-renderer'      // Home grid
'ytd-grid-video-renderer'     // Grid views
'ytd-compact-video-renderer'  // Sidebar
'ytd-video-renderer'          // Search results
'yt-lockup-view-model'        // New lockup layout (outermost card wins)
```

**Floating Window Strategy** (`background/background.js`):
1. Close the previous window (id kept in `chrome.storage.session`, survives worker suspension)
2. Position bottom-right of the primary display work area (`system.display`)
3. 854x480, `type: 'popup'`, URL gets `autoplay=1&yutu_popup=true`

#### 2. Background Service Worker (`background/background.js`)
Opens/closes the floating window, tracks its id in `chrome.storage.session`, and registers dynamic content scripts for opt-in external sites.

#### 3. Popup UI (`popup/`)
Extension toolbar popup with basic HTML/CSS/JS interface.

#### 4. Styling (`content/content.css`)
- `.yutu-play-btn`: Positioned absolutely on thumbnails, appears on hover with fade transition
- `.yutu-inline-player-container`: Full-width dark container with slideDown animation
- `.yutu-player-wrapper`: 16:9 aspect ratio wrapper, max 1200px width, centered

---

## Solution: chrome.windows.create() Floating Windows

**See docs/ARCHIVED/FINAL_SOLUTION.md** for history. YouTube blocks every iframe embed (Error 153), so videos open in native popup windows with YouTube's own player.

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
background/   service worker (window lifecycle, dynamic external scripts)
content/      youtube-content.js (entry), external-content.js (entry), hider.js (entry),
              content.js (manager), button-factory.js, selectors.js, url-utils.js,
              messaging.js, config.js, element-picker.js, floating-speed-controls.js,
              modal.js, content.css
popup/        toolbar popup (html/css/js)
icons/        PNGs from scripts/generate-icons.mjs
scripts/      build.mjs, generate-icons.mjs
test/         node:test unit tests (npm test)
docs/         README index, TASK_TODO, TASK_COMPLETED/, ARCHIVED/
```

---

## Important Notes

- **YouTube DOM Changes**: YouTube frequently updates its UI. Selectors may need adjustment if button injection breaks after YouTube updates.
- **No React/Framework**: Extension uses vanilla JS for minimal bundle size and fast injection.
- **Spanish Documentation**: README and docs are in Spanish; code comments are English.
- **Simple Solution**: After extensive testing of embed techniques, native popup windows proved to be the most reliable solution.

## ship config

```yaml
lint: npm run lint
test: npm test
build: npm run build
merge_policy: auto
loc_limit: 500
branch_cleanup: delete
```
