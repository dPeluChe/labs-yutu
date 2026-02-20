/**
 * Yutu Labs - Shared floating window logic
 */

import { Modal } from './modal.js';

export class YutuPiPManager {
  constructor(options = {}) {
    this.observer = null;
    this.injectTimer = null;
    this.injectDebounceMs = options.injectDebounceMs ?? 150;
    this.enableYouTubeCards = options.enableYouTubeCards ?? false;
    this.enableExternalLinks = options.enableExternalLinks ?? false;
    this.externalScope = options.externalScope ?? 'all';
  }

  init() {
    console.log('🚀 Yutu Labs: Initializing manager...');

    this.injectButtons();
    this.observe();
    this.setupCleanup();
  }

  observe() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          this.scheduleInject();
          return;
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scheduleInject() {
    if (this.injectTimer) {
      clearTimeout(this.injectTimer);
    }

    this.injectTimer = setTimeout(() => {
      this.injectButtons();
      this.injectTimer = null;
    }, this.injectDebounceMs);
  }

  injectButtons() {
    if (this.enableYouTubeCards) {
      this.injectYouTubeCardButtons();
    }

    if (this.enableExternalLinks) {
      this.injectExternalVideoLinkButtons();
    }
  }

  injectYouTubeCardButtons() {
    const selectors = [
      'ytd-rich-item-renderer',
      'ytd-grid-video-renderer',
      'ytd-compact-video-renderer',
      'ytd-video-renderer'
    ];

    const cards = document.querySelectorAll(selectors.join(','));

    cards.forEach((card) => {
      if (card.querySelector('.yutu-pip-btn')) return;

      const link = card.querySelector('a[href*="/watch"], a[href*="youtu.be/"], a[href*="/shorts/"]');
      if (!link) return;

      const target = this.extractVideoTarget(link.href);
      if (!target) return;

      const container = this.findButtonContainer(card);
      if (!container) return;

      const btn = this.createCardButton(target.url, {
        offsetLeftForMenu: container.classList.contains('yt-lockup-metadata-view-model')
      });

      const style = window.getComputedStyle(container);
      if (style.position === 'static') {
        container.style.position = 'relative';
      }

      container.appendChild(btn);
    });
  }

  injectExternalVideoLinkButtons() {
    const links = document.querySelectorAll(
      'a[href*="youtube.com/watch"], a[href*="youtube.com/shorts/"], a[href*="youtu.be/"], a[href*="vimeo.com/"]'
    );

    links.forEach((link) => {
      if (link.dataset.yutuInlineInjected === '1') return;

      if (!this.shouldInjectExternalForCurrentScope(link)) {
        return;
      }

      const target = this.extractVideoTarget(link.href);
      if (!target) return;

      const resultCard = link.closest('[jscontroller="rTuANe"], .WVV5ke');
      if (resultCard && resultCard.querySelector('.yutu-inline-open-btn')) {
        link.dataset.yutuInlineInjected = '1';
        return;
      }

      if (link.closest('ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-video-renderer')) {
        return;
      }

      link.dataset.yutuInlineInjected = '1';

      const btn = this.createInlineButton(target.url);
      const injectionAnchor = this.getExternalInjectionAnchor(link);
      injectionAnchor.insertAdjacentElement('afterend', btn);
    });
  }

  shouldInjectExternalForCurrentScope(link) {
    if (this.externalScope === 'google') {
      return this.isGoogleLinkContext(link);
    }

    return true;
  }

  isGoogleLinkContext(link) {
    return Boolean(link.closest('[jscontroller="rTuANe"], .WVV5ke, .g, .MjjYud, #search'));
  }

  getExternalInjectionAnchor(link) {
    const rotatedWrapper = link.closest('.V9tjod');
    if (rotatedWrapper) {
      return rotatedWrapper;
    }

    return link;
  }

  createCardButton(targetUrl, options = {}) {
    const btn = document.createElement('button');
    btn.className = 'yutu-pip-btn';
    if (options.offsetLeftForMenu) {
      btn.classList.add('yutu-pip-btn--offset-menu');
    }

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
      this.openPiPUrl(targetUrl);
    };

