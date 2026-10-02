# Yush

[Español](./README.es.md)

Hush the algorithm. Yush is a Chrome extension that opens YouTube and Vimeo videos in a small floating window, adds playback speed controls, and quiets your YouTube feed. Made by [peluche](https://dpeluche.dev).

The name comes from "YouTube" plus "hush". How it was chosen is in [docs/ARCHIVED/NAMING_DECISION.md](./docs/ARCHIVED/NAMING_DECISION.md).

## What it does

- **Floating player.** A button on every video card (Home, Search, sidebar, Shorts) opens the video in its own window, parked in the bottom-right corner of your screen. Move and resize it freely.
- **Speed controls.** Presets of 1x, 1.15x, 1.25x, 1.5x and 2x, with Alt/Option + 1 to 5 shortcuts. They work in the floating window, on regular watch pages and on Shorts.
- **Close on finish.** The floating window closes itself when the video ends.
- **Hide clutter.** Hide the description, recommendations, header, like/more buttons, merch shelf and Shorts, with separate settings for the floating window and for regular watch pages.
- **Calm Home feed.** Optionally blur the old videos that YouTube resurfaces as reminders. The thumbnail is blurred and the title muted, while channel and date stay readable, so you see who and how long ago at a glance. Hovering clears the effect. You can also hide those cards entirely, or remove the Shorts shelf from Home.
- **Links outside YouTube.** A "View" button appears next to YouTube and Vimeo links in Google results and on websites you choose to enable.
- **Button position picker.** If YouTube changes its layout, point at the right spot on the page and the button follows.

## Install

When it is published, install it from the Chrome Web Store. Until then, build it from source and load the generated `dist/` folder as an unpacked extension. The steps are in the [development guide](./docs/GUIDES/DEVELOPMENT.md).

## Using the popup

The toolbar popup has four tabs.

- **Settings:** playback speed for the active tab, "close on finish", and the hide options (floating window / watch page).
- **Feed:** hide the Shorts shelf and filter old videos on Home. After saving, a button reloads the YouTube tab.
- **Selector:** choose where the open button goes, either with a CSS selector or by picking an element on the page.
- **Sites:** websites where the "View" button should appear. Each one is requested only when you add it.

## How it works

A content script scans the video cards YouTube renders, adds the open button, and watches the page for new cards as you scroll or navigate. Clicking the button asks the extension's background worker to open the video in a popup window with YouTube's own player. The Home filter reads the relative date shown on each card ("3 months ago", "hace 2 años") and marks the old ones so a stylesheet can blur them. All preferences are stored locally in the browser.

The technical details, including the settings schema and which parts depend on YouTube's markup, are in [docs/ARCHITECTURE/HOW_IT_WORKS.md](./docs/ARCHITECTURE/HOW_IT_WORKS.md).

## Privacy

No accounts, no analytics, no servers. Preferences stay in your browser, and extra websites are requested one at a time. See the [privacy policy](./docs/STORE/PRIVACY_POLICY.md).

## Troubleshooting

- **The window does not open.** Reload the extension, refresh the YouTube tab, and check that you loaded the `dist/` folder rather than the repository root. The extension's service worker console shows window errors.
- **No buttons on the cards.** Refresh the YouTube tab after reloading the extension. If YouTube changed its layout, use the Selector tab to point the button at the right place.
- **The Home filter does nothing.** Refresh the YouTube tab, and check that the filter is on in the Feed tab. Dates are read only when YouTube is set to English or Spanish.

## Reporting bugs

Found something broken? Use "Report a bug" at the bottom of the popup, or [open an issue](https://github.com/dPeluChe/yush/issues/new?template=bug_report.yml) on GitHub. The repository is public, so you can also follow along and see what is being worked on. Mention your Yush and browser versions and where it happened.

## Documentation

The index is [docs/README.md](./docs/README.md). Highlights:

- [How it works](./docs/ARCHITECTURE/HOW_IT_WORKS.md)
- [Development guide](./docs/GUIDES/DEVELOPMENT.md)
- [Chrome Web Store listing and naming](./docs/STORE/LISTING.md)
- [Changelog](./CHANGELOG.md)
- [Backlog](./docs/TASK_TODO.md)

## Credits

Made by [peluche](https://dpeluche.dev) · [dpeluche.dev](https://dpeluche.dev). Not affiliated with or endorsed by YouTube or Google.
