# Changelog

All notable changes to the Yutu Labs extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.6.2] - 2026-10-02

### Added
- Small promo tile for the store (`docs/STORE/screenshots/promo-tile-440x280.png`)
- "Report a bug" link in the popup footer, opening the GitHub bug report form (`.github/ISSUE_TEMPLATE/`); READMEs and the listing point to the public issue tracker

### Changed
- Docs cleanup: naming decision archived (`docs/ARCHIVED/NAMING_DECISION.md`), six obsolete docs about the old `window.open()` flow removed (still in git history), `docs/ARCHIVED/README.md` condensed

## [1.6.1] - 2026-10-02

### Fixed
- Selector tab: "Pick element on page" now has its own full-width row with the light theme instead of a cramped dark button

### Added
- Chrome Web Store screenshots (`docs/STORE/screenshots/`, 1280x800)

## [1.6.0] - 2026-10-02

### Changed
- Product renamed from "Yutu Labs" to **Yush** (manifest name `Yush: Calm Video Feed & Floating Player`, popup, READMEs, docs, log prefixes, zip name `yush-v<version>.zip`). Legacy internals (`yutu-` CSS prefix, `data-yutu-*`, `yutu_popup`, `yutuSettings`) are unchanged so saved settings survive
- Manifest description now mentions the calm-feed features
- `YutuPiPManager` renamed `YushManager`, `isYutuPopupWindow` renamed `isFloatingWindow`
- `docs/STORE/NAMING.md` rewritten as the naming decision record; GitHub repository renamed to `dPeluChe/yush` and the listing/privacy policy URLs updated
- Simplify pass: `mergeSettings()` and a single shared `subscribeSettings()` listener in `content/config.js` replace four hand-written `storage.onChanged` listeners (and a redundant storage read in the hider); `isHomePath()`/`isWatchPath()` helpers; `getActiveYouTubeTab()` shared by the popup modules; the hider skips identical style rewrites and the old-video filter skips attribute writes that change nothing; 48 tests

## [1.5.0] - 2026-10-02

### Added
- "Hide Shorts shelf" toggle for the Home feed (Feed tab, off by default): hides the whole Shorts block (`:has()` on the shorts lockup), scoped to `/` via `html[data-yutu-home]`
- Feed tab shows a "Reload YouTube tab to apply" button after any option is saved
- `README.md` rewritten in English and `README.es.md` in Spanish, explanation only (commands moved to `docs/GUIDES/DEVELOPMENT.md`)
- `docs/ARCHITECTURE/HOW_IT_WORKS.md`, `docs/GUIDES/DEVELOPMENT.md`, `docs/STORE/NAMING.md` (rename proposal)
- Creator credit (peluche, dpeluche.dev) in the popup, READMEs, listing and `package.json`

### Changed
- `CLAUDE.md` rewritten lean: stale sections removed, pointers to `docs/`

### Fixed
- Old video filter: thumbnail blurred and title muted; channel and date row stay at full color; everything clears on hover
- Old video filter no longer depends on YouTube's `ytd-browse[page-subtype="home"]` attribute: Home is detected by path (`/`), the effect is cleared when leaving Home and restored on return

## [1.4.0] - 2026-10-02

### Added
- 1.15x speed preset (buttons, popup and shortcuts are now Alt/Option + 1..5: 1, 1.15, 1.25, 1.5, 2)
- Hide controls for regular watch pages (`watchPage` settings, off by default), alongside the floating-window ones; the popup has a "Floating window / Watch page" switch
- Old video filter for the Home feed: blur (clears on hover) or hide cards older than 1 month to 2 years, from the new Feed tab (off by default; English and Spanish dates)

### Changed
- `content/hider.js` rewritten on top of `content/hide-rules.js`; settings changes propagate through `chrome.storage.onChanged` (no more `updateHiddenElements` message)
- Popup hide toggles are rendered from a single option list
- 35 tests (age parsing, hide rules, old-video filter)
- Tooling and docs: `npm run package` (zip for the Chrome Web Store), `docs/STORE/` listing texts and privacy policy (moved from the repo root), `.doctos.yml`

---

## [1.3.1] - 2026-10-02

### Changed
- Observer scoped to `ytd-page-manager` on YouTube (falls back to `body`)
- Custom selector changes (popup or element picker) apply live via `chrome.storage.onChanged`; fixes picked selector not applying until reload
- `popup/popup.js` split into modules; `floating-speed-controls.js` split into anchor, UI and shortcuts modules
- Specific CSS transitions instead of `transition: all`
- Explicit `content_security_policy` in manifest; removed stale popup-blocker message

### Added
- jsdom tests for button injection, shortcuts and domain normalization (20 tests)

