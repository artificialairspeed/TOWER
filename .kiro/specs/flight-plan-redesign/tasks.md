# Implementation Plan: Flight Plan Redesign

## Overview

Replace the two authored notification templates (`light-mode.html`, `dark-mode.html`) with a single, from-scratch dark Jetstream template (`public/templates/flight-plan.html`) and simplify the plumbing that selects it. The token-injection contract (`injectTemplate` in `src/utils/formatters.ts`) stays unchanged; the loader collapses to one cached template string; the two generators stop branching on `Theme`; the old files are deleted; and documentation is reconciled.

The implementation proceeds authored-template-first, then loader, then generators, then cleanup, and ends with a build + manual verification task. TOWER has **no test runner configured**, so all test tasks are optional (marked `*`) and contingent on a runner being added; final verification is manual.

## Tasks

- [x] 1. Author the single Flight Plan template
  - [x] 1.1 Create `public/templates/flight-plan.html` structure and inline styling
    - Create a full HTML document (`<!DOCTYPE html>`, `<html lang="en">`, `<head>`, inline `<style>`, `<body>`) with no external CSS and no external JS reference.
    - Lay out the card: `.page` with 24px padding each side, `.card` fixed `width: 1100px` (1100 + 48 = 1148px), `border-radius: 8px`, `overflow: hidden`, and a `.stripe` top accent bar in SWA red `#e31837`.
    - Build the header with the "TOWER" wordmark + an inline-SVG takeoff icon (mirroring MUI `FlightTakeoff`) in SWA blue `rgb(25,130,230)` and the tagline; include NO Southwest heart logo and NO Crew Training logo (not as `<img>` nor as base64).
    - Define the Jetstream palette via CSS variables and apply them: page bg `rgb(21,39,63)`, card `rgb(33,51,70)`, elevated `rgb(43,61,79)`, divider `rgb(71,99,128)`, text `rgb(255,255,255)`/`rgb(207,217,219)`/`rgb(123,139,144)`, blue `rgb(25,130,230)`, amber `rgb(255,191,0)` used for at most one element (the "Yes" outage pill).
    - Render a fields-and-table layout separated by divider lines with no boarding-pass ornamentation (no perforations, stubs, or barcodes); keep secondary/primary text on the card surface at ≥ 4.5:1 contrast.
    - Place every Content_Token where its data belongs: `{{NOTIFICATION_HEADER}}`, `{{DEPLOYMENT_TITLE}}`, `{{DEPLOYMENT_SUBTITLE}}`, `{{SCHEDULE}}`, `{{OUTAGE_INDICATOR}}`, `{{JIRA_ITEMS}}`, `{{CONTACT}}`.
    - Place the always-emptied `{{OUTAGE_BLOCK}}` and `{{IMPACT_ITEMS}}` plus the legacy `{{OUTAGE_WINDOW}}` inside a `display:none` holder so the unchanged injector clears them to `''` with no visible output or raw placeholder text.
    - Add CSS for the injector's emitted markup: `.change-group`, `.impact-sub` (color/size only — do not fight its inline `margin:4px 0 10px 18px;`), and `<strong>` Jira numbers in SWA blue `700`.
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3, 3.4, 4.1, 4.3, 4.5, 4.6, 5.1, 5.2, 6.1, 6.2, 7.4_

  - [x] 1.2 Embed Open Sans via base64 `@font-face` in `public/templates/flight-plan.html`
    - Add `@font-face` rules inside the inline `<style>` for Open Sans weights 400, 600, and 700, each with `src: url(data:font/woff2;base64,<…subset…>) format('woff2')` — a `data:` URI only, no remote font `<link>`.
    - Set `body { font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }` so the system fallback stack applies if Open Sans is unavailable.
    - Use a Latin woff2 subset (e.g. Apache-2.0 Google Fonts Open Sans) committed inline so rasterization inside the isolated iframe needs no network request.
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [x] 2. Collapse the template loader to a single cached template
  - [x] 2.1 Rewrite `src/utils/templateProvider.ts` for one template
    - Replace the `Map<'light'|'dark', string>` with a single cached `template: string | null`; set `const TEMPLATE_PATH = '/templates/flight-plan.html';`.
    - Remove the exported `Theme` type from this module; change `getTemplate()` to take no theme argument and return the cached string (throw a clear "not loaded, call initialize() first" error when unloaded).
    - Fetch exactly one path; preserve the 5s `AbortController` timeout that throws an error naming the path, the `loadingPromise` reset on failure for retry, and the in-memory cache / idempotent `initialize()`.
    - Keep `isLoaded()`, `setTemplate()`, and `clear()`.
    - _Requirements: 8.2, 9.1, 9.2, 9.3, 9.4, 10.2_

  - [ ]* 2.2 Write property tests for the loader (optional — only if a runner is added)
    - **Property 4: Successful load is cached (idempotence)** — stub `fetch`; assert repeated `initialize()` performs exactly one fetch and `getTemplate()` returns the same content.
    - **Property 5: Load failure is always recoverable** — stub `fetch` with fake timers; assert a failed attempt (network/404/timeout) followed by `initialize()` starts a fresh attempt and resolves, never wedged.
    - **Validates: Requirements 9.4, 9.3**

- [x] 3. Simplify `src/utils/htmlGenerator.ts` (synchronous delivery path)
  - [x] 3.1 Drop theme branching in `htmlGenerator.generateHTML`
    - Keep the `generateHTML(data, _theme?)` signature for back-compat with `bundleBuilder.ts`/`useOutputGenerator.ts`; ignore the theme argument.
    - Call `templateProvider.getTemplate()` unconditionally and return `injectTemplate(template, data)`.
    - Delete `mapThemeToTemplate` and any `Theme` import no longer needed.
    - _Requirements: 1.3, 1.4, 8.3, 8.4_

