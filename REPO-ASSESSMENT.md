# KeeWeb Repository Assessment Report

**Date:** 2026-07-30
**Version:** 1.18.9
**Repository:** https://github.com/keeweb/keeweb

---

## 1. Executive Summary

KeeWeb is a KeePass-compatible password manager built as an Electron web app. The repository is in a state of significant neglect: dependencies are severely outdated (many by 4-7 major versions), the test coverage is effectively negligible at under 4%, the Electron desktop app uses deprecated security anti-patterns, and the build infrastructure relies on increasingly unmaintained tooling. This report catalogues the state of the repo and provides a prioritized list of areas that need attention.

---

## 2. Test Coverage

### 2.1 Test Infrastructure

- **Framework:** Mocha (v8.4) + Chai (v4.3), BDD style
- **Execution:** Tests are bundled with webpack and run in a headless browser via Puppeteer (v9.1)
- **Test entry:** `test/index.js` uses `require.context` to auto-discover all `.js` files under `test/src/`
- **Runner page:** `test/runner.html` -- Mocha `spec` reporter in a browser
- **Grunt task:** `grunt test` runs `build-test` then `run-test`
- **CI:** GitHub Actions workflow `build-tests.yml` runs `npm run test`

### 2.2 Coverage Statistics

| Metric | Value |
|---|---|
| Source files | 204 JS files (~30,878 lines) |
| Test files | 13 (947 lines of test code) |
| Source files tested | 13 (6.4% file coverage) |
| Source lines tested | 1,116 (3.6% line coverage) |
| Coverage tooling | None (no nyc, istanbul, c8, etc.) |

### 2.3 Tested Source Modules

| Source File | Test File |
|---|---|
| `comp/i18n/date-format.js` | `test/src/comp/i18n/date-format.js` |
| `framework/collection.js` | `test/src/framework/collection.js` |
| `framework/model.js` | `test/src/framework/model.js` |
| `util/data/password-strength.js` | `test/src/util/data/password-strength.js` |
| `util/data/semver.js` | `test/src/util/data/semver.js` |
| `util/entry-search.js` | `test/src/util/entry-search.js` |
| `util/formatting/icon-url-format.js` | `test/src/util/formatting/icon-url-format.js` |
| `util/formatting/md-to-html.js` | `test/src/util/formatting/md-to-html.js` |
| `util/formatting/password-presenter.js` | `test/src/util/formatting/password-presenter.js` |
| `util/formatting/string-format.js` | `test/src/util/formatting/string-format.js` |
| `util/formatting/url-format.js` | `test/src/util/formatting/url-format.js` |
| `util/generators/id-generator.js` | `test/src/util/generators/id-generator.js` |
| `util/generators/password-generator.js` | `test/src/util/generators/password-generator.js` |

### 2.4 Completely Untested Directories

- `app.js` (entry point)
- `auto-type/` (6 files) -- auto-type engine
- `collections/` (10 files) -- data collections
- `comp/app/` (15 files) -- app composition, updater, shortcuts, focus, etc.
- `comp/browser/` (9 files) -- browser integration, clipboard, feature detection
- `comp/extension/` (2 files) -- browser extension connector
- `comp/format/` (2 files) -- KDBX-to-HTML, OTP QR
- `comp/launcher/` (3 files) -- desktop app launcher
- `comp/settings/` (2 files) -- settings management
- `comp/ui/` (1 file) -- alerts
- `const/` (12 files) -- constants
- `framework/views/` (4 files) -- base view classes
- `hbs-helpers/` (7 files) -- Handlebars template helpers
- `models/` (13 files) -- all data models
- `plugins/` (5 files) -- plugin system
- `presenters/` (1 file) -- entry presenter
- `storage/` (11 files including `storage/impl/`) -- all storage/backends
- `util/` (6 files) -- features, fn, locale, logger, kdbxweb, ui helpers
- `views/` (64 files total) -- all UI views

