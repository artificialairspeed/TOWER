# Design Document

## Overview

This design makes the Deployment Notification Generator — a Vite + React 19 + TypeScript SPA (MUI, client-side `html-to-image`) — buildable as a fully static bundle and hostable on Amazon S3 static website hosting with no server-side runtime. The application is served from the bucket root so existing absolute asset paths (for example `/templates/light-mode.html`) resolve unchanged.

The work spans three areas, matching the three requirements:

1. A static-ready production build served from the bucket root, with the runtime template loader hardened to surface a recoverable, user-visible error when template fetches fail.
2. A repeatable npm deploy script built on `aws s3 sync ... --delete`.
3. Written deployment documentation covering prerequisites, the build-then-deploy sequence, and plain S3 static website hosting configuration (no CloudFront/CDN/HTTPS front).

The existing application is already client-side only. No backend is introduced or required. The changes are confined to build configuration verification, one runtime component (`templateProvider.ts`) plus its consuming UI surface for error handling, the `package.json` deploy script, and a deployment guide document.

## Architecture

### Runtime topology (deployed)

```
Browser
  │  HTTP GET /  (index.html)
  ▼
S3 Static Website Endpoint (plain HTTP, bucket root)
  ├── /index.html          ← SPA entry (also error document)
  ├── /assets/*.js,*.css    ← hashed Vite bundles (absolute /assets/ URLs)
  └── /templates/
        ├── light-mode.html ← fetched at runtime by Template_Loader
        └── dark-mode.html
```

- All application logic runs in the browser. There is no application-owned backend and no server-side rendering; S3 serves every object byte-for-byte. (Requirements 1.1, 1.2)
- Vite's `base` is left at its default `/`, so emitted asset URLs and index references are absolute and resolve against the bucket root without any base-path rewrite. (Requirement 1.3)
- The S3 error document is set to `index.html`, so requests for unmatched paths return the SPA entry and client-side navigation continues to work. (Requirement 3.2)

### Build pipeline

```
npm run build
  └── tsc -b        (type-check / project references)
  └── vite build    (bundle + copy public/ → dist/)
        └── public/templates/{light,dark}-mode.html → dist/templates/{light,dark}-mode.html
```

The template files already live under `public/templates/`. Vite copies the contents of `public/` verbatim into `dist/` at the root, so each template is retrievable at `/templates/<file>.html` from the bucket root. No plugin or custom copy step is required. (Requirements 1.4)

### Deploy pipeline

```
npm run build      → dist/
npm run deploy     → aws s3 sync dist/ s3://<bucket> --delete
```

`aws s3 sync` uploads changed files preserving the relative directory structure of `dist/`, and `--delete` removes bucket objects no longer present in `dist/`, making the deploy idempotent. Availability/credential failures and success/failure exit statuses are surfaced by the AWS CLI and propagated by npm. (Requirements 2.1, 2.2, 2.5, 2.6, 2.7)

## Components and Interfaces

### 1. Build configuration (verification only)

No code change is expected here; the design verifies the existing configuration satisfies the static-hosting contract.

| Concern | Expected state | Requirement |
|---|---|---|
| `vite.config.ts` `base` | unset → defaults to `/` (absolute asset URLs) | 1.3 |
| Template location | `public/templates/{light,dark}-mode.html` present | 1.4 |
| Build command | `tsc -b && vite build` produces `dist/` | 1.1 |
| Emitted `dist/index.html` | asset `src`/`href` begin with `/assets/` | 1.3 |
| Emitted `dist/templates/` | both templates copied verbatim | 1.4 |

If a stray duplicate template source exists (for example a top-level `Templates/` folder), the canonical runtime source remains `public/templates/`; only files under `public/` are copied into `dist/`.

### 2. Template_Loader error handling (`src/utils/templateProvider.ts` + consuming UI)

