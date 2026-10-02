> **ARCHIVED**: 2026-10-01
> Refactor plan largely executed (content/ is now split into modules).

---

# Refactoring Recommendations

## Overview
Analysis of current codebase structure and recommendations for improving maintainability and scalability.

---

## Current Structure Analysis

### Files and Responsibilities

| File | Lines of Code | Primary Responsibility | Complexity |
|------|---------------|------------------------|------------|
| `content/content.js` | 191 | Button injection, window management | Medium |
| `popup/popup.js` | 155 | Settings management, UI handling | Low-Medium |
| `content/hider.js` | 177 | Element hiding logic | Medium |
| `background/background.js` | 107 | Window creation and tracking | Low |

**Total**: ~630 lines of JavaScript across 4 files

---

## Recommendations

### 1. 🎯 **High Priority: Separate Configuration Management**

**Problem**: Settings are duplicated between `popup.js` and `hider.js`

**Current Issues**:
```javascript
// Duplicated in both popup.js and hider.js
const DEFAULT_SETTINGS = {
  hideReels: false,
  hideSidebar: false,
  hideDescription: false,
  hideHeader: false
};
```

**Solution**: Create `content/config.js`

```javascript
// content/config.js
export const DEFAULT_SETTINGS = {
  hideReels: false,
  hideSidebar: false,
  hideDescription: false,
  hideHeader: false
};

export const STORAGE_KEY = 'yutuSettings';

export function loadSettings() {
  return chrome.storage.local.get(STORAGE_KEY).then(result =>
    result[STORAGE_KEY] || DEFAULT_SETTINGS
  );
}

export function saveSettings(settings) {
  return chrome.storage.local.set({ [STORAGE_KEY]: settings });
}
```

**Benefits**:
- Single source of truth for configuration
- Easier to add new settings
- Type consistency across modules

---

### 2. 🎯 **High Priority: Separate YouTube DOM Selectors**

**Problem**: Selectors scattered across files, hard to maintain when YouTube changes UI

**Current Issues**:
```javascript
// In content.js - video card selectors
const selectors = [
  'ytd-rich-item-renderer',
  'ytd-grid-video-renderer',
  'ytd-compact-video-renderer',
  'ytd-video-renderer'
];

// In hider.js - hide element selectors
const SELECTORS = {
  reels: 'ytd-reel-shelf-renderer',
  sidebar: 'yt-lockup-view-model',
  description: '#description',
  header: 'ytd-masthead'
};
```

**Solution**: Create `content/selectors.js`

```javascript
// content/selectors.js
export const VIDEO_CARD_SELECTORS = [
  'ytd-rich-item-renderer',      // Home grid
  'ytd-grid-video-renderer',     // Grid views
  'ytd-compact-video-renderer',  // Sidebar
  'ytd-video-renderer'            // Search results
];

export const HIDE_ELEMENT_SELECTORS = {
  reels: 'ytd-reel-shelf-renderer',
  sidebar: 'yt-lockup-view-model',
  description: '#description',
  header: 'ytd-masthead'
};

export const BUTTON_CONTAINER_SELECTORS = [
  '#details',
  '.yt-lockup-metadata-view-model',
  '#meta',
  'ytd-thumbnail'
];
```

**Benefits**:
- Centralized selector management
- Easy updates when YouTube changes UI
- Documented purpose of each selector

---

### 3. 🎯 **High Priority: Separate Button Creation Logic**

**Problem**: `YutuPiPManager` class has multiple responsibilities (injection, button creation, window management)

**Current Issues**:
- `YutuPiPManager` is 191 lines with 8 methods
- Mixes DOM manipulation with business logic
- Hard to test button creation in isolation

**Solution**: Create `content/button-creator.js`

```javascript
// content/button-creator.js
import { BUTTON_LABELS } from './constants.js';

export class ButtonCreator {
  createOpenButton(videoId, onClick) {
    const btn = document.createElement('button');
    btn.className = 'yutu-pip-btn';
    btn.setAttribute('aria-label', BUTTON_LABELS.aria);
    btn.title = BUTTON_LABELS.title;

    btn.innerHTML = `
      <svg height="12" viewBox="0 0 24 24" width="12" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <span>${BUTTON_LABELS.text}</span>
    `;

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(videoId);
    };

    return btn;
  }
}
```

