# Implementation Plan: S3 Static Hosting

## Overview

This plan makes the Deployment Notification Generator buildable as a fully static bundle and deployable to plain S3 static website hosting, with no server-side runtime and no test-writing tasks. Work proceeds in a streamlined path: confirm the static Vite build and template copy, harden the runtime template loader (5s timeout + retryable initialize), surface a user-visible template load error with retry in `App.tsx`, add the `deploy` npm script, and author `DEPLOYMENT.md`. Build output correctness is confirmed through manual inspection rather than automated tests.

## Tasks

- [x] 1. Verify and ensure the static Vite build serves from the bucket root
  - [x] 1.1 Confirm Vite `base` resolves to `/` for absolute asset URLs
    - Inspect `vite.config.ts` and ensure `base` is unset (defaults to `/`) or explicitly `/`, so emitted asset URLs and index references are absolute against the bucket root; no base-path rewrite required
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Ensure runtime templates are copied into `dist/templates/`
    - Confirm `public/templates/light-mode.html` and `public/templates/dark-mode.html` exist as the canonical runtime source so Vite copies them verbatim to `dist/templates/`; the top-level `Templates/` folder is not the runtime source
    - _Requirements: 1.4_

  - [x] 1.3 Run the build and manually inspect the emitted `dist/`
    - Run `npm run build` (`tsc -b && vite build`); manually inspect that `dist/index.html` asset `src`/`href` attributes begin with `/assets/` and that `dist/templates/` contains both `light-mode.html` and `dark-mode.html`
    - This is a manual inspection step, not a test-writing task
    - _Requirements: 1.1, 1.3, 1.4_

- [x] 2. Harden the Template_Loader in `src/utils/templateProvider.ts`
  - [x] 2.1 Add a 5-second timeout to each template fetch
    - Wrap `fetch` in `loadTemplateAsync` with an `AbortController` and a 5000 ms timer; on abort, throw a timeout error identifying the template path; on non-2xx, throw an error including path and status; clear the timer in `finally`
    - _Requirements: 1.5, 1.6_

  - [x] 2.2 Make failed initializations retryable without a full reload
    - Update `initialize()`/`loadTemplates` so that on failure the cached `loadingPromise` is reset to `null`, allowing a subsequent `initialize()` to start a fresh attempt; a successful load keeps templates cached and makes `initialize()` a no-op. Keep the public interface (`initialize`, `getTemplate`, `isLoaded`, `setTemplate`, `clear`) unchanged
    - _Requirements: 1.6_
    - Satisfies **Property 1: Template load failure is always recoverable**

- [x] 3. Surface a user-visible template load error with retry in `App.tsx`
  - [x] 3.1 Add template load state and load callback
    - Introduce `templateError: string | null` and `templatesReady: boolean` state; add a `loadTemplates` callback that clears the error, calls `templateProvider.initialize()`, sets `templatesReady` on success and a "Failed to load templates" message on failure; trigger it from an effect when templates are not ready
    - _Requirements: 1.6_

  - [x] 3.2 Render an error indication with an in-page Retry affordance
    - When `templateError` is set, render an MUI `Alert`/`Snackbar` reporting the failure with a **Retry** button that re-invokes the `loadTemplates` callback (in-page state transition, no full reload)
    - _Requirements: 1.6_
    - Satisfies **Property 1: Template load failure is always recoverable**

- [x] 4. Checkpoint - verify template loading and error/retry behavior
  - Manually confirm the app loads templates on success and shows the error + Retry affordance on failure (e.g., temporarily block a template path) without a full reload. Ensure the build still compiles. Ask the user if questions arise.

- [x] 5. Add the deploy npm script to `package.json`
  - [x] 5.1 Add the `deploy` script using `aws s3 sync` with `--delete`
    - Add `"deploy": "aws s3 sync dist/ \"s3://$DEPLOY_BUCKET\" --delete"` so `dist/` syncs to the bucket root using the `DEPLOY_BUCKET` environment variable, preserving relative structure and removing objects no longer present in `dist/`; the script does not run the build and relies on AWS CLI exit-code semantics for availability/credential/success/failure reporting
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7_

- [x] 6. Author `DEPLOYMENT.md`
  - [x] 6.1 Document prerequisites and the build-then-deploy sequence
    - Write prerequisites: AWS CLI installed and on PATH; AWS credentials configured with write permission to the target bucket; `DEPLOY_BUCKET` set to the bucket name. Document the ordered workflow: run `npm run build`, then `npm run deploy`
    - _Requirements: 2.3, 2.4_

  - [x] 6.2 Document S3 static website hosting configuration
    - Describe enabling static website hosting with index document `index.html`; setting the error document to `index.html` for client-side SPA routing; disabling the four Block Public Access settings and attaching a public-read bucket policy granting `s3:GetObject` to `*` for `arn:aws:s3:::<bucket>/*`; and accessing the app via the plain S3 website endpoint over HTTP with no CloudFront/CDN/HTTPS front. Include the example bucket policy and a security note about anonymous public read
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7. Final checkpoint - verify build, deploy script, and docs
  - Manually confirm `npm run build` produces a static `dist/`, the `deploy` script is present and correctly formed, and `DEPLOYMENT.md` covers prerequisites, sequence, and S3 configuration. Ask the user if questions arise.

## Notes

- Per project constraints, this plan contains NO test-writing tasks (no unit, integration, or e2e tests). Build output correctness is confirmed through manual inspection steps (tasks 1.3, 4, 7).
- The feature is fully static with no server-side runtime; all logic runs in the browser.
- Property 1 (template load failure is always recoverable) is recorded as a behavioral specification and satisfied by tasks 2.1, 2.2, and 3.2 rather than by an automated property test.
- Each task references specific requirements for traceability.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "5.1", "6.1", "6.2"] },
    { "id": 1, "tasks": ["1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2"] }
  ]
}
```
