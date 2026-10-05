# TOWER

**TOWER — Takeoff Notifications for Technology Deployments.**

A browser-only React application that turns deployment metadata into a single
notification artifact: a "Flight Plan" image that a deployment coordinator can
paste into an email or a chat channel.

The coordinator fills in one deployment form, clicks **Generate Flight Plan**,
and the app injects the form data into an authored HTML template, rasterizes it
to a PNG, and opens the image in a new browser tab.

There is no backend, no authentication, and no network call other than loading
the app, the Open Sans web font, and the HTML template.

## Features

- **One guided deployment form** covering application, change number, release
  version, environment, schedule, outage indicator, change items with nested
  impact statements, and contact details.
- **Nine-application catalog** defined in `src/types/models.ts`
  (`APPLICATION_CATALOG`).
- **Validation on blur and on submit**, with per-field inline errors plus a
  summary at the top of the form.
- **Refresh-safe drafts**: the in-progress form is saved to `localStorage` under
  the key `tower:deployment-form` and restored on load. "Start New" clears both
  the form and the saved copy, behind a confirmation dialog.
- **Single PNG artifact** rendered from `public/templates/flight-plan.html` and
  opened in a new tab.
- **Dark mode only**, following the Southwest "Jetstream" (V5+) palette, with
  Open Sans as the only font.

## Tech stack

| Area | Choice |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Build tool | Vite 8 (Rolldown) |
| UI library | MUI 9 (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`) |
| Dates | `date-fns` (MUI picker adapter) + `Intl.DateTimeFormat` for display |
| Image generation | `html-to-image` |
| Hosting | Static S3 website |

## Getting started

### Prerequisites

Node.js 20.19+ or 22.12+ (Vite 8's requirement) and a matching npm. Development
is done on Node 24.

### Quick start

```bash
git clone <repository-url>
cd TOWER
npm install
npm run dev
# open http://localhost:5173
```

## npm scripts

These four are the only scripts defined in `package.json`:

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | `tsc -b tsconfig.build.json && vite build` → `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run deploy` | `aws s3 sync dist/ "s3://$DEPLOY_BUCKET" --delete` |

## Verification

**There is no automated test suite and no linter configured in this repository.
`npm run build` is the verification gate** — it runs the full TypeScript project
build (strict mode, `noUnusedLocals`, `noUncheckedIndexedAccess`) before Vite
bundles. A change is verified when `npm run build` exits 0 and the affected
screen has been checked in the browser under `npm run dev`.

## Deployment

The output is a static SPA, deployable to any static host. For the S3 setup this
project uses — bucket configuration, the public-read policy and its security
implications, and the build-then-deploy ordering — see
[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

```bash
npm run build
DEPLOY_BUCKET="my-bucket-name" npm run deploy
```

## Repository layout

```
index.html                 # Vite entry; favicons, Open Sans, .sr-only utility
src/
├── App.tsx                # Shell: header, actions, alerts, dialogs
├── main.tsx               # React root
├── components/            # Form sections (see Developer Guide)
├── data/formFactory.ts     # Default form + item factories
├── hooks/                 # Form state, validation errors, generation, reset
├── theme/                 # AppThemeProvider + darkTokens (see theme/README.md)
├── types/models.ts        # Domain types + APPLICATION_CATALOG
└── utils/                 # Validation, formatting, template, artifact pipeline
public/
├── templates/flight-plan.html   # The one artifact template
├── southwest-logo.svg           # App header logo
└── favicons + site.webmanifest
docs/                      # Developer Guide, Deployment Guide
.kiro/specs/               # Requirements / design / tasks per feature
```

## Documentation

- **[docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)** — architecture, data
  model, the template token contract, known limitations, and open items.
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — S3 static hosting and deploy.
- **[src/theme/README.md](./src/theme/README.md)** — palette tokens and the
  two-weight typography rule.

### Specifications

`.kiro/specs/` holds the requirements, design, and task breakdown for each
feature. Current intended behaviour lives in
[`flight-plan-redesign`](./.kiro/specs/flight-plan-redesign/requirements.md).
[`deployment-notification-generator`](./.kiro/specs/deployment-notification-generator/requirements.md)
is the original spec and is **superseded** — it describes multiple simultaneous
forms, a theme selector, and PDF output, none of which exist.
[`s3-static-hosting`](./.kiro/specs/s3-static-hosting/requirements.md) matches
the live deploy script.

## Known limitations

- **Pop-ups required**: the generated PNG opens in a new tab. If the pop-up is
  blocked the app says so, but the image is not saved anywhere.
- **No download**: nothing is written to disk. `generateBaseFileName` computes
  an `<App>_<Env>_<CHG#>_<YYYYMMDD>` name that is carried through the artifact
  bundle but never applied — see the open items in the Developer Guide.
- **Fixed catalog**: the nine applications are compiled in, not configurable at
  runtime.
- **Fixed template**: changing the artifact design means editing
  `public/templates/flight-plan.html` and rebuilding.
- **Accessibility not independently validated**: the app uses semantic
  landmarks, labelled controls, `aria-describedby` hints, and a visible focus
  ring, but no assistive-technology testing or expert WCAG review has been
  performed. Treat compliance as unverified.

## Contributing

1. Read [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md).
2. Match the existing TypeScript and React conventions in the file you touch.
3. Run `npm run build` (must exit 0) and check the affected screen in the
   browser before opening a pull request.
4. Reference the relevant spec and task number in the commit message.