And create `content/constants.js`:

```javascript
// content/constants.js
export const BUTTON_LABELS = {
  aria: 'Open in floating window',
  title: 'Open in floating window',
  text: 'Open'
};

export const WINDOW_DIMENSIONS = {
  width: 854,
  height: 480,
  margin: 20
};
```

**Benefits**:
- Separation of concerns
- Easier to test
- Centralized labels for localization

---

### 4. 🎯 **Medium Priority: Extract Window Management to Background**

**Problem**: Content script handles both button injection AND window opening logic

**Current Issues**:
- Content script sends message to background to open window
- Background handles window creation (good)
- But content script has error handling and retry logic

**Solution**: Move window-related logic to `background/window-manager.js`

```javascript
// background/window-manager.js
export class WindowManager {
  constructor() {
    this.currentWindowId = null;
  }

  async openFloatingWindow(videoId) {
    // Close existing window
    if (this.currentWindowId) {
      await this.closeWindow(this.currentWindowId);
    }

    // Create new window
    const windowId = await this.createNewWindow(videoId);
    this.currentWindowId = windowId;

    return windowId;
  }

  async closeWindow(windowId) {
    try {
      await chrome.windows.remove(windowId);
    } catch (error) {
      console.log('Window already closed:', error);
    }
  }

  async createNewWindow(videoId) {
    const { width, height, left, top } = this.calculatePosition();

    const window = await chrome.windows.create({
      url: `https://www.youtube.com/watch?v=${videoId}&autoplay=1&yutu_popup=true`,
      type: 'popup',
      width,
      height,
      left,
      top,
      focused: true
    });

    return window.id;
  }

  calculatePosition() {
    // Position logic...
  }
}
```

**Benefits**:
- Clear separation: background = window, content = injection
- Easier to add window management features (positioning, sizing)
- Better testability

---

### 5. 🎯 **Medium Priority: Create Utility Module for DOM Operations**

**Problem**: DOM helper functions scattered across files

**Current Issues**:
- `findButtonContainer()` in content.js
- `getVideoId()` in content.js
- Similar patterns repeated in hider.js

**Solution**: Create `content/dom-utils.js`

```javascript
// content/dom-utils.js
export function findButtonContainer(card) {
  return card.querySelector('#details') ||
         card.querySelector('.yt-lockup-metadata-view-model') ||
         card.querySelector('#meta') ||
         card.querySelector('ytd-thumbnail');
}

export function extractVideoId(url) {
  try {
    const u = new URL(url, window.location.origin);
    return u.searchParams.get('v');
  } catch (error) {
    console.error('Yutu Labs: Error parsing URL:', error);
    return null;
  }
}

export function ensureRelativePosition(element) {
  const style = window.getComputedStyle(element);
  if (style.position === 'static') {
    element.style.position = 'relative';
  }
}
```

**Benefits**:
- Reusable DOM utilities
- Consistent error handling
- Easier to mock for testing

---

### 6. 🎯 **Medium Priority: Refactor Popup into Class-Based Structure**

**Problem**: `popup.js` uses functions instead of a cohesive class

**Current Issues**:
- Global variables for DOM elements
- Functions scattered, no clear organization
- Hard to maintain state

**Solution**: Convert to class-based structure

```javascript
// popup/settings-manager.js
import { loadSettings as loadConfig, saveSettings as saveConfig } from '../content/config.js';

export class SettingsManager {
  constructor() {
    this.elements = this.getElements();
    this.settings = {};
    this.autoSaveTimeout = null;
  }

  getElements() {
    return {
      hideReels: document.getElementById('hide-reels'),
      hideSidebar: document.getElementById('hide-sidebar'),
      hideDescription: document.getElementById('hide-description'),
      hideHeader: document.getElementById('hide-header'),
      saveBtn: document.getElementById('save-btn'),
      saveStatus: document.getElementById('save-status')
    };
  }

  async load() {
    this.settings = await loadConfig();
    this.updateCheckboxes();
  }

  async save() {
    this.settings = this.getSettingsFromUI();
    await saveConfig(this.settings);
    this.showSaveStatus('✓ Changes saved', 'success');
    this.notifyTabs();
  }