**The entire UI layer, data models, storage system, and core app composition logic are untested.**

---

## 3. Dependencies

### 3.1 Critical Vulnerabilities (17 critical)

127 total vulnerabilities (10 low, 26 moderate, 74 high, 17 critical). Root causes:

- `xmldom` -- critical CVEs including XML injection, DoS via recursion, prototype pollution (`*` version is vulnerable)
- `@babel/traverse` -- critical arbitrary code execution via malicious input
- `@babel/plugin-transform-modules-systemjs` -- high severity arbitrary code generation
- `puppeteer/node_modules/ws` -- high severity ReDoS and memory exhaustion DoS
- `electron` -- many unpatched CVEs for a version 4+ years behind

### 3.2 Severely Outdated Key Packages

| Package | Current | Latest | Gap |
|---|---|---|---|
| `electron` | 13.6.9 | 43.2.0 | ~8 years behind |
| `puppeteer` | 9.1.1 | 25.4.0 | ~4 years behind |
| `webpack` | 5.36.2 | 5.109.2 | ~1.5 years behind |
| `@babel/core` | 7.14.0 | 8.0.1 | ~2 years behind |
| `babel-loader` | 8.2.2 | 10.1.1 | ~2 minor versions |
| `babel-cli` | 6.26.0 | -- | **Deprecated Babel 6** |
| `electron-builder` | 23.6.0 | 26.15.3 | ~2 years behind |
| `grunt-electron` | 12.0.0 | 13.0.0 | Last release is old, package is unmaintained |
| `grunt-webpack` | 4.0.3 | 8.0.0 | Major version gap |
| `eslint` | 7.26.0 | 10.8.0 | ~3 major versions |
| `marked` | 2.0.3 | 18.0.7 | Major rewrite; v3+ is incompatible |
| `dompurify` | 2.2.8 | 3.4.12 | Major version behind |
| `mocha` | 8.4.0 | 11.7.6 | ~3 major versions |
| `chai` | 4.3.4 | 6.2.2 | ~2 major versions |
| `prettier` | 2.2.1 | 3.9.6 | Major version with config changes |
| `sass` | 1.32.12 | 1.102.0 | Major version |
| `jquery` | 3.6.0 | 4.0.0 | Breaking changes in v4 |
| `@fortawesome/fontawesome-free` | 5.15.3 | 7.3.1 | Major version, different icons |

### 3.3 Problematic Dependencies

- **`babel-cli`** (`^6.26.0`) is the Babel 6 CLI. It coexists with Babel 7 packages (`@babel/core` etc.) but serves no purpose since `@babel/preset-env` is available and used by `babel-loader`. It should be removed.
- **`@keeweb/keeweb-native-modules`** and **`@keeweb/keeweb-native-messaging-host`** are published from GitHub releases, not npm. This makes builds fragile and dependent on external hosting.
- **`grunt-appdmg`** uses a GitHub fork of an unmaintained package for macOS DMG creation.
- **`keytar`** (optional dependency) may fail to build on Linux if native compilation tools are missing.

---

## 4. Build Tooling

### 4.1 Build System: Grunt + Webpack

- **Grunt** (`1.4.0`) is configured via `Gruntfile.js` and `grunt.tasks.js` + `grunt.entrypoints.js`
- **`grunt-webpack`** (`4.0.3`) wraps webpack 4's compiler API, which means webpack 5 features are not fully accessible through it
- **`grunt-eslint`** (`23.0.0`) is the ESLint integration
- The build system is entirely Grunt-based. While functional, Grunt is a legacy build tool and the ecosystem is stale.

### 4.2 Babel Configuration

` .babelrc` uses individual Babel 7 plugins instead of `@babel/preset-env`. This is overly verbose and harder to maintain. The `babel-cli` Babel 6 package is also present but unused for the main build.

### 4.3 Webpack Configuration

