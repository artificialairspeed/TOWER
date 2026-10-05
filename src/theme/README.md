# Theme Directory

This directory contains the theming infrastructure for the TOWER portal.

## Overview

The portal is **dark-mode only**. Both the application UI and the generated
Flight Plan artifact render from a single dark palette — there is no light mode
and no runtime theme switch. Colors follow the Southwest Airlines **"Jetstream"
(V5+)** design system: a deep navy "steel" surface scale with SWA blue as the
primary accent, and SWA amber-yellow reserved exclusively for the single
"Generate Flight Plan" call-to-action.

There is no theme type, no theme state, and no theme prop: `AppThemeProvider`
takes only `children` and always builds the dark palette.

**Generated artifacts** (the Flight Plan output) are produced from the single
dark Flight Plan template at `public/templates/flight-plan.html`. The artifact
path never consults the theme.

## Files

### `AppThemeProvider.tsx`
The Material-UI theme provider that wraps the application. It exposes the
`darkTokens` design tokens (the single source of truth for the dark palette)
and builds the MUI theme, including the Open Sans typography scale and
component-level style overrides.

**Usage:**
```tsx
import { AppThemeProvider } from './theme/AppThemeProvider';

function App() {
  return (
    <AppThemeProvider>
      {/* Your app components */}
    </AppThemeProvider>
  );
}
```

**Features:**
- Dark-only Jetstream palette applied to all MUI components
- Open Sans enforced across all typography (see below)
- `CssBaseline` baseline styles, themed scrollbar, and a WCAG 2.4.7 focus-visible ring
- Memoized theme object (`useMemo`) built once

## Typography

Open Sans is the **exclusive** font family across the entire application and the
generated artifact. The Jetstream standard permits only **two weights**:

- **400 (regular)** — body, caption, overline text
- **600 (semibold)** — all headers, subheaders, labels, buttons, and emphasis

No 300/light, 500/medium, or 700/bold weights are used. In
`AppThemeProvider.tsx` the `typography` block pins `fontWeightRegular: 400`,
`fontWeightMedium: 600`, and `fontWeightBold: 600`, and the `MuiCssBaseline`
override adds a `strong, b { font-weight: 600 }` rule so native emphasis does
not fall back to the browser's 700 (for which no face is loaded). The
flight-plan template carries the same `strong, b` pin, so the app and the
artifact agree. The base body text is 16px with a 24px line-height.

The font is loaded two ways, kept in sync:
- **Portal UI** — `index.html` requests Open Sans weights `400;600` from Google Fonts.
- **Flight Plan artifact** — `public/templates/flight-plan.html` embeds the 400
  and 600 faces as base64 `@font-face` data URIs so the isolated rasterization
  iframe needs no network request.

## Design Tokens (dark palette)

Defined as `darkTokens` in `AppThemeProvider.tsx`:

This is the complete token set — every key in `darkTokens`, nothing more.

```
Surfaces
  bg (steel100):              rgb(21, 39, 63)     — app background
  paper (steel200):           rgb(33, 51, 70)     — cards, app bar
  paperElevated (steel300):   rgb(43, 61, 79)     — raised panels / inputs
  surfaceHover (steel400):    rgb(52, 73, 94)     — hover surfaces / borders
  divider (steel500):         rgb(71, 99, 128)    — borders / dividers

Primary — SWA blue
  primary (blue500):          rgb(25, 130, 230)   — primary buttons, accents
  primaryDark (blue400):      rgb(20, 104, 184)   — primary hover
  primaryLight (blue600):     rgb(71, 155, 235)   — primary light
  primaryContrast:            rgb(255, 255, 255)  — text on blue

Secondary — same blue, MUI secondary slot
  secondary (blue500):        rgb(25, 130, 230)   — outlined controls
  secondaryDark (blue400):    rgb(20, 104, 184)
  secondaryLight (blue600):   rgb(71, 155, 235)

SWA amber — Generate Flight Plan CTA only
  swaYellow (swaYellow500):   rgb(255, 191, 0)    — CTA background
  swaYellowDark (swaYellow400):rgb(255, 174, 0)   — CTA hover
  swaYellowContrast:          rgb(21, 39, 63)     — navy text on amber

Accent — semantic alias of the template's --accent / --accent-hover
  accent (blue500):           rgb(25, 130, 230)   — text, labels, headings, links, Jira numbers
  accentHover (blue600):      rgb(71, 155, 235)   — link hover

Text
  textPrimary:                rgb(255, 255, 255)
  textSecondary (gray3):      rgb(207, 217, 219)  — muted
  textDisabled (gray5):       rgb(123, 139, 144)

Interaction states
  actionHover:                rgba(25, 130, 230, 0.08)
  actionSelected:             rgba(25, 130, 230, 0.16)
  focusRing (blue600):        rgb(71, 155, 235)   — focus-visible outlines
```

`accentHover` currently has no consumer in `src` — no app-UI element has a
link-hover state. It is kept deliberately as the semantic pair for
`--accent-hover` in `public/templates/flight-plan.html`; it is **not** a dead
token to delete.

`swaYellowLight` (`rgb(255, 204, 51)`, swaYellow600) used to sit alongside the
other amber tokens. It had no consumer and no template counterpart, so it was
deleted rather than kept; the CTA uses `swaYellow`, `swaYellowDark` and
`swaYellowContrast` only.

`primary` and `accent` hold the same blue500 value but are semantically
distinct. Prefer **`accent` / `accentHover`** for text, labels, headings, and
links; use **`primary` / `primaryLight` / `primaryDark`** (or the `secondary`
equivalents) where the element is already wired into MUI's primary/secondary
system, and **`focusRing`** for focus outlines.

The MUI `info` palette is a separate informational blue and is intentionally
**not** sourced from these tokens — do not fold it into `accent`.

## How It Works

```
Portal UI:   AppThemeProvider → MUI ThemeProvider → all UI components (dark)
Artifacts:   generateHTML() → templateProvider.getTemplate() → flight-plan.html (dark)
```

The artifact path does not branch on theme — the single dark Flight Plan
template is always used.

## Customization

To change palette colors or typography, edit `darkTokens` and the `typography`
block in `AppThemeProvider.tsx`. When changing fonts or weights, update **all
three** sources so they stay consistent:

1. `AppThemeProvider.tsx` — `OPEN_SANS_FONT_FAMILY` and the typography weights
2. `index.html` — the Google Fonts request and the global `*` fallback stack
3. `public/templates/flight-plan.html` — the embedded `@font-face` faces and the
   `strong, b` weight pin

## Accessibility

The palette targets WCAG AA contrast and every interactive element receives a
visible focus ring (WCAG 2.4.7) through the `CssBaseline` override. Neither has
been validated with assistive technology or an expert review, so no compliance
level is claimed — see the known limitations in `docs/DEVELOPER_GUIDE.md`.

## Dependencies

- `@mui/material` — Material-UI components and theming
- `react` — hooks for memoization

## Related Files

- `/src/utils/templateProvider.ts` — loads and caches the Flight Plan template
- `/public/templates/flight-plan.html` — the single dark Flight Plan artifact template
- `/index.html` — loads Open Sans (weights 400;600) and the global font fallback