    return btn;
  }

  createInlineButton(targetUrl) {
    const btn = document.createElement('button');
    btn.className = 'yutu-inline-open-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open video in floating window');
    btn.title = 'Open in floating window';
    btn.textContent = 'View';

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openPiPUrl(targetUrl);
    };

    return btn;
  }

  findButtonContainer(card) {
    return card.querySelector('#details') ||
      card.querySelector('.yt-lockup-metadata-view-model') ||
      card.querySelector('#meta') ||
      card.querySelector('ytd-thumbnail');
  }

  extractVideoTarget(url) {
    try {
      const parsedUrl = new URL(url, window.location.origin);

      if (this.isYouTubeUrl(parsedUrl)) {
        const videoId = this.getVideoId(parsedUrl.href);
        if (!videoId) return null;

        return {
          provider: 'youtube',
          videoId,
          url: this.formatYouTubeWatchUrl(videoId)
        };
      }

      if (this.isVimeoUrl(parsedUrl)) {
        const videoId = this.getVimeoId(parsedUrl);
        if (!videoId) return null;

        return {
          provider: 'vimeo',
          videoId,
          url: `https://vimeo.com/${videoId}`
        };
      }

      return null;
    } catch (e) {
      console.error('Yutu Labs: Error parsing video URL:', e);
      return null;
    }
  }

  isYouTubeUrl(parsedUrl) {
    return parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname === 'youtu.be';
  }

  isVimeoUrl(parsedUrl) {
    return parsedUrl.hostname.includes('vimeo.com');
  }

  getVideoId(url) {
    try {
      const parsedUrl = new URL(url, window.location.origin);
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

      if (parsedUrl.hostname === 'youtu.be' && pathParts.length > 0) {
        return pathParts[0];
      }

      if (pathParts[0] === 'shorts' && pathParts[1]) {
        return pathParts[1];
      }

      if (pathParts[0] === 'embed' && pathParts[1]) {
        return pathParts[1];
      }

      return parsedUrl.searchParams.get('v');
    } catch (e) {
      console.error('Yutu Labs: Error parsing URL:', e);
      return null;
    }
  }

  getVimeoId(parsedUrl) {
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const numericPart = pathParts.find((part) => /^\d+$/.test(part));
    return numericPart || null;
  }

  formatYouTubeWatchUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  async openPiPUrl(targetUrl) {
    console.log(`🎬 Requesting floating window for URL: ${targetUrl}`);

    try {
      const response = await this.sendMessageWithRetry({
        action: 'openFloatingWindow',
        targetUrl
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

  async sendMessageWithRetry(message, maxRetries = 3, retryDelay = 500) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await chrome.runtime.sendMessage(message);

        if (response === undefined) {
          if (chrome.runtime.lastError) {
            throw new Error(chrome.runtime.lastError.message || 'Unknown runtime error');
          }
          throw new Error('No response from background script');
        }

        return response;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, error.message);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retryDelay *= 1.5;
        }
      }
    }

    throw lastError;
  }

  setupCleanup() {
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.injectTimer) {
      clearTimeout(this.injectTimer);
      this.injectTimer = null;
    }
  }
}

let youtubeMessageListenerAttached = false;

export function attachYouTubePlaybackMessageListener() {
  if (youtubeMessageListenerAttached) return;
  youtubeMessageListenerAttached = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setPlaybackSpeed') {
      const speed = request.speed;
      const player = document.querySelector('#movie_player');

      if (player && player.setPlaybackRate) {
        try {
          player.setPlaybackRate(speed);
          sendResponse({ success: true, speed, method: 'internal' });
        } catch (error) {
          const video = player.querySelector('video');
          if (video) {
            video.playbackRate = speed;
            sendResponse({ success: true, speed, method: 'video-element' });
          } else {
            sendResponse({ success: false, error: 'Video element not found' });
          }
        }
      } else {
        const video = document.querySelector('video');
        if (video) {
          video.playbackRate = speed;
          sendResponse({ success: true, speed, method: 'direct' });
        } else {
          sendResponse({ success: false, error: 'No player or video found' });
        }
      }

      return true;
    }

    if (request.action === 'getPlaybackSpeed') {
      const player = document.querySelector('#movie_player');

      if (player && player.getPlaybackRate) {
        try {
          const speed = player.getPlaybackRate();
          sendResponse({ success: true, speed });
        } catch (error) {
          const video = player.querySelector('video');
          if (video) {
            sendResponse({ success: true, speed: video.playbackRate });
          } else {
            const videoDirect = document.querySelector('video');
            sendResponse({ success: true, speed: videoDirect?.playbackRate || 1 });
          }
        }
      } else {
        const video = document.querySelector('video');
        sendResponse({ success: true, speed: video?.playbackRate || 1 });
      }

      return true;
    }

    return false;
  });
}