`build/webpack.config.js` is a custom config with:
- Resolve aliases for all major dependencies
- Custom loaders for SCSS, Handlebars, fonts, etc.
- `webpack-bundle-analyzer` included for bundle analysis
- `terser-webpack-plugin` for minification
- `mini-css-extract-plugin` for CSS extraction
- Fallback stubs for `fs`, `path`, `crypto`, `Buffer`, `process`, `moment` -- these mean any source code using these will fail at test time

### 4.4 Node.js Version

- `engines` in `package.json` says `>=10.0` -- this is far too old
- `.nvmrc` says `20.20.2`
- CI uses Node 20
- `NODE_OPTIONS=--openssl-legacy-provider` is needed because of Node 17+ OpenSSL changes, but this workaround should not be needed with a modern Node version

---

## 5. Electron Desktop App

### 5.1 Electron Version

Electron 13 is based on Chromium 91 (March 2021). It is missing years of security patches, V8 performance improvements, and modern web API support. Current Electron is v33+ (Chromium 130+).

### 5.2 Deprecated Security Anti-Patterns

The `BrowserWindow` config uses:

```javascript
webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    nodeIntegrationInWorker: true,
    enableRemoteModule: true,
    spellcheck: false,
    v8CacheOptions: 'none'
}
```

All three of the first three settings are deprecated anti-patterns in modern Electron:
- **`contextIsolation: false`** -- the web page can access Node.js APIs directly
- **`nodeIntegration: true`** -- deprecated in favor of preload scripts with `contextBridge`
- **`enableRemoteModule: true`** -- **removed entirely in Electron 32+**

Modern Electron (v28+) enforces `contextIsolation: true` by default and has removed `enableRemoteModule`. Migrating to `contextBridge` + preload scripts is required for any Electron upgrade.

### 5.3 `v8CacheOptions: 'none'`

This is a workaround for old V8 caching behavior that is not needed in modern Electron versions.

---

## 6. Architecture and Security

### 6.1 CSP and `eval()`

The Content Security Policy in `app/index.html` allows `'unsafe-eval'` for scripts:

```
script-src 'self' 'unsafe-eval';
```

This is necessary because `app/scripts/plugins/plugin.js` uses `eval()` to execute plugin code (line 377-386). This creates a circular dependency: the eval call requires `'unsafe-eval'` in CSP, but `'unsafe-eval'` is a security restriction loophole.

**Recommended fix:** Replace `eval()` with a sandboxed approach using a Blob URL iframe with its own isolated origin, or use `new Function()` with strict input validation, or use a Web Worker for plugin execution.

### 6.2 Plugin System

The plugin system (`app/scripts/plugins/`) uses `eval()` for dynamic code execution. This is a security concern and is the root cause of the `'unsafe-eval'` CSP directive.

### 6.3 Browser Extension Integration

`comp/extension/` contains browser extension connector and protocol implementation code that is completely untested.

---

## 7. CI/CD Workflows

### 7.1 Workflows

- **`build-tests.yml`** -- Runs linting + tests, legitimate CI workflow
- **`build-run.yaml`** -- Build and release workflow for web + desktop platforms
- **`pr-scan.yml`** -- Automated PR scanner (from Aetherinox fork)
- **`deploy-clean.yml`**, **`deploy-docker-*.yml`**, **`deploy-website.yml`** -- Deployment workflows

### 7.2 Issues

- `build-run.yaml` references `Aetherinox` fork workflows (Cloudflare Pages) that appear to be from a different project merged in -- these should be reviewed for relevance
- `build-run.yaml` has a typo: the VirusTotal upload step has a broken `cp` command path
- No coverage reporting artifact is generated in CI
- Test runs use Puppeteer which requires system Chromium libraries (libgtk, libx11, etc.) that may not be available in all CI environments

---

## 8. Configuration Files

### 8.1 `.babelrc`

Uses individual Babel 7 plugins instead of `@babel/preset-env`. The preset would be simpler and more maintainable, especially since `@babel/preset-env` is already a dependency.

### 8.2 `.eslintrc`

