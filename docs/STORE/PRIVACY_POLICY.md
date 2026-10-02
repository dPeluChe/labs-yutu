# Privacy Policy - Yutu Labs

**Last updated:** October 2, 2026

## Overview

Yutu Labs is a Chrome extension that opens YouTube and Vimeo videos in floating windows, with playback speed controls. This policy explains how the extension handles user data.

## Data Collection

**Yutu Labs does not collect, store, or transmit any personal data.**

The extension does not:
- Track browsing history or activity
- Collect analytics or usage metrics
- Send data to external servers
- Use cookies or tracking technologies
- Access or store account credentials
- Share any data with third parties

## Local Storage

The extension uses `chrome.storage.local` only to save your preferences: which elements to hide in the floating window and on watch pages, the old-video filter options, the "close on finish" option, the custom button selector, and the list of extra websites you chose to enable. This data:
- Never leaves your device
- Is stored entirely within Chrome's local extension storage
- Is deleted when you uninstall the extension
- Can be cleared at any time via Chrome's extension settings

The extension also keeps the id of the open floating window in `chrome.storage.session`, which Chrome clears when the browser closes.

## Permissions Explained

| Permission | Why it's needed |
|------------|----------------|
| `storage` | Save your preferences locally |
| `system.display` | Position the floating window in the corner of your screen |
| `scripting` | Register the content script on the extra websites you enable |
| Host: `*.youtube.com` | Add buttons on YouTube pages and control playback speed |
| Host: `*.google.com` | Detect YouTube links in Google search results |
| Optional hosts | Requested one site at a time, only when you add a website in the popup. You can remove it at any time |

## Content Scripts

The extension injects content scripts on YouTube, Google, and only the extra websites you enable, in order to:
- Add an "Open" button on video thumbnails
- Add a "View" button next to YouTube/Vimeo links
- Control playback speed in floating windows
- Apply your visual preferences (hidden elements, dimmed old videos on Home)

These scripts run locally in your browser and do not communicate with any external service.

## Third-Party Services

Yutu Labs does not use any third-party services, APIs, or analytics platforms. The only external communication is between your browser and YouTube/Vimeo when you open a video (standard browser behavior).

## Children's Privacy

Yutu Labs does not knowingly collect any data from users of any age, as it does not collect data at all.

## Changes to This Policy

If this policy changes, the updated version will be published in the extension's repository and the "Last updated" date will be revised.

## Contact

For questions or concerns about this privacy policy, please open an issue at https://github.com/dPeluChe/labs-yutu/issues.