  setupAutoSave() {
    const checkboxes = Object.values(this.elements).filter(el => el?.type === 'checkbox');

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => this.save(), 500);
      });
    });
  }

  // ... rest of methods
}
```

**Benefits**:
- Encapsulated state management
- Clearer API
- Easier to extend with new features

---

### 7. 🎯 **Low Priority: Add Error Handling Module**

**Problem**: Error handling inconsistent across files

**Current Issues**:
- Different error message formats
- No centralized error logging
- Hard to track extension errors

**Solution**: Create `shared/error-handler.js`

```javascript
// shared/error-handler.js
export class ErrorHandler {
  static logError(component, error, context = {}) {
    console.error(`❌ Yutu Labs [${component}]:`, error, context);
  }

  static showUserError(message, details = null) {
    const fullMessage = details ? `${message}: ${details}` : message;
    alert(`⚠️ ${fullMessage}`);
  }

  static wrapAsync(component, fn) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.logError(component, error, { args });
        throw error;
      }
    };
  }
}
```

**Benefits**:
- Consistent error handling
- Better debugging
- User-friendly error messages

---

## Proposed New File Structure

```
labs-yutu/
├── background/
│   ├── background.js          # Entry point, handles messages
│   └── window-manager.js      # Window creation and management
│
├── content/
│   ├── content.js             # Main entry, orchestrates modules
│   ├── hider.js               # Element hiding logic
│   ├── config.js              # ⭐ NEW: Configuration management
│   ├── constants.js           # ⭐ NEW: Constants (labels, dimensions)
│   ├── selectors.js           # ⭐ NEW: YouTube DOM selectors
│   ├── button-creator.js      # ⭐ NEW: Button creation logic
│   ├── dom-utils.js           # ⭐ NEW: DOM utility functions
│   └── content.css
│
├── popup/
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js               # Entry point
│   └── settings-manager.js    # ⭐ NEW: Settings management class
│
├── shared/
│   └── error-handler.js       # ⭐ NEW: Error handling utilities
│
└── scripts/
    └── build.mjs              # ⚠️ UPDATE: Include new files in build
