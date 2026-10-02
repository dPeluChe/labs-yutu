/**
 * Yush - URL Utilities
 * Detection and parsing of YouTube/Vimeo video URLs.
 */

export const isHomePath = () => window.location.pathname === '/';
export const isWatchPath = () => window.location.pathname === '/watch';

export function isYouTubeUrl(parsedUrl) {
  return parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname === 'youtu.be';
}

export function isVimeoUrl(parsedUrl) {
  return parsedUrl.hostname.includes('vimeo.com');
}

/**
 * Extract YouTube video ID from a parsed URL.
 * Supports /watch?v=, /shorts/, /embed/, and youtu.be/ formats.
 */
export function getYouTubeVideoId(parsedUrl) {
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
}

/**
 * Extract Vimeo video ID (first numeric path segment).
 */
export function getVimeoVideoId(parsedUrl) {
  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
  return pathParts.find((part) => /^\d+$/.test(part)) || null;
}

/**
 * Parse any supported video URL into a normalized target object.
 * Returns null if the URL is not a recognized video provider.
 */
export function extractVideoTarget(url) {
  try {
    const parsedUrl = new URL(url, window.location.origin);

    if (isYouTubeUrl(parsedUrl)) {
      const videoId = getYouTubeVideoId(parsedUrl);
      if (!videoId) return null;
      return {
        provider: 'youtube',
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    }

    if (isVimeoUrl(parsedUrl)) {
      const videoId = getVimeoVideoId(parsedUrl);
      if (!videoId) return null;
      return {
        provider: 'vimeo',
        videoId,
        url: `https://vimeo.com/${videoId}`
      };
    }

    return null;
  } catch {
    return null;
  }
}
