# Documentation - Yutu Labs

Index of `docs/`. Project overview lives in the root `README.md`, release notes in the root `CHANGELOG.md`.
Structure declared in [`.doctos.yml`](../.doctos.yml) (the table below derives from it).

| Path | Purpose |
|------|---------|
| `TASK_TODO.md` | Prioritized backlog |
| `TASK_COMPLETED/` | Monthly logs of finished work (`YYMM.md`, index in its `README.md`) |
| `STORE/` | Chrome Web Store: `LISTING.md` (texts to paste), `PRIVACY_POLICY.md`. Package with `npm run package` |
| `ARCHIVED/` | Obsolete docs with an archival note. Index in its `README.md` |

## Writing rules

- Update `TASK_TODO.md` when priorities change.
- Move stale docs to `ARCHIVED/` with an archival note instead of deleting them.
- Keep `CHANGELOG.md` aligned with shipped code.
- Document only what the code or commands do not already show.
