# Implementation Plan: Deployment Notification Generator Portal

## Overview

This plan implements a React-based deployment notification generator that enables coordinators to create HTML, PDF, and PNG artifacts from up to 5 simultaneous deployment forms. The implementation follows a layered architecture: **data models and validation** (domain logic), **React components and form management** (presentation layer), and **artifact generation and delivery** (output layer).

The existing HTML templates (`Templates/light-mode.html` and `Templates/dark-mode.html`) are fully tokenized and production-ready. All tasks are unblocked and ready for implementation.

Implementation language: **TypeScript** with React 18, Material UI v5, html2pdf.js, and html-to-image.

**Testing Strategy**: Unit tests for validation logic, integration tests for workflows, component tests for UI interactions, snapshot tests for rendering consistency, and E2E tests for complete user flows. Property-based testing is NOT used for this UI-heavy feature.

**Legend:**
- `*` = optional test sub-task (may be skipped for a faster MVP; never implemented automatically).

## Tasks

- [x] 1. Project setup and foundational infrastructure
  - [x] 1.1 Initialize React + TypeScript project with build tooling
    - Initialize Vite + React 18 + TypeScript project structure
    - Configure TypeScript compiler options (strict mode, JSX, module resolution)
    - Set up directory structure: `src/data/`, `src/components/`, `src/utils/`, `src/types/`, `public/templates/`
    - _Requirements: (foundational infrastructure)_

  - [x] 1.2 Install and configure core dependencies
    - Install runtime dependencies: `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/x-date-pickers`, `date-fns`, `html2pdf.js`, `html-to-image`
    - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `@types/*` packages
    - Configure Vite for test environment and module resolution
    - _Requirements: (foundational infrastructure)_

  - [x] 1.3 Configure test runner and testing utilities
    - Set up vitest configuration with jsdom environment
    - Create test setup file with React Testing Library configuration
    - Add test scripts to package.json (`test`, `test:ui`, `coverage`)
    - Create testing utilities and custom render functions
    - _Requirements: (test infrastructure)_

- [x] 2. Core data models and type definitions
  - [x] 2.1 Define TypeScript interfaces for all data models
    - Create `types/models.ts` with: `Application`, `DeploymentFormData`, `ChangeItem`, `ImpactItem`, `Environment`, `Theme`, `ValidationError`, `ValidationResult`, `GenerationResult`, `Artifact`
    - Include all field constraints (max lengths, formats) as type comments
    - Define `APPLICATION_CATALOG` constant with 5 applications (AO Crew Training, Crew Portal, Crew Mobile, Learning Management, Administration Portal)
    - _Requirements: 2.1, 2.7, 3.1-3.3, 4.1-4.4, 5.1-5.2, 6.1-6.2, 7.1-7.2, 8.1, 9.1_

  - [x] 2.2 Implement form data factory and default values
    - Create `createDefaultForm()` factory returning `DeploymentFormData` with creation-time defaults
    - Defaults: deployment date = today, start time = 20:00, end time = 22:00, hasOutage = false, one empty Change_Item, one empty Impact_Item, no application/environment selected
    - Generate unique form IDs using timestamp or UUID
    - _Requirements: 1.1, 4.2-4.4, 5.2, 6.1, 7.1_

