# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Yush** (formerly Yutu Labs; see `docs/ARCHIVED/NAMING_DECISION.md`) is a Chrome extension (Manifest V3, vanilla JavaScript, esbuild) by peluche (dpeluche.dev). It opens YouTube and Vimeo videos in a floating window, adds speed controls, hides clutter, and calms the Home feed (old-video blur, Shorts shelf toggle).

Read `docs/ARCHITECTURE/HOW_IT_WORKS.md` before changing behavior: it covers the pieces, the settings schema (`yutuSettings`) and which code depends on YouTube's markup. Build, load, debug and release steps are in `docs/GUIDES/DEVELOPMENT.md`.

## Rules that are easy to get wrong

- Chrome only loads `dist/`. After a build, reload the extension and refresh the YouTube tab (open tabs keep the old content script).
- `npm run check` (lint, tests, build) must pass before a PR. Tests use jsdom with sample YouTube markup; when YouTube changes its DOM, update the sample markup from a real example first, then the selector.
- Settings flow through `chrome.storage.local`. The popup and the element picker only save; content scripts react through `subscribeSettings()` in `content/config.js` (one shared `chrome.storage.onChanged` listener that delivers merged settings). Do not add popup-to-page messages for settings.
- Defaults and merging of stored settings live in `content/config.js`; new settings need a default there.
- YouTube selectors are centralized in `content/selectors.js`, plus `THUMB_SELECTORS`/`META_SELECTORS` in `content/button-factory.js` and `DATE_CANDIDATES` in `content/old-video-filter.js`.
- The CSS prefix `yutu-`, the `data-yutu-*` attributes, the `yutu_popup` URL parameter and the `yutuSettings` key are legacy internals from the previous name and stay as they are (renaming them would wipe users' settings).
- CSS tokens (`--yutu-*`) are defined in both `content/content.css` and `popup/popup.css`; keep them in sync.
- Code and comments in English; README.es.md and `docs/` are in Spanish.
- Task tracking lives in `docs/TASK_TODO.md` and `docs/TASK_COMPLETED/`, never in this file or the READMEs.

## Workflow

Work on a branch, open a PR, squash merge to `main`. Keep `CHANGELOG.md` and the version (`manifest.json` and `package.json` must match) up to date when shipping.

## ship config

```yaml
lint: npm run lint
test: npm test
build: npm run build
merge_policy: auto
loc_limit: 500
branch_cleanup: delete
```
