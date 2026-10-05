# Requirements Document

## Introduction

TOWER ("Takeoff Notifications for Technology Deployments") generates a deployment notification artifact — the "Generate Flight Plan" output — by injecting form data into an authored HTML template and rasterizing that template to a PNG that opens in a new browser tab.

Today the project ships two authored templates (`public/templates/light-mode.html` and `public/templates/dark-mode.html`). Both load the Inter web font from a remote CDN (`rsms.me`), embed a Southwest heart logo and a Crew Training logo, and are selected through a Theme-to-template mapping. The portal UI is already dark-mode only, so the light template and the theme mapping are effectively dead weight, and the remote font is unreliable during rasterization.

This feature replaces both templates with a single, from-scratch dark HTML design that matches the TOWER application chrome and the Southwest Jetstream (V5) design system and palette. The redesign changes only the authored HTML/CSS and the small amount of plumbing that selects a template; it preserves the token-injection contract, every existing content field, the fixed card width, and the existing "rasterize to PNG and open in a new tab" delivery behavior. The old templates and the theme mapping are retired, and documentation (and any tests) that reference the two templates are reconciled.

This is a front-end template redesign plus a plumbing simplification. It introduces no new authentication, no new network surface, and no new backend dependency.

## Glossary

- **TOWER_Portal**: The React single-page application that collects deployment data and produces the Flight Plan notification. The portal UI renders in dark mode only.
- **Flight_Plan**: The deployment notification output produced by the "Generate Flight Plan" action.
- **Flight_Plan_Template**: The single new authored HTML template file (under `public/templates/`) that renders the Flight_Plan in the dark Jetstream theme. Replaces both `light-mode.html` and `dark-mode.html`.
- **Jetstream_Palette**: The Southwest "Jetstream" (V5) dark color tokens defined in `src/theme/AppThemeProvider.tsx` (`darkTokens`), reused by the Flight_Plan_Template.
- **Token_Injector**: The `injectTemplate()` function in `src/utils/formatters.ts` that replaces template tokens with deployment data.
- **Template_Loader**: The runtime component (`src/utils/templateProvider.ts`) that fetches and caches the notification template from the `/templates/` path.
- **Artifact_Generator**: The code path (`generateHTML` in `src/utils/htmlGenerator.ts` and `src/utils/artifactGeneration.ts`, via `src/utils/bundleBuilder.ts`) that loads the template and injects data to produce the populated HTML.
- **Artifact_Delivery**: The code path (`deliverArtifact` / `openAndDownloadPNG` in `src/utils/artifactDelivery.ts` and `src/utils/artifactGeneration.ts`) that rasterizes the populated HTML to a PNG and opens it in a new browser tab.
- **Render_Container**: The off-screen element (1148px wide: a 1100px card plus 24px of padding on each side) into which the populated template is placed for rasterization.
- **Build_Process**: The `npm run build` step (`tsc -b` + `vite build`) that copies `public/templates/` content into `dist/templates/`.
- **Change_Group**: The HTML block (CSS class `.change-group`) that the Token_Injector emits for each change item within `{{JIRA_ITEMS}}`, containing a `<strong>` Jira number, a description, and nested impact bullets.
- **Impact_Sub**: The nested HTML block (CSS class `.impact-sub`) that the Token_Injector emits for a change item's impact bullets within `{{JIRA_ITEMS}}`.
- **Content_Token**: A template token the Token_Injector populates with deployment content: `{{NOTIFICATION_HEADER}}`, `{{DEPLOYMENT_TITLE}}`, `{{DEPLOYMENT_SUBTITLE}}`, `{{SCHEDULE}}`, `{{OUTAGE_INDICATOR}}`, `{{JIRA_ITEMS}}`, and `{{CONTACT}}`.
- **Legacy_Alias**: A backward-compatibility token the Token_Injector still replaces: `{{DEPLOYMENT_ID}}`, `{{DEPLOYMENT_SCHEDULE}}`, `{{OUTAGE_WINDOW}}`, `{{CHANGE_ITEMS}}`, `{{CONTACT_NAME}}`, `{{CONTACT_EMAIL}}`, and `{{CONTACT_PHONE}}`.
- **Redesign**: The complete set of changes delivered by this feature — the new Flight_Plan_Template, the plumbing simplification, the retirement of the two old templates, and the test and documentation updates.

## Requirements

### Requirement 1: Single dark Flight Plan template

**User Story:** As a deployment coordinator, I want one dark notification design, so that every generated Flight Plan matches the TOWER app with no theme ambiguity.

#### Acceptance Criteria