- [x] 3. Validation utilities (domain layer)
  - [x] 3.1 Implement field-level validation functions
    - Create `validators.ts` with: `isValidEmail()`, `isValidPhone()`, `trimInput()`, `isNonEmpty()`, `isWithinLength()`
    - Phone regex: `^\(\d{3}\) \d{3}-\d{4}$`
    - Email regex: standard pragmatic email pattern
    - _Requirements: 3.4, 8.2, 8.3_

  - [~] 3.2 Write unit tests for field validators
    - Test email validation with valid/invalid formats, edge cases
    - Test phone validation with correct format, invalid formats
    - Test trimming with leading/trailing whitespace, embedded whitespace
    - Test length bounds (0, 1, max, max+1 for 20, 50, 255, 500 char limits)
    - _Requirements: 3.4, 8.2, 8.3_

  - [x] 3.2 Implement form-level validation orchestrator
    - Create `validateForm(data: DeploymentFormData): ValidationResult`
    - Validate all required fields, formats, time ordering, outage logic, list counts, item contents
    - Return `ValidationResult` with `isValid` boolean and `errors: ValidationError[]` (formId, field, message)
    - Non-destructive: never mutate input data
    - _Requirements: 3.5, 4.6, 4.7, 5.6, 6.2-6.6, 7.3-7.7, 8.1-8.5_

  - [x] 3.4 Write unit tests for form validation
    - Test required-field detection for all required fields
    - Test time ordering: end > start, end <= start cases
    - Test outage ordering: outage end > outage start
    - Test Change_Item rules: empty Jira Number, empty description, count < 1
    - Test Impact_Item rules: empty text, text > 500 chars, count < 1, count > 100
    - Test contact validation: missing fields, invalid email, invalid phone
    - Test non-destructive behavior: original data unchanged after validation
    - _Requirements: 3.5, 4.6, 4.7, 5.6, 6.2-6.6, 7.3-7.7, 8.1-8.5_

  - [x] 3.5 Implement batch validation gate
    - Create `validateBatch(forms: DeploymentFormData[], theme: Theme | null, catalogEmpty: boolean): ValidationResult`
    - Run `validateForm` on every form, check theme selected, check catalog non-empty
    - Return aggregated errors across all forms
    - Empty error array = batch may generate
    - _Requirements: 2.3, 2.8, 9.4, 10.2, 10.3_

  - [x] 3.6 Write integration tests for batch validation
    - Test all-pass case: all forms valid, theme selected, catalog present
    - Test theme-not-selected blocking
    - Test empty-catalog blocking
    - Test single-form failure blocks entire batch
    - Test multiple-form failures return all errors
    - _Requirements: 2.3, 2.8, 9.4, 10.2, 10.3_

- [x] 4. Formatting utilities (domain layer)
  - [x] 4.1 Implement title generation functions
    - Create `generateDeploymentTitle(data: DeploymentFormData): string`
    - Format: `[CHG#####] — [Application Name: Release Version - Deploy Product to ENVIRONMENT]`
    - Return empty string if any required component missing
    - Create `generateNotificationHeader(applicationName: string): string`
    - _Requirements: 2.4, 2.5, 3.6_

  - [x] 4.2 Write unit tests for title generation
    - Test complete title with all fields present
    - Test empty string with missing application, change number, release version, or environment
    - Test application name reflected correctly
    - Test notification header derivation
    - _Requirements: 2.4, 2.5, 3.6_

  - [x] 4.3 Implement date and time formatting functions
    - Create `formatSchedule(date: Date, startTime: Date, endTime: Date): string`
    - Format: `Month DD, YYYY, HH:MM AM/PM–HH:MM AM/PM` using Intl.DateTimeFormat
    - Create `formatYYYYMMDD(date: Date): string` returning 8-digit date string
    - _Requirements: 4.5, 12.2_

  - [x] 4.4 Write unit tests for date/time formatting
    - Test schedule formatting with various dates and times
    - Test AM/PM formatting correctness
    - Test YYYYMMDD formatting with various dates (edge cases: Jan 1, Dec 31, leap year)
    - _Requirements: 4.5, 12.2_