```

---

## Migration Strategy

### Phase 1: Extract Configuration (Quick Win)
1. Create `content/config.js`
2. Update `popup.js` and `hider.js` to import from config
3. Test that settings still work
4. **Estimated time**: 1-2 hours

### Phase 2: Extract Selectors & Constants
1. Create `content/selectors.js`
2. Create `content/constants.js`
3. Update all files to use imported selectors
4. Test button injection and element hiding
5. **Estimated time**: 2-3 hours

### Phase 3: Separate Button Creation
1. Create `content/button-creator.js`
2. Refactor `content.js` to use ButtonCreator
3. Test button click and window opening
4. **Estimated time**: 2-3 hours

### Phase 4: Refactor Popup to Class
1. Create `popup/settings-manager.js`
2. Update `popup.js` to use class
3. Test settings UI and persistence
4. **Estimated time**: 2-3 hours

### Phase 5: Background Window Manager
1. Create `background/window-manager.js`
2. Refactor `background.js` to use class
3. Test window creation and cleanup
4. **Estimated time**: 2-3 hours

### Phase 6: Utilities & Error Handling
1. Create `content/dom-utils.js`
2. Create `shared/error-handler.js`
3. Update files to use utilities
4. Test error scenarios
5. **Estimated time**: 1-2 hours

**Total Estimated Time**: 10-16 hours

---

## Benefits of Refactoring

### Immediate Benefits
- ✅ Easier to add new features
- ✅ Better code organization
- ✅ Reduced code duplication
- ✅ Easier debugging

### Long-term Benefits
- ✅ Better testability (can unit test individual modules)
- ✅ Easier onboarding for new developers
- ✅ Scalability for complex features
- ✅ Reduced maintenance overhead

### Specific to Your Use Case
Based on your comment "para poder decirte otras features que quiero agregar", this refactoring will:

1. **Make feature addition faster**: Instead of modifying large files, you add small focused modules
2. **Clearer extension points**: You'll know exactly where to add new features
3. **Better separation**: Can add features without breaking existing code
4. **Easier to test**: Can test new features in isolation

---

---

## Additional Tasks Requested

### Replace Native Alerts with Custom Modal System

**Current Issue**: Native JavaScript alerts (`alert()`) are intrusive and don't match the extension's design.

**Current Alerts in content.js**:
```javascript
alert(`⚠️ Error creating window: ${response.error}`);
alert('⚠️ Communication error with extension. Please reload the extension and try again.');
```

**Solution**: Create custom modal system

#### 1. Create `content/modal.js`

```javascript
// content/modal.js
export class Modal {
  static show(options) {
    const {
      title = 'Yutu Labs',
      message,
      type = 'info', // 'info', 'error', 'success'
      duration = 3000
    } = options;

    // Remove existing modal if any
    this.hide();

    // Create modal container
    const modal = document.createElement('div');
    modal.className = `yutu-modal yutu-modal--${type}`;

    const icon = this.getIcon(type);

    modal.innerHTML = `
      <div class="yutu-modal__content">
        <div class="yutu-modal__icon">${icon}</div>
        <div class="yutu-modal__text">
          <div class="yutu-modal__title">${title}</div>
          <div class="yutu-modal__message">${message}</div>
        </div>
        <button class="yutu-modal__close" aria-label="Close">×</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('yutu-modal--visible');
    });

    // Setup close handlers
    const closeBtn = modal.querySelector('.yutu-modal__close');
    closeBtn.onclick = () => this.hide();

    // Auto-hide after duration
    if (duration > 0) {
      this.hideTimeout = setTimeout(() => this.hide(), duration);
    }

    return modal;
  }

  static hide() {
    const existingModal = document.querySelector('.yutu-modal');
    if (existingModal) {
      existingModal.classList.remove('yutu-modal--visible');
      setTimeout(() => existingModal.remove(), 300);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  static getIcon(type) {
    const icons = {
      error: '⚠️',
      success: '✓',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  static showError(message, duration = 4000) {
    return this.show({
      title: 'Error',
      message,
      type: 'error',
      duration
    });
  }

  static showSuccess(message, duration = 2000) {
    return this.show({
      title: 'Success',
      message,
      type: 'success',
      duration
    });
  }

  static showInfo(message, duration = 3000) {
    return this.show({
      title: 'Info',
      message,
      type: 'info',
      duration
    });
  }
}
```

#### 2. Add CSS to `content/content.css`

```css
/* Custom Modal Styles */
.yutu-modal {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  opacity: 0;
  transform: translateX(100%);
  transition: opacity 0.3s ease, transform 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.yutu-modal--visible {
  opacity: 1;
  transform: translateX(0);
}

.yutu-modal__content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.yutu-modal__icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.yutu-modal--error .yutu-modal__icon {
  color: #ff0000;
}

.yutu-modal--success .yutu-modal__icon {
  color: #00aa00;
}

.yutu-modal--info .yutu-modal__icon {
  color: #0066cc;
}

.yutu-modal__text {
  flex: 1;
  min-width: 0;
}

.yutu-modal__title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}

.yutu-modal__message {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.yutu-modal__close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.yutu-modal__close:hover {
  background: #f0f0f0;
  color: #333;
}
```

#### 3. Update `content/content.js` to use Modal

```javascript
import { Modal } from './modal.js';

class YutuPiPManager {
  // ... existing code ...

  async openPiPPlayer(videoId) {
    console.log(`🎬 Requesting floating window for video: ${videoId}`);

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'openFloatingWindow',
        videoId: videoId
      });

      if (response.success) {
        console.log('✅ Floating window created successfully:', response.windowId);
      } else {
        console.error('❌ Failed to create floating window:', response.error);
        Modal.showError(`Error creating window: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ Communication error with background script:', error);
      Modal.showError('Communication error with extension. Please reload the extension and try again.');
    }
  }
}
```

**Benefits**:
- ✅ Better UX - non-intrusive, auto-dismissing
- ✅ Consistent design - matches extension style
- ✅ No browser blocking - alerts can be blocked by popup blockers
- ✅ More informative - can show icons and structured messages
- ✅ Better mobile support - native alerts vary across browsers

**Estimated Time**: 1-2 hours

---

## Next Steps

1. **Start with Phase 1** (Configuration extraction) - quick win with minimal risk
2. **Replace native alerts** with custom modal system - improves UX
3. **Review and approve** this plan
4. **Implement incrementally** - one phase at a time with testing
5. **Update build script** to include new files in bundling

Would you like me to start implementing any of these phases?
