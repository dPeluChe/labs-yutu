# Archived docs

Historical documents, kept for context. For the current state see the code, `CLAUDE.md`, `docs/TASK_TODO.md` and `CHANGELOG.md`.

## Read first: why embeds were abandoned

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

## Low reread value (candidates for deletion)

`REFACTORING_RECOMMENDATIONS.md`, `REFACTOR_SUMMARY.md`, `BUILD_VERIFICATION.md`, `TESTING.md`, `SPEED_CONTROLS_TESTING.md`, `TASK_COMPLETED_2025.md`: they describe the old `window.open()` layout and test flows that no longer exist. Kept only until someone confirms they are not needed.