- Uses `babel-eslint` parser (deprecated, should use `@babel/eslint-parser`)
- Uses `eslint-plugin-babel` (largely unnecessary with Babel 7)
- Uses `eslint-config-standard` which has its own dependency on older packages
- `no-console` is set to `error` which conflicts with the test harness's console output capture

### 8.3 `test/.eslintrc`

Minimal config that disables `no-unused-expressions` (needed for Chai's `expect(...).to.be.true` style) and sets `mocha` environment.

### 8.4 `.editorconfig`, `.prettierrc`, `jsconfig.json`

All present and functional but on older versions. Notable: `jsconfig.json` uses `"target": "esnext"` which is fine.

---

## 9. Other Notable Items

- **`grunt-appdmg`** (`github:keeweb/grunt-appdmg#874ad83`) -- an unmaintained fork of a deprecated package for macOS DMG creation
- **`@keeweb/*` packages** are published from GitHub releases rather than npm, which is fragile for reproducible builds
- **`mise.toml`** is a modern tool version manager config but only sets Node version
- **No release automation** beyond the build-run.yaml workflow; the project lacks a changelog automation or release tooling
- **`util/extract-release-notes.js`** exists for release note extraction but the implementation was not inspected

---

## 10. Prioritized Update Recommendations

### P0 -- Critical (Security / Non-Functional)

1. **Upgrade Electron** (13 -> 33+) -- security patches, modern Chromium, V8 performance
2. **Fix security anti-patterns** in `desktop/main.js` -- migrate from `contextIsolation: false` + `nodeIntegration: true` + `enableRemoteModule` to `contextBridge` + preload scripts
3. **Remove `babel-cli`** -- it is the deprecated Babel 6 CLI; all other Babel packages are v7
4. **Fix `xmldom` vulnerability** -- either upgrade or find an alternative (the direct dependency is `svg2ttf`, which is itself transitively pulling in a vulnerable version)

### P1 -- High (Dependencies / Build)

5. **Update all dependencies** -- `npm audit fix --force` with manual review for breaking changes
6. **Update webpack** + `grunt-webpack` -- gain webpack 5 full feature support
7. **Align `engines.node`** with `.nvmrc` (>=20) and remove `NODE_OPTIONS=--openssl-legacy-provider` workarounds
8. **Replace `babel-eslint`** with `@babel/eslint-parser`
9. **Replace `babel-cli` Babel 6 with `@babel/cli`** if Babel CLI is needed

### P2 -- Medium (Testing / Architecture)

10. **Migrate test runner** from Puppeteer (v9) to Playwright or Vitest for reliable modern execution
11. **Add coverage instrumentation** (`c8` or `istanbul`) with CI reporting
12. **Resolve `eval()` / CSP circular dependency** in the plugin system
13. **Write tests for core models and storage layer** -- the biggest coverage gaps
14. **Remove `grunt-appdmg` fork** and use a maintained alternative or native Electron Builder DMG support

### P3 -- Lower (Maintenance / Long-term)

15. **Evaluate Grunt -> npm scripts / Taskfile** migration for long-term build maintenance
16. **Audit `@keeweb/*` GitHub packages** for npm publish alternatives
17. **Update CI workflows** to remove stale Aetherinox fork references and add coverage reporting
18. **Update `@fortawesome/fontawesome-free`** to v7 (requires icon name changes throughout templates)
19. **Update `marked`** to v4 (v3+ is a major rewrite with different API)

---

## 11. Summary

The KeeWeb repository requires a substantial modernization effort. The most pressing concerns are the security vulnerabilities in outdated dependencies (especially Electron 13 and xmldom), the deprecated security anti-patterns in the Electron desktop app, and the near-zero test coverage. The build system is functional but relies on increasingly unmaintained tooling (Grunt, Babel 6, ancient Puppeteer). A systematic update of dependencies, migration away from deprecated Electron APIs, and significant expansion of test coverage should be the focus of any modernization effort.
