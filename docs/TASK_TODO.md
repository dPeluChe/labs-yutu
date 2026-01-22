# Task TODO List

## Refactoring Tasks

### Phase 1: Configuration Management ✅ COMPLETED
- [x] Create `content/config.js` with configuration functions
- [x] Update `popup.js` to import from config
- [x] Update `hider.js` to import from config
- [x] Build and test configuration changes

**Status**: Completed - Commit `c9de42f`
**Estimated Time**: 1-2 hours
**Actual Time**: ~30 minutes

---

### Phase 2: Extract Selectors
- [ ] Create `content/selectors.js` with YouTube DOM selectors
- [ ] Update `content.js` to use imported selectors
- [ ] Update `hider.js` to use imported selectors
- [ ] Build and test selector changes
- [ ] Verify button injection works with new selectors
- [ ] Verify element hiding works with new selectors

**Status**: Not Started
**Priority**: High
**Estimated Time**: 2-3 hours

---

### Phase 3: Extract Constants
- [ ] Create `content/constants.js` with labels and dimensions
- [ ] Move BUTTON_LABELS from content.js to constants
- [ ] Move WINDOW_DIMENSIONS from content.js to constants
- [ ] Update `content.js` to import from constants
- [ ] Update `background.js` to use constants (if applicable)
- [ ] Build and test constants changes

**Status**: Not Started
**Priority**: High
**Estimated Time**: 2-3 hours

---

### Phase 4: Separate Button Creation
- [ ] Create `content/button-creator.js` class
- [ ] Extract button creation logic from `content.js`
- [ ] Update `content.js` to use ButtonCreator
- [ ] Test button click functionality
- [ ] Test button hover animations
- [ ] Build and test button creator module

**Status**: Not Started
**Priority**: High
**Estimated Time**: 2-3 hours

---

### Phase 5: Refactor Popup to Class
- [ ] Create `popup/settings-manager.js` class
- [ ] Convert popup.js functions to class methods
- [ ] Setup encapsulated state management
- [ ] Test settings UI and persistence
- [ ] Update build script if needed
- [ ] Build and test class-based popup

**Status**: Not Started
**Priority**: Medium
**Estimated Time**: 2-3 hours

---

### Phase 6: Background Window Manager
- [ ] Create `background/window-manager.js` class
- [ ] Extract window creation logic from `background.js`
- [ ] Implement window tracking and cleanup
- [ ] Update `background.js` to use WindowManager
- [ ] Test window creation and positioning
- [ ] Test window cleanup on close
- [ ] Build and test window manager

**Status**: Not Started
**Priority**: Medium
**Estimated Time**: 2-3 hours

---

### Phase 7: Utilities & Error Handling
- [ ] Create `content/dom-utils.js` with DOM utility functions
- [ ] Extract `findButtonContainer()` from content.js
- [ ] Extract `extractVideoId()` from content.js
- [ ] Add `ensureRelativePosition()` utility
- [ ] Create `shared/error-handler.js` class
- [ ] Replace error handling across modules
- [ ] Update all files to use new utilities
- [ ] Build and test utilities and error handling

**Status**: Not Started
**Priority**: Low
**Estimated Time**: 1-2 hours

---

## Additional Tasks

### Modal System ✅ COMPLETED
- [x] Create `content/modal.js` with Modal class
- [x] Add modal styles to `content/content.css`
- [x] Replace native alerts with Modal in content.js
- [x] Test modal appearance and animations
- [x] Test modal auto-dismiss functionality
- [x] Test manual close (X button and click outside)

**Status**: Completed - Commit `87dfe43`
**Estimated Time**: 1-2 hours
**Actual Time**: ~45 minutes

---

### Translation to English ✅ COMPLETED
- [x] Translate `popup/popup.html` to English
- [x] Translate `popup/popup.js` messages to English
- [x] Translate `content/content.js` messages to English
- [x] Translate `manifest.json` description to English
- [x] Verify all text is in English
- [x] Test translated UI

**Status**: Completed - Commit `87dfe43`
**Estimated Time**: 1 hour
**Actual Time**: ~30 minutes

---

### Documentation
- [x] Create `REFACTORING_RECOMMENDATIONS.md` with detailed plan
- [x] Create `TRANSLATION_COMPLETE.md` with translation summary (TO BE MERGED INTO CHANGELOG)
- [x] Create `PHASE_1_COMPLETE.md` with Phase 1 details (TO BE MERGED INTO TASK_COMPLETED)
- [ ] Update README.md with refactoring progress
- [ ] Add inline documentation to new modules
- [ ] Create architecture diagram
- [ ] Document API interfaces

**Status**: Partially Complete

---

## Future Feature Ideas

These are potential features to add after refactoring is complete. Submit them as separate tasks when ready.

### Window Management
- [ ] Remember last window position and size
- [ ] Custom window dimensions setting
- [ ] Multiple floating windows support
- [ ] Window position presets (corners, center, etc.)
- [ ] Always on top toggle

### Button Customization
- [ ] Custom button color/gradient
- [ ] Button size options
- [ ] Show/hide button text (icon only option)
- [ ] Custom button position on thumbnail

### UI Enhancements
- [ ] Keyboard shortcuts
- [ ] Queue multiple videos
- [ ] Auto-play next video
- [ ] Volume control from floating window
- [ ] Full-screen mode in floating window

### YouTube Integration
- [ ] Hide/disable YouTube comments in floating window
- [ ] Custom start time parameter
- [ ] Loop video option
- [ ] Playback speed control
- [ ] Quality selection from floating window

### Analytics & Stats
- [ ] Track videos opened in floating windows
- [ ] Most opened videos statistics
- [ ] Time spent in floating windows
- [ ] Export settings

---

## Task Priority Legend

- 🔴 High Priority - Core refactoring phases
- 🟡 Medium Priority - Important improvements
- 🟢 Low Priority - Nice to have features
- ✅ Completed - Task finished
- ⏳ In Progress - Currently working on
- 📋 Not Started - Not yet started

---

## Estimated Total Time

### Refactoring Phases (1-7)
- **Estimated**: 10-16 hours
- **Completed**: 1-2 hours (Phase 1)
- **Remaining**: 8-14 hours

### Additional Tasks
- Modal System: ✅ Completed (~45 min)
- Translation: ✅ Completed (~30 min)
- Documentation: ⏳ In Progress

### Grand Total
- **Estimated**: 12-20 hours total
- **Completed**: ~2 hours
- **Remaining**: ~10-18 hours

---

## Notes

- Each phase should be committed separately
- Test thoroughly after each phase
- Build system handles imports automatically
- No changes to `scripts/build.mjs` needed for most phases
- All phases maintain backward compatibility
