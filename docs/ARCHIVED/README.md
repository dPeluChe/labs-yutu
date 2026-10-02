# Archived docs

Historical documents, kept for context. For the current state see the code, `CLAUDE.md`, `docs/ARCHITECTURE/HOW_IT_WORKS.md`, `docs/TASK_TODO.md` and `CHANGELOG.md`.

## Why embeds were abandoned

| Doc | What it records |
|-----|-----------------|
| `ATTEMPTS_AND_ALTERNATIVES.md` | Failed iframe / Document PiP / IFrame API attempts |
| `ERROR_153_DEBUGGING.md` | YouTube embed error `embedder.identity.missing.referrer` (persistent across every embed method) |
| `TECHNICAL_EVALUATION.md` | Evaluation of embed techniques, all discarded |
| `FINAL_SOLUTION.md` | The `window.open()` decision; today the window is opened with `chrome.windows.create()` from the service worker |

Takeaway: YouTube blocks every embed when origin matches the embedder, so the extension opens `youtube.com/watch` in a native popup window with YouTube's own player.

## Research still referenced

- `YOUTUBE_API_INVESTIGATION.md`: transcript / AI summary investigation, linked from `TASK_TODO.md` (task 4).
- `SPEED_CONTROL_RESEARCH.md`: approaches considered for playback speed.

## Decisions

- `NAMING_DECISION.md`: why the product is called Yush and which names were discarded.

## Removed

Docs for the old `window.open()` layout (refactor plans and summaries, build and speed-control test guides, the 2025 task log) were deleted on 2026-10-02. They stay in git history, e.g. `git log --diff-filter=D -- docs/ARCHIVED`.
