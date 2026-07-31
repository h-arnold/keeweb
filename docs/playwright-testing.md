# Playwright E2E Testing

## Overview

KeeWeb uses [Playwright](https://playwright.dev) for end-to-end testing of the web application. Tests live in `e2e/` and run against the production build served from `dist/`.

## Setup

Playwright is installed as a dev dependency. Browsers are downloaded separately:

```bash
npm install
npx playwright install chromium
```

## Running Tests

```bash
# Build first (required - tests run against dist/)
NODE_OPTIONS=--openssl-legacy-provider npx grunt

# Run all tests
npx playwright test

# Run a specific test file
npx playwright test e2e/database-operations.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui

# Run headed (visible browser)
npx playwright test --headed
```

## Configuration

`playwright.config.ts` at the repo root:

- **Test directory:** `e2e/`
- **Web server:** Automatically starts `http-server dist -p 8086 -s` before tests
- **Browser:** Chromium, headless, 1280x720 viewport
- **Timeouts:** 60s per test, 10s per action

## File Structure

```
e2e/
  database-operations.spec.ts   # Serial test suite (create + open database)
  fixtures/
    test-database.kdbx           # Pre-built KeePass database (password: test123)
```

## Patterns and Decisions

### Serial Test Execution

Tests that depend on each other use `test.describe.serial()`:

```ts
test.describe.serial('KeeWeb Database Operations', () => {
    test('should create...', async ({ page }) => { ... });
    test('should open...', async ({ page }) => { ... });
});
```

This ensures the create test runs before the open test. Without `serial`, Playwright runs tests in parallel by default.

### Waiting for App State

KeeWeb uses Backbone.js with deferred rendering. Tests wait for specific UI state changes rather than arbitrary timeouts:

```ts
// Wait for open screen to appear
await page.waitForSelector('#open__icon-new', { state: 'visible', timeout: 30000 });

// Wait for open screen to disappear after database is created
await page.waitForSelector('.open', { state: 'hidden', timeout: 15000 });
```

Playwright's `expect` also auto-retries assertions, so `await expect(el).toBeVisible()` polls until the element appears or the timeout expires.

### Handling Hidden File Inputs

The file input (`<input type="file">`) is hidden via CSS class `hide-by-pos`. Playwright's `setInputFiles` works on hidden inputs:

```ts
const fileInput = page.locator('.open__file-ctrl');
await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-database.kdbx'));
```

The app processes the file via a `change` event listener on this input.

### Modal Dialogs

KeeWeb shows a "Local file" warning modal when opening files in the browser. Tests must dismiss it before interacting with the page behind it:

```ts
const okButton = page.locator('.modal__buttons button[data-result="ok"]');
if (await okButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await okButton.click();
}
```

The `catch(() => false)` handles the case where the modal doesn't appear (e.g., if the user checked "Don't show this again").

### Selectors

The tests use a mix of selector strategies:

| Strategy | Example | When to use |
|---|---|---|
| ID | `#open__icon-new` | Unique elements, fastest |
| CSS class | `.open__pass-input` | When no ID exists |
| Role | `getByRole('heading', { name: 'TestEntry' })` | Semantic elements, best for accessibility |
| Compound | `.modal__buttons button[data-result="ok"]` | When targeting specific dynamic elements |

### Test Fixtures

Test databases are pre-built with `kdbxweb` (Node.js) and stored in `e2e/fixtures/`. The fixture script uses AES-KDF instead of Argon2 because `kdbxweb` doesn't support Argon2 in Node.js (it requires browser WASM).

To regenerate a fixture:

```bash
node -e "
const kdbxweb = require('kdbxweb');
const fs = require('fs');
(async () => {
    const creds = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('test123'));
    const db = kdbxweb.Kdbx.create(creds, 'TestDatabase');
    db.header.setKdf(kdbxweb.Consts.KdfId.Aes);
    // ... add entries ...
    const buf = await db.save();
    fs.writeFileSync('e2e/fixtures/test-database.kdbx', Buffer.from(buf));
})();
"
```

## Test Coverage

### Current Tests

| Test | What it verifies |
|---|---|
| `should create a new KeePass database` | Clicking "New" on the open screen creates an in-memory database and transitions to the main UI |
| `should open an existing KeePass database` | Uploading a `.kdbx` file, entering the password, and clicking enter opens the database and displays its entries |

### Gaps to Cover

- Saving/downloading a database
- Creating and editing entries (title, username, password, URL)
- Entry search and filtering
- Trash operations
- Settings changes
- Password generator
- Drag and drop file opening
- Multiple databases open simultaneously
- Keyboard shortcuts
- Error states (wrong password, corrupted file)