1. THE Flight_Plan_Template SHALL be a single authored HTML document that renders the Flight_Plan in the dark Jetstream theme.
2. THE Flight_Plan_Template SHALL reside as an authored `.html` file under `public/templates/`.
3. WHEN the Artifact_Generator produces a Flight_Plan, THE Artifact_Generator SHALL use the Flight_Plan_Template as the only notification template.
4. WHILE producing any Flight_Plan, THE Artifact_Generator SHALL apply the Flight_Plan_Template regardless of any theme value supplied by the caller.

### Requirement 2: Jetstream dark visual design

**User Story:** As a stakeholder receiving a Flight Plan, I want a clean, on-brand card, so that the output looks like it belongs to the TOWER application.

#### Acceptance Criteria

1. THE Flight_Plan_Template SHALL render the page background in `rgb(21, 39, 63)` and the notification card surface in `rgb(33, 51, 70)`.
2. THE Flight_Plan_Template SHALL render raised regions in `rgb(43, 61, 79)` and divider lines in `rgb(71, 99, 128)`.
3. THE Flight_Plan_Template SHALL render primary text in `rgb(255, 255, 255)`, secondary text in `rgb(207, 217, 219)`, and tertiary text in `rgb(123, 139, 144)`.
4. THE Flight_Plan_Template SHALL use SWA blue `rgb(25, 130, 230)` as the primary accent color.
5. THE Flight_Plan_Template SHALL render a top accent stripe in SWA red `#e31837`.
6. THE Flight_Plan_Template SHALL use amber-yellow `rgb(255, 191, 0)` for at most one accent element, consistent with the application's single call-to-action convention.
7. THE Flight_Plan_Template SHALL apply a corner radius of 8px to the notification card.
8. THE Flight_Plan_Template SHALL present the notification as a fields-and-table layout separated by divider lines, and SHALL exclude boarding-pass and literal aviation ornamentation such as perforations, ticket stubs, and barcodes.
9. THE Flight_Plan_Template SHALL render body text at a contrast ratio of at least 4.5:1 against the card surface color.

### Requirement 3: Header branding matched to the app chrome

**User Story:** As a brand owner, I want the notification header to mirror the TOWER app chrome, so that the branding is consistent across the app and its output.

#### Acceptance Criteria

1. THE Flight_Plan_Template header SHALL display the "TOWER" wordmark.
2. THE Flight_Plan_Template header SHALL display a takeoff icon adjacent to the wordmark.
3. THE Flight_Plan_Template header SHALL include a Southwest brand accent, rendered in SWA blue `rgb(25, 130, 230)` or SWA red `#e31837`, consistent with the application header.
4. THE Flight_Plan_Template SHALL exclude the Southwest heart logo and the Crew Training logo.

### Requirement 4: Preserve all content fields and the token contract

**User Story:** As a deployment coordinator, I want every notification field preserved, so that the redesign loses no information.

#### Acceptance Criteria

1. THE Flight_Plan_Template SHALL include every Content_Token: `{{NOTIFICATION_HEADER}}`, `{{DEPLOYMENT_TITLE}}`, `{{DEPLOYMENT_SUBTITLE}}`, `{{SCHEDULE}}`, `{{OUTAGE_INDICATOR}}`, `{{JIRA_ITEMS}}`, and `{{CONTACT}}`.
2. WHEN the Token_Injector populates the Flight_Plan_Template, THE rendered card SHALL display the notification header, the CHG deployment title, the change-number subtitle, the schedule window, the outage Yes/No indicator, the change items with nested impact bullets, and the contact block.
3. THE Flight_Plan_Template SHALL define CSS rules for the `.change-group` (Change_Group) class, the `.impact-sub` (Impact_Sub) class, and the `<strong>` Jira-number element emitted within `{{JIRA_ITEMS}}`.
4. THE Token_Injector SHALL remain unchanged, continuing to replace every Content_Token and every Legacy_Alias.
5. WHERE the Flight_Plan_Template contains the `{{OUTAGE_BLOCK}}` or `{{IMPACT_ITEMS}}` token, THE Token_Injector SHALL replace that token with an empty string.
6. IF a token's injected value is an empty string, THEN THE rendered card SHALL omit the corresponding region and SHALL display no raw token placeholder text.

### Requirement 5: Self-contained styling and reliable Open Sans font

**User Story:** As a developer, I want the template self-contained with a reliable font, so that rasterization is deterministic and does not depend on a remote external resource.

#### Acceptance Criteria

