/**
 * Yutu Labs - Floating Window Implementation
 * Opens YouTube videos in a small floating window without leaving the current page
 */

import { Modal } from './modal.js';

class YutuPiPManager {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    console.log('🚀 Yutu Labs: Initializing...');

    this.injectButtons();
    this.observe();
    this.setupCleanup();
  }

  /**
   * MutationObserver to detect when YouTube adds new video cards (SPA navigation)
   */
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

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Inject PiP buttons on all video thumbnails across different YouTube layouts
   */
  injectButtons() {
    // Selectors for different YouTube page types
    const selectors = [
      'ytd-rich-item-renderer',      // Home grid
      'ytd-grid-video-renderer',     // Grid views
      'ytd-compact-video-renderer',  // Sidebar
      'ytd-video-renderer'            // Search results
    ];

    const cards = document.querySelectorAll(selectors.join(','));

    cards.forEach(card => {
      // Skip if button already injected
      if (card.querySelector('.yutu-pip-btn')) return;

      // Find video link
      const link = card.querySelector('a[href*="/watch?v="]');
      if (!link) return;

      const videoId = this.getVideoId(link.href);
      if (!videoId) return;

      // Create PiP button
      const btn = this.createButton(videoId);

      // Find best container for button placement
      const container = this.findButtonContainer(card);
      if (container) {
        // Ensure relative positioning for absolute button
        const style = window.getComputedStyle(container);
        if (style.position === 'static') {
          container.style.position = 'relative';
        }
        container.appendChild(btn);
      }
    });
  }

  /**
   * Create play button element
   */
  createButton(videoId) {
    const btn = document.createElement('button');
    btn.className = 'yutu-pip-btn';
    btn.setAttribute('aria-label', 'Open in floating window');
    btn.title = 'Open in floating window';

    btn.innerHTML = `
      <svg height="12" viewBox="0 0 24 24" width="12" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <span>Open</span>
    `;

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openPiPPlayer(videoId);
    };

    return btn;
  }

  /**
   * Find best container for button placement based on card type
   */
  findButtonContainer(card) {
    return card.querySelector('#details') ||
           card.querySelector('.yt-lockup-metadata-view-model') ||
           card.querySelector('#meta') ||
           card.querySelector('ytd-thumbnail');
  }

  /**
   * Extract video ID from YouTube URL
   */
  getVideoId(url) {
    try {
      const u = new URL(url, window.location.origin);
      return u.searchParams.get('v');
    } catch(e) {
      console.error('Yutu Labs: Error parsing URL:', e);
      return null;
    }
  }

  /**
   * Open video in floating window using Chrome extension API
   * This bypasses popup blockers and allows precise window control
   */
  async openPiPPlayer(videoId) {
    console.log(`🎬 Requesting floating window for video: ${videoId}`);

    try {
      // Use retry logic for service worker idle state
      const response = await this.sendMessageWithRetry({
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

  /**
   * Send message to background script with retry logic
   * Handles service worker idle state automatically
   */
  async sendMessageWithRetry(message, maxRetries = 3, retryDelay = 500) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await chrome.runtime.sendMessage(message);

        // Check if response is undefined (channel may be closed)
        if (response === undefined) {
          if (chrome.runtime.lastError) {
            throw new Error(chrome.runtime.lastError.message || 'Unknown runtime error');
          }
          // Service worker didn't respond, retry
          throw new Error('No response from background script');
        }

        return response;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, error.message);

        // Don't retry on the last attempt
        if (attempt < maxRetries) {
          console.log(`🔄 Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 1.5; // Exponential backoff
        }
      }
    }

    // All retries failed
    throw lastError;
  }


  /**
   * Setup cleanup on page unload
   */
  setupCleanup() {
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Also listen to YouTube's SPA navigation
    window.addEventListener('yt-navigate-finish', () => {
      // Re-inject buttons after navigation
      setTimeout(() => this.injectButtons(), 500);
    });
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.yutuPiPManager = new YutuPiPManager();
  });
} else {
  window.yutuPiPManager = new YutuPiPManager();
}