- [x] 5. File naming logic (domain layer)
  - [x] 5.1 Implement base file name generator
    - Create `generateBaseFileName(data: DeploymentFormData): string | null`
    - Format: `<Application>_<Environment>_<CHG#>_<YYYYMMDD>`
    - Replace spaces with underscores in application, environment, CHG#
    - Return null if any component missing (application, environment, changeNumber, deploymentDate)
    - _Requirements: 12.1, 12.2, 12.3, 12.6_

  - [x] 5.2 Write unit tests for base file name generation
    - Test correct format with all components present
    - Test space-to-underscore conversion
    - Test null return with missing application, environment, change number, or date
    - Test date formatting in YYYYMMDD
    - _Requirements: 12.1, 12.2, 12.3, 12.6_

  - [x] 5.3 Implement collision detection and disambiguation
    - Create `detectCollisions(forms: DeploymentFormData[]): Map<string, DeploymentFormData[]>`
    - Group forms by base file name
    - Create `disambiguateFileNames(forms: DeploymentFormData[]): Map<string, string>`
    - Assign suffixes (-1, -2, etc.) to colliding forms using stable ordering (form ID)
    - No suffix for first form in collision group
    - _Requirements: 14.1, 14.2, 14.4_

  - [x] 5.4 Write unit tests for collision handling
    - Test no collisions: all forms get base name without suffix
    - Test 2-form collision: first gets base, second gets base-1
    - Test 3+ form collision: correct suffix assignment
    - Test stable ordering: same forms produce same suffixes
    - Test suffix applied to all three artifacts (HTML, PDF, PNG)
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 6. Checkpoint - Core validation and formatting complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Template loading and token injection (domain layer)
  - [x] 7.1 Load and parse HTML templates
    - Load `Templates/light-mode.html` and `Templates/dark-mode.html` as strings
    - Create `TemplateProvider` class with `getTemplate(theme: Theme): string`
    - Cache loaded templates
    - _Requirements: 9.5, 9.6_

  - [x] 7.2 Implement list renderers with HTML escaping
    - Create `renderChangeItems(items: ChangeItem[]): string`
    - Format: `<strong>{escapedJiraNumber}</strong> {escapedDescription}` per item
    - Create `renderImpactItems(items: ImpactItem[]): string`
    - Format: `<ul><li>{escapedText}</li></ul>` preserving insertion order
    - Create `renderOutageSection(hasOutage, startDate, startTime, endDate, endTime): string`
    - HTML-escape all user text before wrapping in HTML tags
    - _Requirements: 6.7, 7.8_

  - [x] 7.3 Write unit tests for list rendering
    - Test Change_Item rendering: Jira Number in <strong>, description in plain text
    - Test Impact_Item rendering: <ul><li> structure, order preservation
    - Test HTML escaping: `< > & " '` characters escaped correctly
    - Test outage section: shown when hasOutage=true, hidden when false
    - _Requirements: 6.7, 7.8_

  - [x] 7.4 Implement template token injection engine
    - Create `injectTemplate(template: string, data: DeploymentFormData): string`
    - Replace all tokens: `{{NOTIFICATION_HEADER}}`, `{{DEPLOYMENT_TITLE}}`, `{{DEPLOYMENT_ID}}`, `{{DEPLOYMENT_SCHEDULE}}`, `{{OUTAGE_WINDOW}}`, `{{CHANGE_ITEMS}}`, `{{IMPACT_ITEMS}}`, `{{CONTACT_NAME}}`, `{{CONTACT_EMAIL}}`, `{{CONTACT_PHONE}}`
    - Use rendered lists from 7.2 for Change_Items and Impact_Items
    - Escape text tokens, insert HTML tokens verbatim
    - _Requirements: 10.4_

  - [x] 7.5 Write integration tests for template injection
    - Test all tokens replaced correctly with sample data
    - Test HTML structure preserved
    - Test theme-specific template selection
    - Test injection with minimal data (1 Change_Item, 1 Impact_Item, no outage)
    - Test injection with maximal data (999 Change_Items, 100 Impact_Items, with outage)
    - _Requirements: 9.5, 9.6, 10.4_