The loader already fetches `/templates/light-mode.html` and `/templates/dark-mode.html` via `fetch` and caches them. The current failure behavior is limited: `initialize()` rejects, `App.tsx` swallows the rejection at startup, and the retry entry point is coupled to a full generation attempt. This design hardens the failure path to meet Requirement 1.6: on any retrieval failure the loader must (a) reject with an error that identifies template loading as the cause, (b) reset internal state so a subsequent `initialize()` call actually retries rather than returning a cached rejected promise, and (c) expose that failure to the user with a retry affordance that does not require a full page reload.

Design changes:

- **Add a 5-second timeout to each fetch.** `loadTemplateAsync` wraps `fetch` with an `AbortController` and a 5000 ms timer so a hung request is treated as a failure rather than blocking indefinitely. (Requirements 1.5, 1.6)

  ```typescript
  private async loadTemplateAsync(path: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(path, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Failed to load template from ${path}: ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      if (controller.signal.aborted) {
        throw new Error(`Timed out loading template from ${path} after 5000ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
  ```

- **Make failed initializations retryable.** On failure, `loadTemplates` clears the cached `loadingPromise` so the next `initialize()` starts a fresh attempt (no full reload needed). A successful load leaves templates cached and `initialize()` a no-op.

  ```typescript
  async initialize(): Promise<void> {
    if (this.templates.size > 0) return;
    if (this.loadingPromise) return this.loadingPromise;
    this.loadingPromise = this.loadTemplates().catch((err) => {
      this.loadingPromise = null; // allow retry without reload
      throw err;
    });
    return this.loadingPromise;
  }
  ```

- **Surface a user-visible error with retry in the UI (`App.tsx`).** Replace the startup `catch` that only logs with state that drives a visible indication (an MUI `Alert`/`Snackbar`) reporting "Failed to load templates" and a **Retry** button that re-invokes `templateProvider.initialize()`. Because retry is an in-page state transition, no reload occurs. (Requirement 1.6)

  ```typescript
  const [templateError, setTemplateError] = React.useState<string | null>(null);
  const [templatesReady, setTemplatesReady] = React.useState(templateProvider.isLoaded());

  const loadTemplates = React.useCallback(() => {
    setTemplateError(null);
    templateProvider.initialize()
      .then(() => setTemplatesReady(true))
      .catch((e) => setTemplateError('Failed to load templates. Please retry.'));
  }, []);

  React.useEffect(() => { if (!templatesReady) loadTemplates(); }, [templatesReady, loadTemplates]);
  // Render: {templateError && <Alert severity="error" action={<Button onClick={loadTemplates}>Retry</Button>}>{templateError}</Alert>}
  ```

Public interface of `templateProvider` is unchanged (`initialize`, `getTemplate`, `isLoaded`, `setTemplate`, `clear`); only internal robustness and the consuming UI change.

### 3. Deploy script (`package.json`)

Add an npm script that syncs the built output to the bucket root. The bucket name is provided via an environment variable so the script is not hardcoded to one bucket.

```jsonc
{
  "scripts": {
    "deploy": "aws s3 sync dist/ \"s3://$DEPLOY_BUCKET\" --delete"
  }
}
```

- `dist/` is the source; the bucket root is the destination; relative structure is preserved. (Requirements 2.1, 2.2)
- `--delete` removes objects no longer in `dist/`, making repeated deploys converge the bucket to exactly `dist/`. (Requirement 2.7)
- Availability/credential errors, non-upload termination, and success/failure exit codes are handled and reported by the AWS CLI, and npm propagates the exit status. (Requirements 2.5, 2.6)

The script intentionally does not run the build; the documented workflow is `npm run build` then `npm run deploy` (Requirement 2.4), keeping build and deploy independently runnable.

### 4. Deployment documentation (`DEPLOYMENT.md`)

A concise deployment guide is added covering:

- **Prerequisites** — AWS CLI installed and on PATH; AWS credentials configured (for example via `aws configure` or environment variables) with permission to write to the target bucket; `DEPLOY_BUCKET` set to the bucket name. (Requirement 2.3)
- **Build then deploy** — ordered steps: `npm run build`, then `npm run deploy`. (Requirement 2.4)
- **S3 static website hosting configuration**:
  - Enable static website hosting and set the **index document** to `index.html`. (Requirement 3.1)
  - Set the **error document** to `index.html` so unmatched paths serve the SPA entry for client-side routing. (Requirement 3.2)
  - **Public read access** — disable the four Block Public Access settings on the bucket and attach a bucket policy granting `s3:GetObject` to `*` (anonymous) for `arn:aws:s3:::<bucket>/*`, so every object under the bucket root is readable over anonymous HTTP. (Requirement 3.3)
  - **Endpoint** — access the app via the plain S3 website endpoint (`http://<bucket>.s3-website-<region>.amazonaws.com`) over HTTP, with no CloudFront distribution or any CDN/HTTPS front. (Requirement 3.4)

Example public-read bucket policy included in the docs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<bucket>/*"
    }
  ]
}
```

> Security note: this configuration intentionally exposes the bucket contents to anonymous public read over plain HTTP, as required for a public static site with no CDN/HTTPS front. Only static, non-sensitive build artifacts should be deployed to this bucket.

## Data Models

This feature introduces no new persistent data models. The only relevant data shapes are:

- **Template cache** (existing): `Map<'light' | 'dark', string>` in `TemplateProvider`, holding the fetched HTML text per theme.
- **Template load state** (UI): `{ templatesReady: boolean; templateError: string | null }` driving the error/retry indication.
- **Deploy inputs**: `DEPLOY_BUCKET` (string, environment variable) and the on-disk `dist/` directory as the sync source.

## Error Handling

| Failure | Detection | Behavior | Requirement |
|---|---|---|---|
| Template fetch network error | `fetch` rejects | `initialize()` rejects with a template-identifying message; `loadingPromise` reset; UI shows error + Retry (no reload) | 1.6 |
| Template missing (non-2xx) | `response.ok === false` | Error includes path and status; retryable | 1.6 |
| Template fetch timeout (>5s) | `AbortController` after 5000 ms | Treated as failure with timeout message; retryable | 1.5, 1.6 |
| `getTemplate` before load | template absent in cache | Throws with guidance to initialize first (existing) | 1.6 |
| AWS CLI missing / no credentials | `aws s3 sync` non-zero exit | Script terminates without upload; CLI error reported; npm propagates failure exit | 2.5 |
| Successful deploy | `aws s3 sync` zero exit | Script exits success | 2.6 |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Per project constraints, no automated tests are written for this feature. The properties below are recorded as specifications of intended behavior. The remaining acceptance criteria are satisfied through build configuration, the deploy script, and documentation rather than input-varying code logic, so they are not expressed as properties.

### Property 1: Template load failure is always recoverable

For any template retrieval failure — network error, missing file (non-2xx response), or timeout exceeding 5 seconds — the Template_Loader ends in a state that (a) reports a user-visible error identifying that template loading failed and (b) permits a subsequent retry via `initialize()` that starts a fresh load attempt without a full page reload.

**Validates: Requirements 1.5, 1.6**

## Notes on remaining criteria (non-property)

- **1.1, 1.2, 1.3, 1.4** are satisfied by leaving Vite `base` at `/`, keeping templates under `public/templates/`, and relying on Vite's static build and public-dir copy. Verified by inspecting the emitted `dist/` (asset URLs begin with `/`; `dist/templates/` contains both files).
- **2.1, 2.2, 2.7** are satisfied by the `aws s3 sync dist/ ... --delete` script; **2.5, 2.6** by AWS CLI exit-code semantics.
- **2.3, 2.4, 3.1, 3.2, 3.3, 3.4** are satisfied by `DEPLOYMENT.md` content.
