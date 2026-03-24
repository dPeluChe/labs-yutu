# Privacy Policy - Yutu Labs

**Last updated:** March 24, 2026

## Overview

Yutu Labs is a Chrome extension that opens YouTube videos in floating windows with playback speed controls. This policy explains how the extension handles user data.

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

The extension uses `chrome.storage.local` exclusively to save your preferences (such as hide/show settings and playback speed options). This data:
- Never leaves your device
- Is stored entirely within Chrome's local extension storage
- Is deleted when you uninstall the extension
- Can be cleared at any time via Chrome's extension settings

## Permissions Explained

| Permission | Why it's needed |
|------------|----------------|
| `storage` | Save your extension preferences locally |
| `system.display` | Position floating windows correctly on your screen |
| Host: `*.youtube.com` | Inject buttons on YouTube pages and control playback |
| Host: `*.google.com` | Detect YouTube links in Google search results |
| Host: all websites | Detect YouTube/Vimeo links on external websites (optional feature) |

## Content Scripts

The extension injects content scripts on YouTube, Google, and optionally other websites to:
- Add "Open" buttons on video thumbnails
- Add "View" buttons next to video links
- Control playback speed in floating windows
- Apply visual preferences in floating windows

These scripts run locally in your browser and do not communicate with any external service.

## Third-Party Services

Yutu Labs does not use any third-party services, APIs, or analytics platforms. The only external communication is between your browser and YouTube/Vimeo when you open a video (standard browser behavior).

## Children's Privacy

Yutu Labs does not knowingly collect any data from users of any age, as it does not collect data at all.

## Changes to This Policy

If this policy changes, the updated version will be published in the extension's repository and the "Last updated" date will be revised.

## Contact

For questions or concerns about this privacy policy, please open an issue at the project's GitHub repository.