- [x] 8. Form state management (presentation layer - React hooks)
  - [x] 8.1 Implement form manager hook
    - Create `useFormManager()` hook managing array of DeploymentFormData
    - Initial state: one default form
    - Methods: `addForm()` (max 5), `removeForm(formId)` (min 1), `updateForm(formId, updates)`, `resetForm(formId)` with confirmation
    - Preserve other forms' values during add/remove operations
    - _Requirements: 1.1-1.11_

  - [x] 8.2 Implement reset confirmation logic
    - Create `useResetConfirmation(formId, onConfirm)` hook
    - Show confirmation dialog on reset initiation
    - On confirm: call onConfirm and restore default values
    - On cancel: close dialog, preserve all values
    - _Requirements: 1.9, 1.10, 1.11_

  - [x] 8.3 Implement theme selection state
    - Create `useTheme()` hook managing Theme state
    - Initial value: Dark Mode
    - Exactly one theme active at all times
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 8.4 Write component tests for form lifecycle
    - Test initial state: one form present
    - Test add form: creates new form, preserves existing values, disabled at 5 forms
    - Test remove form: deletes form, preserves others, disabled at 1 form
    - Test reset flow: shows confirmation, clears on confirm, preserves on cancel
    - _Requirements: 1.1-1.11_

- [x] 9. Form input components (presentation layer - React components)
  - [x] 9.1 Implement ApplicationSelector component
    - Dropdown showing all applications from APPLICATION_CATALOG
    - Placeholder prompt when no application selected
    - Display banner "No applications available" when catalog empty
    - Disable dropdown when catalog empty
    - _Requirements: 2.1, 2.2, 2.7, 2.8_

  - [x] 9.2 Implement DeploymentInfoSection component
    - Text input for Change Number (max 20 chars, required)
    - Text input for Release Version (max 50 chars, required)
    - Dropdown for Environment (PROD/QA/ITEST/DEV, none default, required)
    - Auto-trim Change Number and Release Version on blur
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 9.3 Implement DeploymentTitleDisplay component
    - Read-only text display showing computed Deployment_Title
    - Update within 500ms of Change Number, Release Version, Environment, or Application change using debounced computation
    - Show empty when any required component missing
    - _Requirements: 3.6, 3.7, 3.8_

  - [x] 9.4 Write component tests for deployment info
    - Test Change Number/Release Version auto-trim on blur
    - Test required field validation errors displayed
    - Test title updates within 500ms (use fake timers)
    - Test title empty with missing fields
    - _Requirements: 3.1-3.8_

- [x] 10. Schedule and outage components (presentation layer)
  - [x] 10.1 Implement ScheduleSection component
    - MUI DatePicker for Deployment Date (picker-only, reject keyboard input)
    - MUI TimePicker for Start Time (picker-only, reject keyboard input)
    - MUI TimePicker for End Time (picker-only, reject keyboard input)
    - Default values: today, 20:00, 22:00
    - Show validation error when End Time <= Start Time
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7_

  - [x] 10.2 Implement OutageSection component
    - Yes/No radio buttons for outage indicator, default No
    - Conditionally render MUI DateTimePickers for outage start/end (4 pickers total)
    - Show pickers when Yes selected, hide when No selected
    - Clear outage values when switching from Yes to No
    - Show validation error when outage end <= outage start
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 10.3 Write component tests for schedule and outage
    - Test picker-only input (keyboard input rejected)
    - Test default values set correctly
    - Test validation errors displayed for time ordering
    - Test outage section show/hide on indicator change
    - Test outage values cleared when switching to No
    - _Requirements: 4.1-4.7, 5.1-5.6_

