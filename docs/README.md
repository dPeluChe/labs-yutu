# Documentation - Yutu Labs

This folder contains project documentation organized by purpose and relevance.

---

## 📄 Active Documentation

### [TASK_TODO.md](./TASK_TODO.md)
**Project Roadmap & Task List**

Current status of all refactoring phases and pending tasks:
- Phase 1-7: Refactoring phases with completion status
- Additional completed tasks (Modal, Translation)
- Future feature ideas (Window Management, Button Customization, etc.)
- Task priority legend and estimated time tracking

**Use for**: Planning work, tracking progress, understanding what's next.

---

### [TASK_COMPLETED.md](./TASK_COMPLETED.md)
**Completed Work Log**

Detailed record of completed phases and tasks:
- Translation & Modal System implementation
- Phase 1: Configuration Management
- Metrics and improvements achieved
- Lessons learned and best practices

**Use for**: Reviewing completed work, understanding progress, learning from past sessions.

---

### [CHANGELOG.md](./CHANGELOG.md)
**Version History & Release Notes**

Chronological record of all changes:
- Unreleased features and changes
- Semantic versioning format
- Migration guides between versions
- Commit history by session

**Use for**: Understanding what changed in each version, release planning.

---

### [README.md](../README.md)
**Main Project Documentation**

Complete user and developer documentation:
- Project overview and features
- Installation and build instructions
- Architecture and technical details
- Testing workflow

**Use for**: New developers, understanding the full project, day-to-day development.

---

## 📦 Archived Documentation

Historical documents from earlier project phases are in [`archives/`](./archives/):

- **REFACTORING_RECOMMENDATIONS.md** - Original refactoring plan (content moved to TASK_TODO.md)
- **REFACTOR_SUMMARY.md** - Summary of window.open() implementation
- **ATTEMPTS_AND_ALTERNATIVES.md** - Technical attempts report (iframe, PiP, etc.)
- **ERROR_153_DEBUGGING.md** - Debugging YouTube embed error 153
- **FINAL_SOLUTION.md** - Documentation of final window.open() solution
- **TECHNICAL_EVALUATION.md** - Evaluation of implementation alternatives
- **TESTING.md** - Testing guide for PiP implementation

See [`archives/README.md`](./archives/README.md) for details on each archived document.

---

## 📚 Document Structure

```
docs/
├── Active (Current)
│   ├── TASK_TODO.md           # Roadmap & pending tasks
│   ├── TASK_COMPLETED.md      # Completed work log
│   ├── CHANGELOG.md           # Version history
│   └── README.md             # This file
│
└── archives/ (Historical)
    ├── README.md              # Archive index & key learnings
    ├── REFACTORING_RECOMMENDATIONS.md
    ├── REFACTOR_SUMMARY.md
    ├── ATTEMPTS_AND_ALTERNATIVES.md
    ├── ERROR_153_DEBUGGING.md
    ├── FINAL_SOLUTION.md
    ├── TECHNICAL_EVALUATION.md
    └── TESTING.md
```

---

## 🗂️ Quick Reference

| I need to... | See this file |
|---------------|---------------|
| Plan next work session | TASK_TODO.md |
| Check current progress | TASK_COMPLETED.md |
| See what changed recently | CHANGELOG.md |
| Understand the project | ../README.md |
| Learn from past decisions | archives/README.md |

---

*Last updated: 2025-01-22*
