/**
 * Yutu Labs - Speed controls anchor lookup
 * Finds where the speed widget mounts for popup windows, watch pages and Shorts.
 */

export const POPUP_ROW_SLOT_ID = 'yutu-popup-speed-slot';

export function getControlsAnchor(isPopupWindow) {
  if (isPopupWindow) {
    const topRow = document.querySelector('ytd-watch-metadata #top-row');
    if (topRow) {
      let slot = document.getElementById(POPUP_ROW_SLOT_ID);
      if (!slot || slot.parentElement !== topRow) {
        slot = document.createElement('div');
        slot.id = POPUP_ROW_SLOT_ID;
        slot.className = 'yutu-popup-speed-slot item style-scope ytd-watch-metadata';

        const actionsItem = topRow.querySelector(':scope > #actions');
        if (actionsItem) {
          topRow.insertBefore(slot, actionsItem);
        } else {
          topRow.appendChild(slot);
        }
      }
      return slot;
    }
  }

  // Only mount speed controls on watch and shorts pages (not home/browse/search)
  const isWatchPage = location.pathname === '/watch';
  const isShortsPage = location.pathname.startsWith('/shorts/');
  if (!isWatchPage && !isShortsPage) return null;

  // Shorts player: place controls near the player controls at the bottom
  if (isShortsPage) {
    return document.querySelector('ytd-shorts-player-controls #right-controls') ||
      document.querySelector('ytd-shorts-player-controls') ||
      document.querySelector('ytd-reel-video-renderer .player-controls');
  }

  // Prefer metadata area below the video (where Share/Save buttons live)
  const metadataAnchor =
    document.querySelector('ytd-watch-metadata ytd-menu-renderer') ||
    document.querySelector('ytd-watch-flexy #menu ytd-menu-renderer') ||
    document.querySelector('ytd-watch-metadata ytd-menu-renderer #top-level-buttons-computed') ||
    document.querySelector('ytd-watch-flexy #menu ytd-menu-renderer #top-level-buttons-computed');

  if (metadataAnchor) return metadataAnchor;

  // Only fall back to player container on regular pages (not popup windows)
  // to avoid overlaying controls on the video in the compact popup layout.
  if (isPopupWindow) return null;

  return document.querySelector('#movie_player') ||
    document.querySelector('.html5-video-player') ||
    document.querySelector('#player');
}
