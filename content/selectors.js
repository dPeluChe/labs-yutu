/**
 * Yush - DOM Selectors
 * Centralized CSS selectors for YouTube and Google DOM structures.
 * Update these when YouTube/Google change their markup.
 */

/** YouTube video card component selectors (Home, Search, Sidebar, Shorts) */
export const CARD_SELECTORS = [
  'ytd-rich-item-renderer',
  'ytd-grid-video-renderer',
  'ytd-compact-video-renderer',
  'ytd-video-renderer',
  'yt-lockup-view-model'
];

/** Link patterns that point to a playable video inside a card */
export const VIDEO_LINK_SELECTOR = 'a[href*="/watch"], a[href*="youtu.be/"], a[href*="/shorts/"]';

/** Link patterns for YouTube/Vimeo across any website */
export const EXTERNAL_LINK_SELECTOR =
  'a[href*="youtube.com/watch"], a[href*="youtube.com/shorts/"], a[href*="youtu.be/"], a[href*="vimeo.com/"]';

/** Google SERP context wrappers — used to scope injection to search results only */
export const GOOGLE_CONTEXT_SELECTOR = '[jscontroller="rTuANe"], .WVV5ke, .g, .MjjYud, #search';

/** YouTube element-hider selectors, one list per setting (used by hide-rules.js) */
export const HIDER_SELECTORS = {
  reels: ['ytd-reel-shelf-renderer'],
  sidebar: [
    '#secondary',
    '#secondary-inner',
    '#related',
    '#panels',
    'ytd-watch-next-secondary-results-renderer',
    'ytd-watch-flexy #secondary ytd-engagement-panel-section-list-renderer',
    'ytd-watch-flexy #secondary yt-lockup-view-model'
  ],
  description: [
    '#bottom-row',
    'ytd-watch-metadata #description',
    'ytd-watch-metadata #description-inner',
    'ytd-watch-metadata #description-inline-expander',
    'ytd-watch-metadata #structured-description',
    'ytd-watch-metadata #description-wrapper',
    'ytd-watch-metadata ytd-structured-description-content-renderer',
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-structured-description"]'
  ],
  header: ['ytd-masthead'],
  actions: [
    'segmented-like-dislike-button-view-model',
    'ytd-menu-renderer yt-button-shape#button-shape'
  ],
  merch: ['ytd-merch-shelf-renderer', '#merch-shelf', '#below ytd-merch-shelf-renderer']
};

/** Home Shorts shelf: whole section/shelf (and stray items) that contain a Shorts lockup */
const SHORTS_LOCKUP = 'ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2';
export const HOME_SHORTS_SELECTORS = [
  'ytd-rich-section-renderer',
  'ytd-rich-shelf-renderer',
  'ytd-rich-item-renderer'
].map((tag) => `${tag}:has(${SHORTS_LOCKUP})`);