- [x] 4. Simplify `src/utils/artifactGeneration.ts` (async generator, off delivery path)
  - [x] 4.1 Drop the themeKey branch in the async `generateHTML`
    - Keep the async `generateHTML(data, _theme?)` signature; remove the `themeKey` branch and select the single template.
    - Ensure `templateProvider.initialize()` is awaited when not loaded, then return `injectTemplate(templateProvider.getTemplate(), data)`.
    - Leave `generatePNG`, `openAndDownloadPNG`, `openHTMLTab`, and the 1148px container sizing unchanged; do not touch `bundleBuilder.ts`, `useOutputGenerator.ts`, or `App.tsx` behavior.
    - _Requirements: 1.3, 1.4, 6.3, 7.1, 7.2, 7.3, 7.5, 8.3, 8.4_

  - [ ]* 4.2 Write property tests for generation + injection (optional — only if a runner is added)
    - **Property 1: Theme-independent template selection** — for any form data and any theme value (incl. none), the token-stripped HTML skeleton from `generateHTML` is identical.
    - **Property 2: Every content value is rendered** — for any valid `DeploymentFormData`, the populated HTML contains the header, title, subtitle, schedule, Yes/No outage, each change item's Jira number/description with nested impact bullets, and the contact block.
    - **Property 3: No token or placeholder survives injection** — for any data (incl. empty fields / no change items / no impacts), the output contains no Content_Token or Legacy_Alias string and no residual `{{…}}`; `{{OUTAGE_BLOCK}}`/`{{IMPACT_ITEMS}}` contribute no visible content.
    - **Validates: Requirements 1.3, 1.4, 8.3, 8.4, 4.2, 4.4, 4.5, 4.6**

- [x] 5. Retire the old templates
  - [x] 5.1 Delete `public/templates/light-mode.html` and `public/templates/dark-mode.html`
    - Remove both authored files from the repository so only `flight-plan.html` remains under `public/templates/`.
    - _Requirements: 8.1_

- [x] 6. Reconcile documentation references
  - [x] 6.1 Update `docs/REPOSITORY_CLEANUP_SUMMARY.md`
    - Revise the `public/templates/` tree listing and the "Templates Copied: Both light-mode.html and dark-mode.html" build note to describe the single `flight-plan.html`.
    - _Requirements: 10.1_

  - [x] 6.2 Update `docs/DEVELOPER_GUIDE.md`
    - Revise the `public/templates/` tree (`light-mode.html` / `dark-mode.html`) and the theme-selection / e2e "Select Dark/Light theme" references to the single Flight Plan Template.
    - _Requirements: 10.1_

  - [x] 6.3 Update `docs/DEPLOYMENT.md`
    - Change the example asset path `/templates/light-mode.html` → `/templates/flight-plan.html`.
    - _Requirements: 10.1_

  - [x] 6.4 Update `docs/ARCHITECTURE.md`
    - Revise the `generateHTML(data, theme)` description, the `templateProvider.getTemplate()` theme-selection narrative, and `/public/templates/*.html` references to reflect the single template with no theme branching.
    - _Requirements: 10.1_

  - [x] 6.5 Update `src/theme/README.md`
    - Rewrite the Light/Dark artifact-template narrative, the "Generated Artifacts" theme-selection flow, and the `/public/templates/*.html` reference to describe the single Flight Plan Template.
    - _Requirements: 10.1_

- [x] 7. Build and manual verification
  - Run `npm run build` (`tsc -b` + `vite build`) and confirm it completes without type errors.
  - Confirm `dist/templates/` contains exactly `flight-plan.html` and that `light-mode.html` / `dark-mode.html` are absent (verifies `public/` → `dist/` verbatim copy with no Vite change).
  - Generate a Flight Plan in the browser and confirm the PNG opens in a new tab with correct Open Sans fonts and all fields populated (header, title, subtitle, schedule, outage pill, change items with impact bullets, contact), with no raw `{{…}}` placeholders.
  - _Requirements: 4.2, 4.6, 7.1, 7.2, 7.3, 8.5_

## Notes

- Tasks marked with `*` are optional and are **contingent on a test runner being added** — TOWER currently has no `test` script or Vitest/Jest/Playwright runner, so no test infrastructure is created by this workflow. Requirement 10.3 is conditional for the same reason (no automated tests exist to update).
- `src/utils/formatters.ts` (`injectTemplate`) is intentionally **not** a task — it stays unchanged, and the template uses its exact token names.
- Requirement 4.4 (the Token_Injector / `formatters.ts` stays unchanged) is a satisfied-by-no-change constraint — intentionally not its own task — so its coverage is explicit without an implementation task.
- `src/utils/bundleBuilder.ts`, `src/hooks/useOutputGenerator.ts`, and `src/App.tsx` are intentionally left functionally unchanged; they continue to thread `theme` through, now ignored downstream.
- The 5 correctness properties in `design.md` map to the optional property-test sub-tasks (2.2, 4.2). Static criteria (CSS values, file presence, structural markup, build copy) and integration behavior (rasterization, new-tab) are covered by the manual verification task 7.
- Each task references the specific requirements it satisfies for traceability.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "5.1", "6.1", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.1", "4.1"] },
    { "id": 2, "tasks": ["4.2"] }
  ]
}
```