## [1.3.0] - 2026-10-01

### Added
- Extension icons (16/48/128) with final design (`icons/icon.svg`, rendered by `npm run icons`), declared in manifest
- Support for the `yt-lockup-view-model` card layout

### Changed
- Floating window id persisted in `chrome.storage.session` (survives service worker suspension)
- Card injection uses `data-yutu-injected` marker; nested cards no longer get duplicate buttons
- MutationObserver ignores non-element mutations
- `google-content.js` merged into `external-content.js` (scope picked by hostname)
- Build cleans `dist/` first; esbuild upgraded to 0.25 (audit clean); versions unified
- Removed debug `console.log` noise and deprecated selector export

---

## [Unreleased] - 2026-02-20

### Added
- External `View` button injection for YouTube/Vimeo links on Google and generic websites
- Context-specific content script entrypoints:
  - `content/youtube-content.js`
  - `content/google-content.js`
  - `content/external-content.js`
- Vimeo URL detection and floating window opening support
- Compact/discreet external button variant aligned with current UI style
- Inline speed controls injected directly in floating YouTube popup windows (`yutu_popup=true`)
- Keyboard shortcuts for popup speed controls (`Alt/⌥ + 1..4`)
- New popup settings controls:
  - `Hide all (default)`
  - `Hide Like/More actions`
  - `Hide Merch shelf`
- Global `Close on finish` setting in popup configuration
- Inline `Close on finish` toggle in floating player controls

### Changed
- Refactored `content/content.js` into shared core logic with per-context initialization
- Updated `manifest.json` to route scripts by context (YouTube, Google, other websites)
- Updated `scripts/build.mjs` with segmented content entrypoints
- Improved Google SERP injection behavior to avoid duplicate buttons
- Improved Google SERP compatibility to avoid rotated `View` button rendering
- Floating window opening now accepts `targetUrl` (not only videoId)
- Floating popup layout now renders a custom top title bar above `ytd-app`
- Floating popup speed widget now anchors to the action row (`ytd-menu-renderer`) and adapts to responsive layouts
- Floating popup speed widget now recenters in the top metadata row and recomputes safe width on resize
- Added support for YouTube Shorts lockup structure so card button injection works in shorts shelves
- Moved shorts card action button down to avoid overlap with title and 3-dot menu
- Default hide settings now start enabled for popup cleanup
- Removed unused `content/speed-controller.js`
- Added background action to close the floating window on demand (`closeFloatingWindow`)
- Synced close-on-finish state between popup settings and inline player control

### Fixed
- Restored popup speed widget mounting after delayed YouTube DOM updates and SPA navigation
- Persisted popup detection across in-window YouTube navigation using session storage fallback
- Expanded popup hide rules to cover modern description and secondary-rail structures (`#bottom-row`, structured description, engagement panels)

### Performance
- Added debounced reinjection in `MutationObserver` to reduce DOM churn on dynamic pages

### Documentation
- Updated main `README.md` with multi-site behavior and segmented architecture
- Cleaned and restructured `docs/TASK_TODO.md` to reflect current priorities
- Moved outdated task completion log to `docs/ARCHIVED/TASK_COMPLETED_2025.md`
- Created refreshed `docs/TASK_COMPLETED/README.md` with current completed scope

---

## [1.0.0] - 2025-01-22

### Added
- Floating window system for YouTube videos
- "Open" button on YouTube thumbnails (Home, Search, Sidebar)
- Settings panel for hiding elements in floating windows
  - Hide Reels/Shorts
  - Hide Sidebar recommendations
  - Hide Description
  - Hide Header
- Custom modal notification system (`content/modal.js`)
- Centralized settings config module (`content/config.js`)
- Popup speed controls UI (1x, 1.25x, 1.5x, 2x)
- Speed control messaging between popup and content script

### Changed
- UI/messages migrated to English
- Replaced `alert()` calls with modal-based notifications
- Settings management refactored to centralized config pattern

### Fixed
- Improved handling of background/service-worker idle communication with retry logic
- Improved reliability of playback speed update with fallback methods

### Technical
- Manifest V3 architecture
- Vanilla JavaScript + esbuild bundling
- Content scripts + background worker communication model

---

## Legacy / Research Documents

Historical deep-dives and implementation notes are kept under:
- `docs/ARCHIVED/`

Notable archived references:
- `docs/ARCHIVED/SPEED_CONTROL_RESEARCH.md`
- `docs/ARCHIVED/SPEED_CONTROLS_TESTING.md`
- `docs/ARCHIVED/YOUTUBE_API_INVESTIGATION.md`
- `docs/ARCHIVED/BUILD_VERIFICATION.md`
- `docs/ARCHIVED/TASK_COMPLETED_2025.md`
