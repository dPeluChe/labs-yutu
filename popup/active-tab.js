// Yush - Active tab lookup shared by the popup modules

/** The focused tab of the current window when it is on YouTube, otherwise null. */
export async function getActiveYouTubeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url?.includes('youtube.com') ? tab : null;
}
