/**
 * Yutu Labs - Messaging
 * Communication with the background service worker and playback control listener.
 */

import { Modal } from './modal.js';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 500;

/**
 * Send a message to the background script with retry + exponential backoff.
 * Handles service worker idle wake-up failures transparently.
 */
export async function sendMessageWithRetry(message) {
  let lastError = null;
  let delay = INITIAL_RETRY_DELAY;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
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

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5;
      }
    }
  }

  throw lastError;
}

/**
 * Request the background script to open a floating window for the given URL.
 * Shows user-facing error modals on failure.
 */
export async function openFloatingWindow(targetUrl) {
  try {
    const response = await sendMessageWithRetry({
      action: 'openFloatingWindow',
      targetUrl
    });

    if (!response.success) {
      const msg = response.error || 'Unknown error';
      if (msg.includes('popup') || msg.includes('blocked')) {
        Modal.showError(
          'Floating window was blocked. Go to chrome://settings/content/popups and allow popups for youtube.com.',
          6000
        );
      } else {
        Modal.showError(`Could not open floating window: ${msg}`);
      }
    }
  } catch {
    Modal.showError(
      'Could not connect to the extension. Try reloading the page or reinstalling Yutu Labs.'
    );
  }
}

/**
 * Resolve the best available <video> element on the page.
 * Tries YouTube's internal player API first, then falls back to the raw element.
 */
function resolveVideoElement() {
  const player = document.querySelector('#movie_player');
  if (player) {
    return { player, video: player.querySelector('video') || document.querySelector('video') };
  }
  return { player: null, video: document.querySelector('video') };
}

/**
 * Register a one-time message listener for playback speed get/set commands.
 * Called from the YouTube content script entry point.
 */
let listenerAttached = false;

export function attachPlaybackMessageListener() {
  if (listenerAttached) return;
  listenerAttached = true;

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'setPlaybackSpeed') {
      sendResponse(setPlaybackSpeed(request.speed));
      return true;
    }

    if (request.action === 'getPlaybackSpeed') {
      sendResponse(getPlaybackSpeed());
      return true;
    }

    return false;
  });
}

function setPlaybackSpeed(speed) {
  const { player, video } = resolveVideoElement();

  if (player?.setPlaybackRate) {
    try {
      player.setPlaybackRate(speed);
      return { success: true, speed, method: 'internal' };
    } catch {
      // Fall through to video element
    }
  }

  if (video) {
    video.playbackRate = speed;
    return { success: true, speed, method: 'direct' };
  }

  return { success: false, error: 'No player or video found' };
}

function getPlaybackSpeed() {
  const { player, video } = resolveVideoElement();

  if (player?.getPlaybackRate) {
    try {
      return { success: true, speed: player.getPlaybackRate() };
    } catch {
      // Fall through
    }
  }

  return { success: true, speed: video?.playbackRate || 1 };
}
