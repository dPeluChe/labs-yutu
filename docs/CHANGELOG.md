# Changelog

All notable changes to the Yutu Labs extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2025-01-22

### Added
- Custom Modal system (`content/modal.js`) with non-intrusive notifications
- Modal styles with smooth animations and professional design
- Centralized configuration module (`content/config.js`)
- Single source of truth for settings and storage
- Consistent error handling across modules
- `loadSettings()` and `saveSettings()` utility functions

### Changed
- **BREAKING**: All UI text now in English (previously Spanish)
  - Popup interface translated
  - Error messages translated
  - Help text translated
  - Manifest description translated
- Replaced native `alert()` calls with `Modal.showError()`
- Refactored settings management to use centralized config module
- Removed code duplication between popup.js and hider.js

### Fixed
- Improved error handling in settings management
- Better UX with non-blocking error notifications

### Improved
- Better code organization and maintainability
- Easier to add new settings (single source of truth)
- Improved testability with separated configuration
- Consistent error messages and logging
- Professional modal notifications instead of browser alerts

### Documentation
- Created `docs/TASK_TODO.md` with refactoring roadmap
- Created `docs/TASK_COMPLETED.md` with completion log
- Created `docs/CHANGELOG.md` (this file)
- Created `docs/REFACTORING_RECOMMENDATIONS.md` with detailed plan

### Internal
- Extracted configuration management to separate module
- Removed 19 lines of duplicate code
- Added 1300+ lines of well-structured code
- Set up import/export structure for future modules

---

## [1.0.0] - Previous Release

### Added
- Floating window system for YouTube videos
- "Open" button on video thumbnails (Home, Search, Sidebar)
- Configuration panel for hiding elements in floating windows
  - Hide Reels/Shorts
  - Hide Related Videos sidebar
  - Hide Description
  - Hide Header navigation bar
- Element hiding functionality (content/hider.js)
- Background service worker for window management
- Custom styling for buttons and UI elements
- Chrome Manifest V3 support
- Auto-save settings functionality

### Features
- Opens YouTube videos in floating windows without leaving current page
- Multiple layout support (Home grid, Search results, Sidebar)
- MutationObserver for dynamic YouTube SPA navigation
- Settings persistence using chrome.storage
- Selective element hiding in floating windows only
- Window positioning in bottom-right corner
- Responsive button design with hover effects

### Technical
- Vanilla JavaScript (no frameworks)
- esbuild for bundling
- Content script injection for YouTube pages
- Service worker for background tasks
- CSS animations and gradients
- Sourcemap support for debugging

---

## Migration Guide

### From 1.0.0 to 1.1.0 (Unreleased)

**No breaking changes** - All user settings are preserved.

**Language Change**:
- All UI is now in English
- Existing Spanish users will see English interface
- No functionality changes, only text language

**Developer Changes**:
- Settings structure unchanged
- Storage key unchanged (`yutuSettings`)
- Popup and hider now import from `content/config.js`
- Error messages now use `Modal.showError()` instead of `alert()`

---

## Version Scheme

- **Major version (X)**: Breaking changes, major features
- **Minor version (x)**: New features, non-breaking changes
- **Patch version (x.x)**: Bug fixes, minor improvements

---

## Future Releases

### 1.2.0 - Planned
- Phase 2: Extract Selectors
- Phase 3: Extract Constants
- Phase 4: Separate Button Creation
- Improved code organization

### 1.3.0 - Planned
- Phase 5: Refactor Popup to Class
- Phase 6: Background Window Manager
- Phase 7: Utilities & Error Handling
- Complete refactoring

### 2.0.0 - Potential Future
- New features (window management, button customization, UI enhancements)
- Keyboard shortcuts
- Multiple floating windows
- Analytics and statistics
- Advanced YouTube integration

---

## Commit History

### Session 1 - 2025-01-22
```
c9de42f refactor: Phase 1 - Extract configuration management
87dfe43 feat: Translate extension to English and implement custom modal system
9a1bfbb feat: Sistema de configuración para ocultar elementos en ventanas emergentes
```

---

## Contributors

- Original development team
- Refactoring and improvements (2025)

---

## Links

- [GitHub Repository](https://github.com/your-repo/yutu-labs)
- [Issue Tracker](https://github.com/your-repo/yutu-labs/issues)
- [Documentation](./README.md)
- [Refactoring Plan](./REFACTORING_RECOMMENDATIONS.md)
