# Documentation - Yush

Index of `docs/`. Project overview lives in the root `README.md`, release notes in the root `CHANGELOG.md`.
Structure declared in [`.doctos.yml`](../.doctos.yml) (the table below derives from it).

| Path | Purpose |
|------|---------|
| `ARCHITECTURE/` | `HOW_IT_WORKS.md`: pieces, flows, settings schema, which code depends on YouTube's markup |
| `GUIDES/` | `DEVELOPMENT.md`: build and load, checks, debugging, releasing |
| `TASK_TODO.md` | Prioritized backlog |
| `TASK_COMPLETED/` | Monthly logs of finished work (`YYMM.md`, index in its `README.md`) |
| `STORE/` | Chrome Web Store: `LISTING.md` (texts to paste), `screenshots/` (store images), `PRIVACY_POLICY.md`. Package with `npm run package` |
| `ARCHIVED/` | Obsolete docs with an archival note. Index in its `README.md` |

## Writing rules

- Update `TASK_TODO.md` when priorities change.
- Move stale docs to `ARCHIVED/` with an archival note instead of deleting them.
- Keep `CHANGELOG.md` aligned with shipped code.
- Document only what the code or commands do not already show.
