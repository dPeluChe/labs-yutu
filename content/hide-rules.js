/**
 * Yush - Hide rules
 * Builds the CSS that hides YouTube elements from a set of hide flags.
 */

import { HIDER_SELECTORS, HOME_SHORTS_SELECTORS } from './selectors.js';

export const HIDE_OPTIONS = [
  { key: 'hideReels', selectors: 'reels', title: 'Reels / Shorts', description: 'Hide short videos section' },
  { key: 'hideSidebar', selectors: 'sidebar', title: 'Related videos', description: 'Hide recommendations sidebar' },
  { key: 'hideDescription', selectors: 'description', title: 'Description', description: 'Hide video description' },
  { key: 'hideHeader', selectors: 'header', title: 'Header', description: 'Hide top navigation bar' },
  { key: 'hideActions', selectors: 'actions', title: 'Like/More actions', description: 'Hide like-dislike and more-actions buttons' },
  { key: 'hideMerchShelf', selectors: 'merch', title: 'Merch shelf', description: 'Hide products/store section below video' }
];

const hideRule = (selectors, scope) =>
  `${selectors.map((s) => (scope ? `${scope} ${s}` : s)).join(', ')} { display: none !important; }`;

/**
 * @param {Record<string, boolean>} flags hide flags (hideReels, hideSidebar, ...)
 * @param {string} scope optional selector prefix, e.g. `html[data-yutu-watch]`
 */
export function buildHideCss(flags, scope = '') {
  return HIDE_OPTIONS
    .filter((option) => flags?.[option.key])
    .map((option) => hideRule(HIDER_SELECTORS[option.selectors], scope))
    .join('\n');
}

/** Hides the Shorts shelf on Home; `scope` limits it to the Home page (`html[data-yutu-home]`). */
export function buildHomeShortsCss(enabled, scope = '') {
  return enabled ? hideRule(HOME_SHORTS_SELECTORS, scope) : '';
}
