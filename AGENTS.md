# KeeWeb — Agentic Development Guide

## Project Status

KeeWeb v1.18.9 — a KeePass-compatible password manager (web + Electron desktop).
The codebase is legacy and unmaintained for years. **No source changes until we have comprehensive Playwright e2e coverage.**

## Golden Rule

**Do NOT modify any non-test source code** (anything under `app/`, `build/`, `desktop/`, `plugins/`, etc.) unless explicitly instructed by a human. Only test files (`e2e/`, `test/`), config files, and documentation may be touched without direct permission.

## Current Phase: Test Scaffolding

We are in **Phase 0**: building a comprehensive Playwright e2e test suite that covers existing functionality as a behavioural reference point. Only once coverage is sufficient will any refactoring begin.

### Test Strategy

| Layer | Tool | Location | Status |
|---|---|---|---|
| E2E (critical paths) | Playwright | `e2e/` | In progress |
| Unit (existing) | Mocha + Chai | `test/src/` | Legacy, keep as-is |
| Unit (new) | Mocha + Chai | `test/src/` | Optional additions |

### Running Tests

```bash
# Build first, then run legacy unit tests
npm test

# Run Playwright e2e tests (requires `dist/` built)
npm run start          # build once
npx playwright test    # run e2e tests

# Or use opencode commands
opencode test          # legacy unit tests
opencode test-e2e      # Playwright e2e tests
```

### E2E Fixtures

Test databases live in `e2e/fixtures/`. The existing `test-database.kdbx` uses password `test123` and contains an entry named `TestEntry`.

## Agent Roles

- **General agent**: Default. Use for open-ended research, multi-step tasks, writing tests.
- **Explore agent**: Use for quick codebase exploration — finding files, searching patterns, understanding architecture.

## Handoff Protocol

When one agent hands off to another, include:
1. What was found / done
2. What still needs doing
3. Any relevant file paths or test commands
