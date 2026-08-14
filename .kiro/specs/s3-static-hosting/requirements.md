# Requirements Document

## Introduction

This feature enables the Deployment Notification Generator (a Vite + React 19 + TypeScript single-page application using MUI and client-side `html-to-image`) to be built as a fully static bundle and hosted on Amazon S3 static website hosting without any server-side runtime. The application is served from the S3 bucket root, so existing absolute asset paths (for example `/templates/light-mode.html`) resolve correctly. The scope covers three areas: a static-ready production build, a repeatable deployment script with brief documentation, and S3 website hosting configuration guidance using plain S3 (no CloudFront or CDN/HTTPS front assumptions).

## Glossary

- **Static_App**: The compiled, client-side-only production bundle of the Deployment Notification Generator produced by the build process.
- **Build_Process**: The npm `build` command (`tsc -b && vite build`) that produces the `dist/` output directory.
- **Deploy_Script**: The npm script that synchronizes the built `dist/` directory to the target S3 bucket using the AWS CLI (`aws s3 sync`).
- **Deploy_Docs**: The written deployment instructions describing prerequisites, S3 configuration, and the deploy command.
- **S3_Bucket**: The Amazon S3 bucket configured for static website hosting that serves the Static_App.
- **Template_Loader**: The runtime component (`templateProvider.ts`) that fetches `/templates/light-mode.html` and `/templates/dark-mode.html` at runtime.
- **Bucket_Root**: The top-level path of the S3_Bucket website, from which the Static_App is served so that absolute paths resolve as-is.

## Requirements

### Requirement 1: Static-ready production build

**User Story:** As a developer, I want the production build to be fully static and S3-ready, so that the application runs on S3 with no server-side runtime.

#### Acceptance Criteria

1. WHEN the Build_Process runs to completion, THE Build_Process SHALL produce a `dist/` directory whose entire contents are static files (HTML, CSS, JavaScript, and static resource files such as images, fonts, and HTML templates) that are served byte-for-byte without any server-side execution, dynamic rendering, or runtime process.
2. THE Static_App SHALL execute all application logic in the browser client, with zero runtime calls to a backend server owned by the application and no reliance on server-side rendering to produce any rendered view.
3. WHERE the Static_App is served from the Bucket_Root, THE Static_App SHALL reference all assets and templates using absolute paths beginning with `/` that resolve relative to the Bucket_Root, such that no base-path rewrite is required for the assets to load.
4. WHEN the Build_Process runs to completion, THE Build_Process SHALL copy `templates/light-mode.html` and `templates/dark-mode.html` into the `dist/` output so that each file is retrievable at the `/templates/` path from the Bucket_Root.
5. WHEN the Static_App loads in a browser served from the Bucket_Root, THE Template_Loader SHALL retrieve the full text content of `/templates/light-mode.html` and `/templates/dark-mode.html` from the S3_Bucket within 5 seconds each, without a network or parse error.
6. IF the Template_Loader fails to retrieve `/templates/light-mode.html` or `/templates/dark-mode.html` (network error, missing file, or timeout exceeding 5 seconds), THEN THE Template_Loader SHALL surface a user-visible error indication identifying that template loading failed, and SHALL leave the application in a state that permits a retry without a full reload.

### Requirement 2: Deploy script and documentation

**User Story:** As a developer, I want an npm deploy script and brief documentation, so that I can deploy the built application to S3 repeatably.

#### Acceptance Criteria

1. THE package configuration SHALL include a Deploy_Script that synchronizes the `dist/` directory to the Bucket_Root of the S3_Bucket using the AWS CLI `aws s3 sync` command, preserving the relative directory structure of `dist/`.
2. WHEN the Deploy_Script runs after the Build_Process completes, THE Deploy_Script SHALL upload every file contained in `dist/` to the S3_Bucket at paths matching each file's location relative to `dist/`.
3. THE Deploy_Docs SHALL describe the prerequisites for deployment, including AWS CLI availability and AWS credentials configured with permission to write to the S3_Bucket.
4. THE Deploy_Docs SHALL describe the ordered sequence of first running the Build_Process and then running the Deploy_Script.
5. IF the AWS CLI is not available or AWS credentials are not configured when the Deploy_Script runs, THEN THE Deploy_Script SHALL terminate without uploading any files and report the error returned by the AWS CLI.
6. WHEN the Deploy_Script completes uploading all files without error, THE Deploy_Script SHALL terminate with a success exit status.
7. WHEN the Deploy_Script runs again after a previous successful deployment, THE Deploy_Script SHALL make the contents of the S3_Bucket at the Bucket_Root match the current contents of `dist/`, including removing previously deployed objects that are no longer present in `dist/`.

### Requirement 3: S3 static website hosting configuration

**User Story:** As a developer, I want S3 static website hosting configuration guidance, so that the bucket serves the SPA correctly using plain S3.

#### Acceptance Criteria

1. THE Deploy_Docs SHALL describe enabling S3 static website hosting on the S3_Bucket and setting the index document to `index.html`.
2. THE Deploy_Docs SHALL describe setting the S3_Bucket error document to `index.html` so that any request for a path with no matching object is served the `index.html` document, enabling client-side SPA navigation.
3. THE Deploy_Docs SHALL describe the S3_Bucket access configuration required to allow unauthenticated (anonymous) HTTP read access to every object under the Bucket_Root, including the bucket policy granting public read and the Block Public Access settings that must be disabled to permit it.
4. THE Deploy_Docs SHALL describe serving the Static_App from the Bucket_Root using the plain S3 static website endpoint over HTTP, without a CloudFront distribution or any CDN/HTTPS front.
