# Deployment Guide

This guide describes how to deploy the Deployment Notification Generator as a fully
static bundle to Amazon S3 static website hosting. The application is client-side only
and runs entirely in the browser with no server-side runtime.

## Prerequisites

Before deploying, make sure the following are in place:

- **AWS CLI installed and on your `PATH`.** Verify with `aws --version`. If the command
  is not found, install the AWS CLI and ensure its location is included in your `PATH`.
- **AWS credentials configured with write permission to the target bucket.** Configure
  credentials via `aws configure` or environment variables
  (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and optionally `AWS_SESSION_TOKEN` /
  `AWS_DEFAULT_REGION`). The credentials must grant permission to write objects to the
  destination S3 bucket (for example `s3:PutObject`, `s3:DeleteObject`, and
  `s3:ListBucket`). Verify access with `aws sts get-caller-identity`.
- **`DEPLOY_BUCKET` set to the target bucket name.** The deploy script reads the bucket
  name from the `DEPLOY_BUCKET` environment variable. Set it to the name of the bucket
  that serves the site (the bucket name only, without the `s3://` prefix):

  ```bash
  export DEPLOY_BUCKET=your-bucket-name
  ```

## Build and Deploy

Deployment is a two-step, ordered workflow. Always build first, then deploy.

1. **Build the static bundle.** This runs `tsc -b && vite build` and produces the
   `dist/` output directory containing the fully static site:

   ```bash
   npm run build
   ```

2. **Deploy the built output to S3.** This synchronizes the contents of `dist/` to the
   bucket root using `aws s3 sync ... --delete`, uploading changed files and removing
   objects that are no longer present in `dist/`:

   ```bash
   npm run deploy
   ```

The build and deploy steps are independent commands. The deploy script does not run the
build, so you must complete `npm run build` before running `npm run deploy` to ensure
`dist/` reflects your latest changes. If the AWS CLI is unavailable or credentials are
not configured, the deploy step terminates without uploading and reports the error
returned by the AWS CLI.

## S3 Static Website Hosting Configuration

Configure the target S3 bucket to serve the built site as a static website over plain
HTTP. All of the following settings are applied to the same bucket named in
`DEPLOY_BUCKET`.

### Enable static website hosting

Turn on **Static website hosting** for the bucket and set the documents as follows:

- **Index document:** `index.html` — the SPA entry point served from the bucket root.
- **Error document:** `index.html` — any request for a path that has no matching object
  is served `index.html` instead. This routes unmatched paths back to the single-page
  app so that client-side (SPA) navigation continues to work rather than returning an
  S3 error page.

You can enable this in the S3 console under **Properties → Static website hosting**, or
with the AWS CLI:

```bash
aws s3 website "s3://$DEPLOY_BUCKET" \
  --index-document index.html \
  --error-document index.html
```

### Allow anonymous public read access

Because the site is served directly from S3 with no authenticated front, every object
under the bucket root must be readable over anonymous HTTP. This requires two changes:

1. **Disable Block Public Access.** In the S3 console under
   **Permissions → Block public access (bucket settings)**, turn off all four settings:
   - Block public access to buckets and objects granted through *new* access control
     lists (ACLs)
   - Block public access to buckets and objects granted through *any* access control
     lists (ACLs)
   - Block public access to buckets and objects granted through *new* public bucket or
     access point policies
   - Block public access to buckets and objects granted through *any* public bucket or
     access point policies

   With all four disabled, a public-read bucket policy is permitted to take effect.

2. **Attach a public-read bucket policy.** Add a bucket policy that grants
   `s3:GetObject` to everyone (`"Principal": "*"`, i.e. anonymous requests) for every
   object under the bucket (`arn:aws:s3:::<bucket>/*`). Replace `<bucket>` with your
   actual bucket name:

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

> **Security note:** This configuration intentionally exposes the bucket contents to
> anonymous public read over plain HTTP, as required for a public static site with no
> CDN/HTTPS front. Anyone on the internet can read every object under the bucket root.
> Only deploy static, non-sensitive build artifacts to this bucket — never secrets,
> credentials, or private data.

### Access the app via the S3 website endpoint

Serve and access the app directly from the plain S3 static website endpoint over HTTP.
The endpoint follows this form (the exact host depends on the bucket's region):

```
http://<bucket>.s3-website-<region>.amazonaws.com
```

There is no CloudFront distribution and no CDN or HTTPS front in this setup — requests
go straight to the S3 website endpoint over HTTP. The app is served from the bucket
root, so the absolute asset and template paths (for example `/assets/...` and
`/templates/light-mode.html`) resolve correctly without any base-path rewrite.
