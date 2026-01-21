/**
 * Yutu Labs - Document Picture-in-Picture Implementation
 * Allows watching YouTube videos in a floating always-on-top window without leaving the current page
 */

class YutuPiPManager {
  constructor() {
    this.currentPiPWindow = null;
    this.observer = null;
    this.isSupported = 'documentPictureInPicture' in window;
    this.init();
  }

  init() {
    console.log('🚀 Yutu Labs: Initializing...');

    if (!this.isSupported) {
      console.warn('⚠️ Document Picture-in-Picture not supported. Chrome 116+ required.');
      return;
    }

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
   * Create PiP button element
   */
  createButton(videoId) {
    const btn = document.createElement('button');
    btn.className = 'yutu-pip-btn';
    btn.setAttribute('aria-label', 'Open in Picture-in-Picture');
    btn.title = 'Abrir en Picture-in-Picture';

    btn.innerHTML = `
      <svg height="12" viewBox="0 0 24 24" width="12" fill="currentColor">
        <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/>
      </svg>
      <span>PiP</span>
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
   * Open Picture-in-Picture window with YouTube player
   */
  async openPiPPlayer(videoId) {
    try {
      console.log(`🎬 Opening PiP for video: ${videoId}`);

      // Close existing PiP window if open
      if (this.currentPiPWindow && !this.currentPiPWindow.closed) {
        this.currentPiPWindow.close();
      }

      // Request PiP window with 16:9 aspect ratio
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 1280,
        height: 720,
        disallowReturnToOpener: false
      });

      this.currentPiPWindow = pipWindow;

      // Setup PiP window content
      this.setupPiPWindow(pipWindow, videoId);

      // Setup event listeners
      this.setupPiPEvents(pipWindow);

    } catch (error) {
      console.error('❌ Error opening PiP:', error);
      this.handlePiPError(error);
    }
  }

  /**
   * Setup PiP window content (styles + player)
   */
  setupPiPWindow(pipWindow, videoId) {
    // Add styles
    const style = pipWindow.document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background: #000;
        display: flex;
        flex-direction: column;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        overflow: hidden;
      }

      .pip-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }

      .pip-title {
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .pip-close {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s;
      }

      .pip-close:hover {
        background: rgba(255,255,255,0.3);
        transform: scale(1.05);
      }

      .pip-close:active {
        transform: scale(0.95);
      }

      .pip-player {
        flex: 1;
        position: relative;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      iframe {
        width: 100%;
        height: 100%;
        border: none;
      }

      .pip-loading {
        position: absolute;
        color: white;
        font-size: 14px;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `;
    pipWindow.document.head.appendChild(style);

    // Create header
    const header = pipWindow.document.createElement('div');
    header.className = 'pip-header';

    const title = pipWindow.document.createElement('div');
    title.className = 'pip-title';
    title.innerHTML = '<span>🚀</span><span>Yutu Labs Player</span>';

    const closeBtn = pipWindow.document.createElement('button');
    closeBtn.className = 'pip-close';
    closeBtn.textContent = '× Cerrar';
    closeBtn.onclick = () => pipWindow.close();

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create player container
    const playerContainer = pipWindow.document.createElement('div');
    playerContainer.className = 'pip-player';

    // Add loading indicator
    const loading = pipWindow.document.createElement('div');
    loading.className = 'pip-loading';
    loading.textContent = 'Cargando video...';
    playerContainer.appendChild(loading);

    // Create iframe with YouTube embed
    const iframe = pipWindow.document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    iframe.title = 'YouTube video player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;

    // Remove loading when iframe loads
    iframe.onload = () => {
      loading.remove();
    };

    playerContainer.appendChild(iframe);

    // Add to document
    pipWindow.document.body.appendChild(header);
    pipWindow.document.body.appendChild(playerContainer);
  }

  /**
   * Setup PiP window event listeners
   */
  setupPiPEvents(pipWindow) {
    // Handle window close
    pipWindow.addEventListener('pagehide', () => {
      console.log('📭 PiP window closed');
      this.currentPiPWindow = null;
    });

    // Handle unload
    pipWindow.addEventListener('unload', () => {
      this.currentPiPWindow = null;
    });
  }

  /**
   * Handle PiP errors with user-friendly messages
   */
  handlePiPError(error) {
    if (error.name === 'NotAllowedError') {
      alert('⚠️ Yutu Labs necesita permiso para abrir ventanas emergentes.\n\nPor favor, permite las ventanas emergentes en la configuración de Chrome.');
    } else if (error.name === 'InvalidStateError') {
      alert('⚠️ Ya hay una ventana Picture-in-Picture abierta.\n\nCierra la ventana actual primero.');
    } else {
      alert(`⚠️ Error al abrir el reproductor.\n\nVerifica que estás usando Chrome 116 o superior.\n\nError: ${error.message}`);
    }
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

    if (this.currentPiPWindow && !this.currentPiPWindow.closed) {
      this.currentPiPWindow.close();
      this.currentPiPWindow = null;
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