- [x] 11. Change Items and Impact Items components (presentation layer)
  - [x] 11.1 Implement ChangeItemsSection component
    - Display list of Change_Item entries with Add/Remove controls
    - Each item: text input for Jira Number (max 50 chars), textarea for Description (max 500 chars)
    - Add button creates new item (max 999 total)
    - Remove button deletes item (min 1 required)
    - Disable Add at 999 items
    - Disable Remove when only 1 item remains
    - Show validation errors for empty Jira Number or Description
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 11.2 Implement ImpactSection component
    - Display list of Impact_Item entries with Add/Remove controls
    - Each item: textarea for impact text (max 500 chars)
    - Add button creates new item (max 100 total)
    - Remove button deletes item (min 1 required)
    - Disable Add at 100 items, show message "Maximum 100 impact items reached"
    - Disable Remove when only 1 item remains
    - Show validation errors for empty text or text > 500 chars
    - Preserve insertion order for rendering
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 11.3 Write component tests for list management
    - Test Change_Item add/remove with count bounds
    - Test Impact_Item add/remove with count bounds and max message
    - Test validation errors displayed for empty/invalid items
    - Test Remove disabled at minimum count
    - Test Add disabled at maximum count
    - Test item order preservation
    - _Requirements: 6.1-6.7, 7.1-7.8_

- [ ] 12. Contact and theme components (presentation layer)
  - [x] 12.1 Implement ContactSection component
    - Text input for Contact Name (max 255 chars, required)
    - Text input for Email (max 255 chars, required, format validation)
    - Text input for Phone (max 255 chars, required, format `(###) ###-####`)
    - Display format errors adjacent to fields
    - Display required errors adjacent to fields
    - Preserve entered values when validation fails
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 12.2 Implement ThemeSelector component
    - Two mutually exclusive radio buttons: Light Mode, Dark Mode
    - Default selection: Dark Mode
    - Always exactly one theme selected (no unselected state)
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 12.3 Write component tests for contact and theme
    - Test contact field validation (required, email format, phone format)
    - Test validation errors displayed adjacent to fields
    - Test entered values preserved on validation failure
    - Test theme default to Dark Mode
    - Test theme mutual exclusivity (only one selected)
    - _Requirements: 8.1-8.5, 9.1-9.3_

- [x] 13. Main form and app assembly (presentation layer)
  - [x] 13.1 Implement DeploymentForm component
    - Compose all sections: ApplicationSelector, DeploymentInfoSection, DeploymentTitleDisplay, ScheduleSection, OutageSection, ChangeItemsSection, ImpactSection, ContactSection
    - Include form-level actions: Reset button (with confirmation), Remove button (disabled when single form)
    - Display validation errors per field
    - Always expanded (no collapse functionality)
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11_

  - [x] 13.2 Implement FormManager component
    - Display all DeploymentForm instances
    - Add Form button (disabled at 5 forms)
    - Each form shows Remove button (disabled at 1 form)
    - Preserve all form values during add/remove operations
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 13.3 Implement App component
    - Compose ThemeSelector (session-level), FormManager, Generate Outputs button
    - Display empty catalog banner when APPLICATION_CATALOG empty
    - Wire up form manager hook and theme hook
    - _Requirements: 2.7, 2.8, 9.1, 9.2, 9.3_

- [~] 14. Checkpoint - UI layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Artifact generation (output layer)
  - [x] 15.1 Implement HTML artifact generator
    - Create `generateHTML(data: DeploymentFormData, theme: Theme): string`
    - Load template using TemplateProvider
    - Inject all tokens using injectTemplate
    - Return complete HTML string
    - _Requirements: 10.4, 10.5_

  - [x] 15.2 Implement PDF generator adapter
    - Create `generatePDF(htmlString: string, fileName: string): Promise<void>`
    - Use html2pdf.js to convert HTML to PDF
    - Trigger automatic download with fileName
    - Handle generation errors gracefully
    - _Requirements: 10.6_

  - [x] 15.3 Implement PNG generator adapter
    - Create `generatePNG(htmlElement: HTMLElement, fileName: string): Promise<void>`
    - Use html-to-image to convert HTML element to PNG
    - Trigger automatic download with fileName
    - Handle generation errors gracefully
    - _Requirements: 10.7_

  - [x] 15.4 Implement HTML tab opener
    - Create `openHTMLTab(htmlString: string): boolean`
    - Use window.open with HTML content
    - Return false if popup blocked
    - _Requirements: 10.5, 13.3_

  - [x] 15.5 Write unit tests for artifact generation
    - Test HTML generation with sample data (mock template injection)
    - Test PDF generation success and error paths (mock html2pdf.js)
    - Test PNG generation success and error paths (mock html-to-image)
    - Test popup blocked detection
    - _Requirements: 10.4-10.8_