1. THE Flight_Plan_Template SHALL contain all styling within an inline `<style>` element in the document.
2. THE Flight_Plan_Template SHALL reference no external CSS resource and no external JavaScript resource.
3. THE Flight_Plan_Template SHALL declare Open Sans as the primary font family followed by the system fallback stack `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
4. THE Flight_Plan_Template SHALL reference no remotely hosted font resource, replacing the previous remote Inter font link.
5. WHERE Open Sans font data is included in the Flight_Plan_Template, THE Flight_Plan_Template SHALL embed that font data within the document so that rendering requires no external network request.
6. IF Open Sans is unavailable at render time, THEN THE Flight_Plan_Template SHALL render text using the system fallback stack `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.

### Requirement 6: Preserve the fixed card width and render sizing

**User Story:** As a developer, I want the fixed card width preserved, so that the existing off-screen rasterization keeps producing correctly framed images.

#### Acceptance Criteria

1. THE Flight_Plan_Template SHALL set the notification card to a fixed width of 1100px.
2. THE Flight_Plan_Template SHALL apply 24px of padding on each side of the card so that the card plus padding totals 1148px, matching the Render_Container width.
3. THE Artifact_Delivery SHALL continue to place the populated Flight_Plan_Template in a Render_Container 1148px wide for rasterization.

### Requirement 7: Preserve PNG rasterization and new-tab delivery

**User Story:** As a deployment coordinator, I want the same delivery behavior, so that generating a Flight Plan still rasterizes to a PNG and opens it in a new tab.

#### Acceptance Criteria

1. WHEN the user activates the Generate Flight Plan action, THE Artifact_Generator SHALL load the Flight_Plan_Template and inject deployment data through the Token_Injector before rasterization.
2. WHEN the populated Flight_Plan_Template is ready, THE Artifact_Delivery SHALL rasterize the populated Flight_Plan_Template to a PNG image.
3. WHEN the PNG image is produced, THE Artifact_Delivery SHALL open the PNG image in a new browser tab.
4. THE Flight_Plan_Template SHALL remain an authored `.html` source that the Artifact_Delivery rasterizes for delivery rather than delivering as HTML.
5. IF the new browser tab is blocked, THEN THE Artifact_Delivery SHALL record the block and SHALL report the artifact as successfully rendered.

### Requirement 8: Retire both old templates and collapse the theme mapping

**User Story:** As a maintainer, I want the dead light/dark templates and the theme mapping removed, so that the code reflects the single-template reality.

#### Acceptance Criteria

1. THE Redesign SHALL remove `public/templates/light-mode.html` and `public/templates/dark-mode.html` from the repository.
2. THE Template_Loader SHALL load exactly one notification template file from the `/templates/` path.
3. WHILE producing a Flight_Plan, THE Artifact_Generator SHALL select the Flight_Plan_Template without branching on a Theme value.
4. WHEN output generation runs, THE TOWER_Portal SHALL produce the Flight_Plan using the single Flight_Plan_Template, independent of any theme value supplied by the caller.
5. WHEN the Build_Process runs to completion, THE Build_Process SHALL copy the single Flight_Plan_Template file into `dist/templates/` so that it is retrievable at the `/templates/` path.

### Requirement 9: Template loading and error handling

**User Story:** As a user, I want clear handling when the template fails to load, so that I can retry without reloading the page.

#### Acceptance Criteria

1. WHEN the TOWER_Portal initializes, THE Template_Loader SHALL request the Flight_Plan_Template from the `/templates/` path.
2. IF the Template_Loader does not retrieve the Flight_Plan_Template within 5 seconds, THEN THE Template_Loader SHALL abort the request and raise a timeout error that identifies the template path.
3. IF the Template_Loader fails to retrieve the Flight_Plan_Template because of a network error, a missing file, or a timeout, THEN THE Template_Loader SHALL surface a user-visible error indication and SHALL leave the TOWER_Portal in a state that permits a retry without a full page reload.
4. WHEN the Template_Loader retrieves the Flight_Plan_Template successfully, THE Template_Loader SHALL cache the Flight_Plan_Template in memory for reuse.

### Requirement 10: Keep tests and documentation consistent

**User Story:** As a maintainer, I want tests and documentation reconciled, so that the repository has no stale references to the retired templates.

#### Acceptance Criteria

1. WHEN the Redesign is complete, THE Redesign SHALL update the documentation under `docs/` that references `light-mode.html` or `dark-mode.html` to describe the single Flight_Plan_Template instead.
2. WHEN the Redesign is complete, THE Template_Loader SHALL reference only the single Flight_Plan_Template file as the notification template source.
3. WHERE automated tests reference the retired template filenames or the Theme-to-template mapping, THE Redesign SHALL update those tests to reference the single Flight_Plan_Template.
