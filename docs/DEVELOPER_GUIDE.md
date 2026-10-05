# TOWER — Developer Guide

Working reference for TOWER (Takeoff Notifications for Technology Deployments):
how the app is put together, what the data model is, how the artifact is
produced, and what is deliberately unfinished.

For setup and the npm scripts, see the [README](../README.md). For S3 hosting,
see [DEPLOYMENT.md](./DEPLOYMENT.md). For the palette and typography rules, see
[src/theme/README.md](../src/theme/README.md).

---

## 1. Verification

**No test runner and no linter are configured in this repository.
`npm run build` is the verification gate.**

```bash
npm run build     # tsc -b tsconfig.build.json && vite build — must exit 0
```

The TypeScript project build runs with `strict`, `noUnusedLocals`,
`noUnusedParameters`, `noFallthroughCasesInSwitch`, and
`noUncheckedIndexedAccess`, so unused code and unchecked index access fail the
build. What the compiler cannot catch — layout, ARIA wiring, and the rendered
PNG — has to be checked by hand in `npm run dev`.

Because a type-correct behavioural regression ships silently, adding a test
runner is the highest-value investment this repository could make. See
[Open items](#8-open-items).

---

## 2. Architecture

Three layers, with state prop-drilled from `App.tsx`. There is no React Context
and no state library.

```
┌───────────────────────────────────────────────────────────────┐
│ PRESENTATION   App.tsx → FormManager → DeploymentForm →       │
│                section components. Form state lives in        │
│                useFormManager; validation errors in           │
│                useValidationErrors.                           │
├───────────────────────────────────────────────────────────────┤
│ DOMAIN         validators.ts (field + form rules)             │
│                formatters.ts (masks, escaping, token inject)  │
│                fileNaming.ts (base artifact name)             │
│                formPersistence.ts (localStorage round-trip)   │
├───────────────────────────────────────────────────────────────┤
│ OUTPUT         templateProvider.ts (fetch + cache template)   │
│                htmlGenerator.ts  (template + data → HTML)     │
│                bundleBuilder.ts  (HTML + file name → bundle)  │
│                artifactGeneration.ts (HTML → PNG blob)        │
│                artifactDelivery.ts   (open PNG in a new tab)  │
└───────────────────────────────────────────────────────────────┘
```

### Component tree

```
App                              (src/App.tsx)
├── AppThemeProvider              dark MUI theme + CssBaseline
├── header                        Southwest logo, "TOWER", Start New,
│                                 Generate Flight Plan
├── Alert  (template load failed, with Retry)
├── Alert  (empty application catalog)
├── Alert  (validation failed — count only)
├── FormManager                   (src/components/FormManager.tsx)
│   └── DeploymentForm            (src/components/DeploymentForm.tsx)
│       ├── ValidationErrorSummary        shown when the form has errors
│       ├── ApplicationSelector           catalog dropdown
│       ├── DeploymentInfoSection ×3      one instance per field:
│       │                                 environmentOnly / changeNumberOnly /
│       │                                 releaseVersionOnly
│       ├── ScheduleSection               two DateTimePickers + outage radios
│       ├── ChangeItemsSection            list of change items
│       │   └── ChangeItemRow  (per item)
│       │       └── ImpactSection         that item's impact statements
│       │           └── ImpactItemRow  (per impact)
│       └── ContactSection                name, email, optional phone
├── Snackbar                      generation result / popup-blocked notice
└── Dialog                        "Start a new form?" confirmation
```

`ApplicationSelector` and `DeploymentInfoSection` sit in a single four-across
row owned by `DeploymentForm`, which also renders the "Deployment Information"
heading. That is why `DeploymentInfoSection` takes the three `*Only` flags:
exactly one must be set per instance.

Impact items are **children of a change item** (`ChangeItem.impactItems`), not a
form-level list — `ImpactSection` renders inside each row.

Every leaf component is wrapped in `React.memo`. The wrappers are currently
inert because the parents pass freshly-allocated inline arrows on each render;
see [Open items](#8-open-items).

### Hooks

| Hook | Responsibility |
|---|---|
| `useFormManager` | Owns the single `DeploymentFormData`. Rehydrates from `localStorage` on mount, debounces the write back (400 ms), and clears both on reset. |
| `useValidationErrors` | `formId → field → message` map. `setErrors` (batch), `setFieldError` (blur), `clearFieldError`, `clearAllErrors`, `getAllErrors`. |
| `useOutputGenerator` | Validate → build bundle → deliver. Exposes `state`, `validationResult`, `deliveryResult`, `isGenerating`. |
| `useResetConfirmation` | Open/confirm/cancel state for the "Start New" dialog. |

---

## 3. Data flow

**Editing.** A section's `onChange` calls `DeploymentForm.handleFieldUpdate`,
which forwards the partial update to `useFormManager.updateForm` and clears that
field's validation error. The persistence effect schedules a debounced
`localStorage` write.

**Blur validation.** `onBlurValidate(field, value)` runs
`validateFieldOnBlur`, which checks format and length only — never
"required" — so tabbing through an empty field does not light it up red.

**Generate.** `App.handleGenerateOutputs` → `useOutputGenerator.generateOutputs`:

1. `validateForGeneration(form, catalogEmpty)` — the catalog check plus the full
   `validateForm` pass. On failure, state becomes `error`, errors are pushed
   into `useValidationErrors`, and nothing is generated.
2. `buildArtifactBundle(form)` — computes the base file name, then
   `generateHTML(form)` injects the form data into the cached template.
3. `deliverArtifact(bundle)` — `openPNGInNewTab` writes the HTML into an
   offscreen iframe, rasterizes the iframe body with `html-to-image`
   (`pixelRatio` ≥ 3), and opens the blob URL in a new tab.
4. The `DeliveryResult` drives the snackbar. A blocked pop-up counts as
   **successful** (the image rendered) with `popupBlocked: true`.

**Error display.** `validateForm` emits flat `ValidationError` records.
`DeploymentForm` splits them three ways: exact field matches go to the matching
section, `changeItems[i].jiraNumber` / `.description` are re-keyed by change-item
**id** for `ChangeItemsSection`, and
`changeItems[i].impactItems[j].text` is passed through verbatim for
`ImpactSection`. `ValidationErrorSummary` lists all of them at the top.

---

## 4. Data model

Defined in `src/types/models.ts`.

```ts
type Environment = 'PROD' | 'QA' | 'ITEST' | 'DEV';

interface Application { id: string; name: string; }

interface ImpactItem { id: string; text: string; }        // 1-500 chars

interface ChangeItem {
  id: string;
  jiraNumber: string;        // 1-50 chars, upper-cased on input
  description: string;       // 1-500 chars
  impactItems: ImpactItem[]; // 0-100, optional children
}

interface DeploymentFormData {
  formId: string;
  application: Application | null;
  changeNumber: string;         // digits only, up to 8; "CHG" added at display time
  releaseVersion: string;       // YYYY.#.# mask, 8 chars
  environment: Environment | null;
  startDateTime: Date;          // default tomorrow 20:00
  endDateTime: Date;            // default tomorrow 22:00
  hasOutage: boolean;
  changeItems: ChangeItem[];    // starts empty; 1-999 required at submit
  contactName: string;          // required, ≤255
  contactEmail: string;         // required, ≤255, email format
  contactPhone: string;         // optional; (###) ###-#### when provided
}
```

Validation outcome types: `ValidationError { formId, field, message }` and
`ValidationResult { isValid, errors }`.

Artifact types: `ArtifactBundle { formId, htmlContent, fileName, formData }`,
`DeliveryResult { total, successful, failed, errors, popupBlocked }`, and
`GenerationError { formId, artifactType: 'PNG', message, error? }`.

`APPLICATION_CATALOG` holds **nine** applications: OQS Scheduling, OQS
Recordkeeping, OQS SimLog, Line Check Solver, TRIO, ROSA, IDCAT, SPT, Other.

### Validation rules

| Field | Rule |
|---|---|
| Application | required |
| Change Number | required, 1–8 digits |
| Release Version | required, `YYYY.#.#` |
| Environment | required |
| Start / End | required; End must be later than Start |
| Change Items | 1–999; each needs a Jira number (≤50) and a description (≤500) |
| Impact Items | 0–100 per change item; each non-empty, ≤500 |
| Contact Name | required, ≤255 |
| Email | required, ≤255, `local@domain.tld` |
| Phone | optional; when present must match `(###) ###-####` |

Shared message strings live in the `MESSAGES` constant at the top of
`validators.ts` so the blur-time and submit-time validators cannot drift apart.
`ValidationErrorSummary` pattern-matches on `'is required'` and
`'Please select'`, so those two phrasings must not change.

---

## 5. Form persistence

`src/utils/formPersistence.ts` stores a versioned payload under the
`localStorage` key **`tower:deployment-form`**:

```json
{ "version": 2, "form": { /* DeploymentFormData */ } }
```

- `saveForm` is best-effort. A quota or serialization failure is logged as a
  warning and ignored, so persistence can never break editing.
- `loadForm` discards anything that is not `version: 2`, and `reviveForm`
  re-validates every field the UI dereferences without a guard (including the
  shape of `changeItems` and each item's `impactItems`) before accepting the
  payload. `Date` fields are reconstructed from their ISO strings. Any failure
  removes the key and returns `null`, so the app falls back to a fresh default
  form rather than rendering a broken one.
- `STORAGE_VERSION` must be bumped on any backwards-incompatible shape change.
- The key is a persistence contract. Renaming it silently discards every user's
  in-progress form.

---

## 6. The artifact template and its token contract

`public/templates/flight-plan.html` is the only template. `templateProvider`
fetches it from `/templates/flight-plan.html` with a 5-second timeout, caches it
in memory, and resets its cached promise on failure so the in-page **Retry**
starts a fresh attempt. `vite build` copies `public/` into `dist/`, so the
template ships at `dist/templates/flight-plan.html`.

`injectTemplate` in `src/utils/formatters.ts` is the only writer of template
tokens. The contract is closed in both directions: every token below appears in
the template, and the template contains no token that is not listed here.

| Token | Value | Escaping |
|---|---|---|
| `{{APPLICATION}}` | Application name | HTML-escaped |
| `{{ENVIRONMENT}}` | Environment; `PROD` rendered as `PRODUCTION` | HTML-escaped |
| `{{CHANGE_NUMBER}}` | Change number with the `CHG` prefix | HTML-escaped |
| `{{RELEASE}}` | `PI {YYYY.#.#}` | HTML-escaped |
| `{{SCHEDULE}}` | Formatted date + time window | generated, no user text |
| `{{OUTAGE_INDICATOR}}` | `Yes` or `No` | generated |
| `{{JIRA_ITEMS}}` | Change-item markup, each with nested impact bullets | pre-escaped HTML |
| `{{CONTACT}}` | Name / email / optional phone, `<br>`-joined | pre-escaped HTML |

**Adding or removing a token requires editing both files in the same change.** A
token present in only one place either renders as literal `{{TOKEN}}` text in
the PNG or silently drops data.

The markup `injectTemplate` emits is styled by class name in the template:
`.change-group` per change item and `.impact-sub` for its impact bullets. Those
class names are a contract between the two files.

The template embeds its Open Sans faces and the Southwest wordmark as base64
data URIs on purpose: the rasterization iframe must not make network requests.
That means the wordmark exists twice — `public/southwest-logo.svg` for the app
header and the inline copy for the artifact — so a brand-asset update needs both
edits.

---

## 7. Known limitations

1. **Pop-ups required.** The PNG opens in a new tab. If it is blocked, the
   snackbar says so, but the image is not saved.
2. **Nothing is downloaded.** `generateBaseFileName` produces
   `<Application>_<Environment>_<CHG#>_<YYYYMMDD>`, which is carried through the
   bundle and used only as a non-empty completeness guard. No file reaches the
   user with that name.
3. **Fixed catalog.** The nine applications are compiled into
   `src/types/models.ts`.
4. **Fixed template.** Changing the artifact design means editing
   `public/templates/flight-plan.html` and rebuilding.
5. **Dark mode only.** No light template, no theme switch.
6. **One form at a time.** There is no queue or batch mode.
7. **Bundle size.** The production chunk is ~750 kB raw / ~225 kB gzipped and
   trips Vite's 500 kB warning. MUI and the date pickers dominate.
8. **Accessibility is unverified.** The app uses semantic landmarks, labelled
   controls, `aria-describedby` help and error targets, and a visible
   focus-visible ring. No assistive-technology testing and no expert WCAG review
   has been performed, so no compliance level is claimed. Full WCAG 2.1 AA
   validation requires manual testing with real screen readers plus expert
   review; no automated tool substitutes for it.
9. **The per-change-item impact ceiling is summary-only.** `validateForm` emits
   `changeItems[i].impactItems` ("Maximum of 100 Impact Items allowed") when one
   change item exceeds 100 impacts. That error renders in the validation summary
   as "Change Item 1 › Impact Items" but has no inline, field-adjacent home: the
   error-splitting `useMemo` in `DeploymentForm.tsx` buckets only
   `changeItems[i].jiraNumber` / `.description` and
   `changeItems[i].impactItems[j].text`. Extend that `useMemo` with a
   section-level bucket keyed by change-item id if this ever needs an inline
   affordance. Reaching it requires 100 impacts on a single change item, so the
   practical exposure is near zero.

### Security notes

- All user text reaching the artifact goes through `escapeHtml` before
  injection. The two HTML-valued tokens (`{{JIRA_ITEMS}}`, `{{CONTACT}}`) are
  assembled from already-escaped parts.
- `localStorage` **is** used by default for the in-progress form. The data never
  leaves the browser, but it persists until the user clears the form or the
  browser storage. Do not enter anything sensitive.
- The S3 hosting configuration serves the bucket over anonymous public HTTP —
  see the security note in [DEPLOYMENT.md](./DEPLOYMENT.md). Deploy build output
  only.

---

## 8. Open items

Each of these is a known gap with a decision attached, not a bug to be fixed
quietly.

| Item | Status |
|---|---|
| **Named download for the PNG** | `fileNaming.ts` computes a name nothing uses. Restoring an `<a download>` click before `window.open` would make the documented naming convention real, but it changes what the user receives. Needs product sign-off. |
| **Flight-plan template vs. its spec** | `public/templates/flight-plan.html` has drifted from `.kiro/specs/flight-plan-redesign/`: the shipped card is 600px with square corners, a base64 Southwest wordmark, and a footer stripe; the spec asks for 1100px, an 8px radius, a TOWER wordmark with a takeoff icon, a red top stripe, and explicitly no Southwest logo. The code, the template, and the rendered PNG agree with each other. Which one is authoritative needs product sign-off. |
| **Inert `React.memo` wrappers** | Every leaf component is memoized, and every parent passes new inline arrows per render, so no memo comparison ever short-circuits. Either `useCallback` the handlers in `DeploymentForm` / `FormManager` or drop the wrappers. Doing it piecemeal risks a stale-closure bug that compiles and renders cleanly, so it needs care and manual verification. |
| **`DeploymentInfoSection` three-way split** | Each of the three instances receives the full nine-prop surface and ignores two thirds of it. Splitting into `ChangeNumberField`, `ReleaseVersionField`, and `EnvironmentField` would remove the `*Only` flags. Behaviour-preserving but it moves rendered markup, so the four-across row and the `CHG` / `PI` adornments must be re-checked at `xs` and `sm`. |
| **No test runner** | The highest-value additions would be pure-function tests over `injectTemplate` (no token survives injection; every field value appears in the output) and `validators.validateForm` — neither needs a DOM. Requires adding a test dependency. |
| **No linter** | ESLint with `react-hooks` and `jsx-a11y` would have caught several defects found by manual audit, including a wrong `useCallback` dependency array and dangling `aria-describedby` targets. Requires adding dependencies. |
| **273 kB `tower-icon.svg`** | Served as the primary favicon on every page load, roughly a third of the gzipped JS bundle. Almost certainly a traced raster; it should be re-exported or replaced with a hand-authored SVG. |
| **Rasterization height** | `artifactGeneration.ts` uses a fixed 1600px iframe height and a 1-second fallback timer for font decoding. `html-to-image` measures the node's own box so a tall card should still capture fully, but neither bound has been stress-tested against a 20-change-item form. |

---

## 9. Troubleshooting

**"Template load failed" banner.** The fetch of
`/templates/flight-plan.html` failed or timed out (5 s). Click **Retry** — it
starts a fresh attempt without a page reload. If it keeps failing, confirm the
file exists in `dist/templates/` (it is copied from `public/`) and that the host
serves it. The Generate button stays disabled until the template is loaded.

**Generate does nothing.** Check the validation summary at the top of the form.
Generation is blocked until every rule in
[section 4](#4-data-model) passes.

**The PNG never appears.** The browser blocked the pop-up. The snackbar reports
it; allow pop-ups for the origin and generate again.

**The form came back empty after a refresh.** The persisted payload failed
revival and was discarded — this is the designed fail-safe. The browser console
carries the warning.

**`npm run build` fails on an unused import.** `noUnusedLocals` and
`noUnusedParameters` are on. Remove the symbol rather than suppressing it.

---

## 10. Versions

From `package.json`:

| Package | Version |
|---|---|
| react / react-dom | ^19.2.7 |
| typescript | ^7.0.2 |
| vite | ^8.1.5 |
| @vitejs/plugin-react | ^6.0.3 |
| @mui/material, @mui/icons-material | ^9.2.0 |
| @mui/x-date-pickers | ^9.10.0 |
| date-fns | ^4.4.0 |
| html-to-image | ^1.11.13 |
| @emotion/react, @emotion/styled | ^11.14.x |