- [x] 16. Sequential delivery orchestration (output layer)
  - [x] 16.1 Implement artifact bundle builder
    - Create `buildArtifactBundles(forms: DeploymentFormData[], theme: Theme): ArtifactBundle[]`
    - For each form: generate HTML, compute file names (with collision handling), create bundle with HTML string and file names for PDF/PNG
    - Return array of N bundles for N forms
    - _Requirements: 10.4, 11.1, 11.2, 11.3, 12.4, 14.1, 14.3_

  - [x] 16.2 Implement sequential delivery pacer
    - Create `deliverArtifacts(bundles: ArtifactBundle[]): Promise<DeliveryResult>`
    - Process each bundle sequentially in form order
    - For each bundle: open HTML tab, wait 500ms, download PDF, wait 500ms, download PNG, wait 500ms
    - Track successes and failures for each artifact
    - Continue on individual failures
    - Return delivery summary with successes/failures
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 16.3 Implement error recovery and reporting
    - Detect popup blocked: window.open returns null
    - Catch PDF/PNG generation errors
    - Catch artifact bundle build errors
    - Continue with remaining artifacts on per-artifact failure
    - Return detailed error report (form ID, artifact type, error message)
    - _Requirements: 10.8, 11.4, 13.3, 13.4_

  - [x] 16.4 Write integration tests for delivery orchestration
    - Test N forms → N×3 artifacts generation
    - Test sequential ordering with mocked timer (fake timers)
    - Test 500ms minimum interval between initiations
    - Test popup blocked handling (continue with remaining)
    - Test PDF generation failure (continue with PNG and other forms)
    - Test per-form data isolation (each artifact contains only its form's data)
    - Test collision handling applied to all three artifacts
    - _Requirements: 10.4-10.8, 11.1-11.4, 13.1-13.4, 14.1-14.4_

- [x] 17. Wire generation into UI (integration)
  - [x] 17.1 Implement OutputGenerator component/hook
    - Create `useOutputGenerator()` hook
    - On Generate Outputs click: run validateBatch
    - If validation fails: display all errors per form/per field, block generation, preserve state
    - If validation passes: build artifact bundles with collision handling, call deliverArtifacts
    - Display delivery results: success message, popup blocked notice, artifact failure notices
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 13.3, 13.4_

  - [x] 17.2 Implement validation error display
    - Display per-field errors adjacent to fields
    - Display per-form summary errors
    - Highlight forms with validation errors
    - Preserve all entered data when displaying errors
    - Clear errors when user corrects inputs
    - _Requirements: 2.3, 3.5, 4.7, 5.6, 6.3, 6.6, 7.3, 7.4, 8.4, 8.5, 10.2, 10.3_

  - [x] 17.3 Implement generation result notifications
    - Success message: "Generated N×3 artifacts successfully"
    - Popup blocked message: "Please allow pop-ups to view HTML notifications"
    - Artifact failure message: "Failed to generate [PDF/PNG] for [form name]"
    - Per-form generation failure message: "Generation failed for [form name]"
    - _Requirements: 10.8, 11.4, 13.3, 13.4_

- [~] 18. Checkpoint - Full generation pipeline complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Snapshot testing (presentation layer)
  - [x] 19.1 Create snapshot tests for all major components
    - Snapshot: ApplicationSelector (with/without catalog)
    - Snapshot: DeploymentInfoSection (empty, filled, with errors)
    - Snapshot: ScheduleSection (default, filled, with validation errors)
    - Snapshot: OutageSection (indicator No, indicator Yes with pickers)
    - Snapshot: ChangeItemsSection (1 item, multiple items, at max)
    - Snapshot: ImpactSection (1 item, multiple items, at max)
    - Snapshot: ContactSection (empty, filled, with format errors)
    - Snapshot: ThemeSelector (Light selected, Dark selected)
    - Snapshot: DeploymentForm (complete form with all sections)
    - Snapshot: FormManager (1 form, 3 forms, 5 forms)
    - _Requirements: (rendering consistency)_

- [x] 20. End-to-end testing (complete workflows)
  - [x] 20.1 E2E: Single deployment flow
    - Fill all fields in one form with valid data
    - Select theme
    - Click Generate Outputs
    - Verify 3 artifacts generated (HTML tab opened, PDF downloaded, PNG downloaded)
    - Verify file names correct format
    - _Requirements: All requirements (happy path)_

  - [x] 20.2 E2E: Multi-deployment flow
    - Add 3 forms
    - Fill all forms with different data
    - Generate outputs
    - Verify 9 artifacts generated (3×3) in correct order
    - Verify 500ms intervals between initiations
    - Verify distinct file names (no collisions)
    - _Requirements: 1.1-1.4, 10.1-10.7, 11.1-11.3, 13.1-13.2, 14.1-14.4_

  - [x] 20.3 E2E: Validation flow
    - Leave required fields empty
    - Click Generate Outputs
    - Verify generation blocked
    - Verify validation errors displayed
    - Verify all entered data preserved
    - Correct errors
    - Generate successfully
    - _Requirements: 2.3, 3.5, 4.7, 8.4, 8.5, 10.2, 10.3_

  - [x] 20.4 E2E: Form lifecycle flow
    - Add form (verify 2 forms present)
    - Remove second form (verify 1 form, Remove disabled)
    - Add 5 forms (verify Add disabled at 5)
    - Remove 4 forms (verify 1 remains)
    - Fill form, reset with confirmation (verify defaults restored)
    - Fill form, reset with cancel (verify data preserved)
    - _Requirements: 1.1-1.11_

  - [x] 20.5 E2E: Theme switching flow
    - Verify Dark Mode default
    - Generate outputs (verify Dark theme used)
    - Switch to Light Mode
    - Generate outputs (verify Light theme used)
    - Verify previous outputs unchanged
    - _Requirements: 9.1-9.8_

  - [x] 20.6 E2E: Collision handling flow
    - Create 3 forms with identical application, environment, CHG#, and date
    - Generate outputs
    - Verify file names disambiguated with suffixes
    - Verify first form no suffix, subsequent forms get -1, -2
    - Verify suffix applied to all three artifacts per form
    - _Requirements: 14.1-14.4_

  - [x] 20.7 E2E: Error recovery flow
    - Create 2 forms
    - Mock PDF generation failure for first form
    - Generate outputs
    - Verify first form: HTML opens, PDF fails, PNG succeeds
    - Verify second form: all 3 artifacts succeed
    - Verify error message displayed for failed PDF
    - _Requirements: 10.8, 11.4, 13.3, 13.4_

- [x] 21. Accessibility and polish
  - [x] 21.1 Implement keyboard navigation and ARIA labels
    - Add ARIA labels to all form controls
    - Ensure tab order logical and complete
    - Add ARIA live regions for validation errors
    - Add ARIA announcements for form add/remove actions
    - Add ARIA descriptions for complex controls (date/time pickers)
    - _Requirements: (WCAG 2.1 Level AA target, XC-005)_

  - [x] 21.2 Verify color contrast and focus indicators
    - Verify 4.5:1 contrast ratio for all text
    - Verify 3:1 contrast ratio for UI components
    - Add visible focus indicators for all interactive elements
    - Test with browser accessibility tools
    - _Requirements: (WCAG 2.1 Level AA target, XC-005)_

  - [x] 21.3 Add loading states and user feedback
    - Show loading spinner during artifact generation
    - Disable Generate Outputs button during generation
    - Show progress indication for multi-form generation
    - Add success/error toast notifications
    - _Requirements: (user experience polish)_

  - [x] 21.4 Manual accessibility testing
    - Test with screen reader (NVDA, JAWS, or VoiceOver)
    - Test keyboard-only navigation
    - Test with browser zoom (200%, 400%)
    - Test with high contrast mode
    - Document accessibility test results
    - _Requirements: (WCAG 2.1 Level AA validation, XC-005)_

- [x] 22. Final integration and polish
  - [x] 22.1 Verify all 14 requirements coverage
    - Review each requirement acceptance criterion
    - Verify implementation completeness
    - Run full test suite
    - Fix any remaining issues
    - _Requirements: All requirements 1-14_

  - [x] 22.2 Performance optimization
    - Add memoization for expensive computations (title generation, validation)
    - Optimize re-renders with React.memo where appropriate
    - Lazy load html2pdf.js and html-to-image
    - Profile and optimize large list rendering (100 impact items, 999 change items)
    - _Requirements: (performance optimization)_

  - [x] 22.3 Browser compatibility testing
    - Test on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
    - Verify date/time pickers work correctly across browsers
    - Verify PDF/PNG generation works across browsers
    - Verify download behavior consistent across browsers
    - Document any browser-specific issues or limitations
    - _Requirements: (browser compatibility)_

  - [x] 22.4 Create README and developer documentation
    - Document project setup and build commands
    - Document architecture and component structure
    - Document testing approach and test commands
    - Document known limitations and open items
    - Document browser requirements
    - _Requirements: (developer documentation)_

- [~] 23. Final checkpoint - Feature complete
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; they are never implemented automatically.
- All tasks are unblocked and ready for implementation. The HTML templates are available in `Templates/light-mode.html` and `Templates/dark-mode.html`.
- Testing strategy: Unit tests for validation/formatting logic, component tests for UI interactions, integration tests for workflows, snapshot tests for rendering consistency, E2E tests for complete user flows.
- Property-based testing is NOT used because this is a UI-heavy feature with side-effect operations (PDF/PNG generation, file downloads, browser APIs).
- Checkpoints (6, 14, 18, 23) ensure incremental validation at major milestones.
- Each requirement's acceptance criteria are covered by implementation tasks with explicit traceability.
- All 14 requirements (97 acceptance criteria total) are comprehensively addressed across 23 task groups.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "4.1", "5.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "4.2", "5.2", "7.1"] },
    { "id": 4, "tasks": ["3.4", "4.3", "5.3", "7.2"] },
    { "id": 5, "tasks": ["3.5", "4.4", "5.4", "7.3"] },
    { "id": 6, "tasks": ["3.6", "7.4", "8.1"] },
    { "id": 7, "tasks": ["7.5", "8.2", "8.3"] },
    { "id": 8, "tasks": ["8.4", "9.1", "9.2", "9.3", "10.1", "10.2", "12.1", "12.2"] },
    { "id": 9, "tasks": ["9.4", "10.3", "11.1", "11.2", "12.3"] },
    { "id": 10, "tasks": ["11.3", "13.1", "13.2"] },
    { "id": 11, "tasks": ["13.3", "15.1", "15.2", "15.3", "15.4"] },
    { "id": 12, "tasks": ["15.5", "16.1"] },
    { "id": 13, "tasks": ["16.2", "16.3"] },
    { "id": 14, "tasks": ["16.4", "17.1", "17.2", "17.3"] },
    { "id": 15, "tasks": ["19.1", "20.1", "20.2", "20.3", "20.4", "20.5", "20.6", "20.7"] },
    { "id": 16, "tasks": ["21.1", "21.2", "21.3"] },
    { "id": 17, "tasks": ["21.4", "22.1", "22.2", "22.3"] },
    { "id": 18, "tasks": ["22.4"] }
  ]
}
```
