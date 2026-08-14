# Requirements Document

## Introduction

The Deployment Notification Generator Portal is a lightweight, single-user, browser-based web application that enables a deployment coordinator to enter deployment metadata through guided forms and generate deployment notification artifacts in HTML, PDF, and PNG formats. The portal operates entirely client-side: it has no authentication, no server-side persistence, and no back-end integrations. Notification artifacts are produced by populating existing Light Mode and Dark Mode HTML templates with user-supplied data.

Each deployment form is independent and generates its own dedicated set of output artifacts. The coordinator may work with up to five deployment forms in a single session, all visible simultaneously. The recommended implementation stack is React with TypeScript and Material UI, using html2pdf.js for PDF generation, html-to-image for PNG generation, and the Intl.DateTimeFormat API for date formatting.

This document specifies functional and quality requirements in EARS format. It preserves the intent of the twenty-six refinement user stories (US-001 through US-024, including US-017 and US-017b). Several items remain open decisions or blockers from refinement; these are captured explicitly as requirements where a behavior can be defined, and as documented assumptions in the Open Items and Assumptions section where product-owner confirmation is still required.

## Glossary

- **Portal**: The Deployment Notification Generator Portal web application as a whole.
- **Deployment_Form**: A single guided form instance capturing metadata for one deployment. Up to five may exist in a session.
- **Form_Manager**: The Portal component responsible for adding, removing, and resetting Deployment_Form instances.
- **Application_Catalog**: The configurable list of selectable applications (AO Crew Training, Crew Portal, Crew Mobile, Learning Management, Administration Portal).
- **Application_Selector**: The dropdown control on a Deployment_Form used to select an application from the Application_Catalog.
- **Deployment_Title**: The read-only computed string in the format `[CHG#####] — [Application Name: Release Version - Deploy Product to ENVIRONMENT]`.
- **Title_Generator**: The Portal component that computes the Deployment_Title in real time from form inputs.
- **Schedule_Section**: The Deployment_Form section capturing Deployment Date, Start Time, and End Time.
- **Outage_Section**: The Deployment_Form section capturing outage indicator and, when applicable, outage start and end date-times.
- **Change_Item**: A single Jira entry consisting of a Jira Number and a Title/Description.
- **Impact_Item**: A single free-text entry describing a deployment impact.
- **Contact_Section**: The Deployment_Form section capturing Contact Name, Email, and Phone.
- **Theme_Selector**: The session-level control selecting Light Mode or Dark Mode.
- **Theme**: The selected visual theme (Light Mode or Dark Mode) applied to all generated artifacts in the session.
- **Validator**: The Portal component that checks Deployment_Form field completeness and format correctness.
- **Output_Generator**: The Portal component that produces HTML, PDF, and PNG artifacts from a Deployment_Form.
- **HTML_Template**: An existing Light Mode or Dark Mode HTML document into which deployment data is populated.
- **Notification_Header**: The heading text rendered in a generated artifact, derived from the selected application.
- **File_Namer**: The Portal component that computes output file names.
- **Base_File_Name**: The shared file name stem in the format `<Application>_<Environment>_<CHG#>_<YYYYMMDD>`.
- **Environment**: The deployment target, one of PROD, QA, ITEST, or DEV.
- **Session**: The lifetime of a single loaded instance of the Portal in a browser tab.

## Requirements

### Requirement 1: Deployment Form Lifecycle

**User Story:** As a deployment coordinator, I want to manage multiple deployment forms in one session, so that I can prepare several notifications without reloading the Portal. (US-001, US-016, US-017, US-017b)

#### Acceptance Criteria

1. WHEN the Portal finishes loading, THE Form_Manager SHALL display exactly one Deployment_Form.
2. WHILE fewer than five Deployment_Form instances exist, THE Form_Manager SHALL provide an enabled control to add a new Deployment_Form.
3. WHEN the coordinator adds a Deployment_Form, THE Form_Manager SHALL create a new Deployment_Form and display it alongside the existing forms without modifying any entered values in the existing Deployment_Form instances.
4. WHILE five Deployment_Form instances exist, THE Form_Manager SHALL disable the add control and reject any request to create a further Deployment_Form.
5. THE Form_Manager SHALL display all existing Deployment_Form instances in an expanded state that provides no control to collapse them.
6. WHILE more than one Deployment_Form exists, THE Form_Manager SHALL provide a control to remove each added Deployment_Form.
7. WHEN the coordinator removes a Deployment_Form, THE Form_Manager SHALL delete that Deployment_Form and all of its entered data from the Session while retaining all entered values in the remaining Deployment_Form instances.
8. WHILE exactly one Deployment_Form exists, THE Form_Manager SHALL disable the remove control and reject any request to remove that Deployment_Form.
9. WHEN the coordinator initiates a reset of a Deployment_Form, THE Form_Manager SHALL display a confirmation prompt before clearing any entered values.
10. WHEN the coordinator confirms the reset, THE Form_Manager SHALL clear all entered values in that Deployment_Form and restore each field to the same default value it held when the Deployment_Form was first created.
11. IF the coordinator cancels the reset confirmation, THEN THE Form_Manager SHALL retain all entered values in that Deployment_Form unchanged.

### Requirement 2: Application Selection

**User Story:** As a deployment coordinator, I want to select the target application from a catalog, so that the notification reflects the correct product. (US-002, US-003)

#### Acceptance Criteria

1. THE Application_Selector SHALL present all applications defined in the Application_Catalog as individually selectable options.
2. WHILE no application is selected, THE Application_Selector SHALL display a placeholder prompt indicating that an application must be selected.
3. IF the coordinator attempts output generation while no application is selected, THEN THE Portal SHALL prevent output generation and SHALL display a message indicating that an application selection is required.
4. WHEN the coordinator selects or changes the selected application, THE Title_Generator SHALL re-derive the Deployment_Title to reflect the currently selected application name.
5. WHEN the coordinator selects or changes the selected application, THE Portal SHALL re-derive the Notification_Header to reflect the currently selected application name.
6. WHEN the coordinator selects or changes the selected application, THE File_Namer SHALL re-derive the Base_File_Name to reflect the currently selected application name.
7. IF the Application_Catalog is empty or fails to load, THEN THE Portal SHALL display a message indicating that no applications are available.
8. WHILE the Application_Catalog is empty or has failed to load, THE Portal SHALL prevent output generation.

### Requirement 3: Deployment Information Entry

**User Story:** As a deployment coordinator, I want to enter core deployment identifiers, so that the notification identifies the change accurately. (US-004, US-005)

#### Acceptance Criteria

1. THE Deployment_Form SHALL provide a required text field for Change Number that accepts the full string including the CHG prefix (example CHG12345) with a maximum length of 20 characters.
2. THE Deployment_Form SHALL provide a required free-text field for Release Version (example v5.4.1) with a maximum length of 50 characters.
3. THE Deployment_Form SHALL provide a required dropdown for Environment containing exactly the options PROD, QA, ITEST, and DEV, with no option selected by default.
4. WHEN the coordinator submits a value for Change Number or Release Version, THE Deployment_Form SHALL trim leading and trailing whitespace before storing the value.
5. IF the Change Number, Release Version, or Environment field is empty or contains only whitespace, THEN THE Deployment_Form SHALL reject submission and display an error indication identifying each unpopulated required field, while retaining all values already entered.
6. THE Title_Generator SHALL compute the Deployment_Title in the format `[CHG#####] — [Application Name: Release Version - Deploy Product to ENVIRONMENT]`.
7. WHEN the coordinator changes the Change Number, Release Version, Environment, or selected application, THE Title_Generator SHALL update the Deployment_Title within 500 milliseconds of the change.
8. THE Deployment_Form SHALL display the Deployment_Title as a read-only value that the coordinator cannot edit directly.

### Requirement 4: Deployment Schedule

**User Story:** As a deployment coordinator, I want to specify the deployment date and time window, so that the notification communicates the deployment schedule. (US-006, US-007)

#### Acceptance Criteria

1. THE Schedule_Section SHALL provide native date and time picker controls for Deployment Date, Start Time, and End Time, and SHALL reject any free-form typed entry by accepting values only through these picker controls.
2. WHEN a Deployment_Form is created, THE Schedule_Section SHALL default the Deployment Date to the current date.
3. WHEN a Deployment_Form is created, THE Schedule_Section SHALL default the Start Time to 20:00 (24-hour time).
4. WHEN a Deployment_Form is created, THE Schedule_Section SHALL default the End Time to 22:00 (24-hour time).
5. WHEN output is generated, THE Output_Generator SHALL format the deployment schedule as `Month DD, YYYY, HH:MM AM/PM–HH:MM AM/PM` (for example, `March 05, 2025, 08:00 PM–10:00 PM`).
6. IF the End Time is earlier than or equal to the Start Time on the same Deployment Date when output generation is requested, THEN THE Validator SHALL report a schedule error indicating that End Time must be later than Start Time, SHALL prevent output generation for that Deployment_Form, and SHALL retain all entered schedule values.
7. IF any of Deployment Date, Start Time, or End Time is empty when output generation is requested, THEN THE Validator SHALL report a required-field error indicating which field is missing, SHALL prevent output generation for that Deployment_Form, and SHALL retain all entered schedule values.

### Requirement 5: Outage Information

**User Story:** As a deployment coordinator, I want to indicate and describe an outage window, so that the notification informs users of expected downtime. (US-008, US-009)

#### Acceptance Criteria

1. THE Outage_Section SHALL provide a Yes/No outage indicator.
2. WHEN a Deployment_Form is created, THE Outage_Section SHALL default the outage indicator to No.
3. WHILE the outage indicator is set to Yes, THE Outage_Section SHALL display date and time pickers for Outage Start Date, Outage Start Time, Outage End Date, and Outage End Time.
4. WHILE the outage indicator is set to No, THE Outage_Section SHALL hide the outage date and time fields.
5. WHEN the coordinator sets the outage indicator to No, THE Outage_Section SHALL clear the entered outage date and time values.
6. IF the outage indicator is Yes and the combined Outage End date-time is earlier than or equal to the combined Outage Start date-time, THEN THE Validator SHALL report an outage error and SHALL prevent output generation for that Deployment_Form.

### Requirement 6: Change Items

**User Story:** As a deployment coordinator, I want to list the Jira change items in the deployment, so that recipients know which work is being released. (US-010, US-011)

#### Acceptance Criteria

1. THE Deployment_Form SHALL allow the coordinator to add between 1 and 999 Change_Item entries.
2. WHEN the coordinator adds a Change_Item, THE Deployment_Form SHALL require a non-empty Jira Number of 1 to 50 characters and a non-empty Title/Description of 1 to 500 characters.
3. IF the coordinator attempts to save a Change_Item with an empty Jira Number or an empty Title/Description, THEN THE Validator SHALL reject the entry and display a validation message indicating the missing required field.
4. THE Deployment_Form SHALL allow the coordinator to remove any individual Change_Item without altering the Jira Number or Title/Description of the remaining Change_Item entries.
5. IF the coordinator attempts to remove the only remaining Change_Item, THEN THE Validator SHALL prevent the removal and display a validation message indicating that at least one Change_Item is required.
6. THE Validator SHALL require at least one Change_Item per Deployment_Form.
7. WHEN the Output_Generator renders a Change_Item, THE Output_Generator SHALL display the Jira Number wrapped in a `<strong>` element followed by the plain-text Title/Description.

### Requirement 7: Impact Section

**User Story:** As a deployment coordinator, I want to list deployment impacts, so that recipients understand the effects of the deployment. (US-012)

#### Acceptance Criteria

1. WHEN the coordinator adds an Impact_Item, THE Deployment_Form SHALL append the entry, supporting between 1 and 100 Impact_Item entries per Deployment_Form.
2. IF the coordinator attempts to add an Impact_Item when 100 entries already exist, THEN THE Deployment_Form SHALL reject the addition and display a validation message indicating the maximum of 100 Impact_Item entries has been reached.
3. IF an Impact_Item contains only whitespace or is empty after trimming leading and trailing whitespace, THEN THE Validator SHALL reject the Deployment_Form and display a validation message indicating that each Impact_Item requires non-empty text.
4. IF an Impact_Item exceeds 500 characters after trimming leading and trailing whitespace, THEN THE Validator SHALL reject the Deployment_Form and display a validation message indicating that each Impact_Item must not exceed 500 characters.
5. WHEN the coordinator removes an Impact_Item and at least one other Impact_Item remains, THE Deployment_Form SHALL delete only the selected entry and retain all other Impact_Item entries in their existing order.
6. IF the coordinator attempts to remove the only remaining Impact_Item, THEN THE Deployment_Form SHALL prevent the removal and display a validation message indicating that at least one Impact_Item is required.
7. IF a Deployment_Form contains zero Impact_Item entries, THEN THE Validator SHALL reject the Deployment_Form and display a validation message indicating that at least one Impact_Item is required.
8. WHEN generating output, THE Output_Generator SHALL render the Impact_Item entries as an unordered list using `<ul>` and `<li>` elements, preserving the order in which the coordinator added the entries.

### Requirement 8: Contact Information

**User Story:** As a deployment coordinator, I want to provide contact details, so that recipients can reach the responsible person. (US-013, US-014)

#### Acceptance Criteria

1. THE Contact_Section SHALL provide required input fields for Contact Name, Email, and Phone, each accepting between 1 and 255 characters.
2. IF the Email value does not match a standard email address format, THEN THE Validator SHALL report an email format error adjacent to the Email field and SHALL prevent output generation for that Deployment_Form.
3. IF the Phone value does not match the format `(###) ###-####`, THEN THE Validator SHALL report a phone format error adjacent to the Phone field and SHALL prevent output generation for that Deployment_Form.
4. IF the Contact Name, Email, or Phone field is empty when output generation is requested, THEN THE Validator SHALL report a required-field error adjacent to each empty field and SHALL prevent output generation for that Deployment_Form.
5. WHEN THE Validator reports a validation error for a contact field, THE Contact_Section SHALL retain all previously entered contact field values.

### Requirement 9: Theme Selection

**User Story:** As a deployment coordinator, I want to choose a visual theme, so that generated notifications match the desired appearance. (US-015)

#### Acceptance Criteria

1. THE Theme_Selector SHALL provide exactly two mutually exclusive selectable options: Light Mode and Dark Mode.
2. WHEN the Portal finishes loading, THE Theme_Selector SHALL set the active Theme to Dark Mode as the default selection.
3. WHILE a Theme is selected, THE Theme_Selector SHALL maintain exactly one active Theme (either Light Mode or Dark Mode) at all times during the Session.
4. IF output generation is requested WHILE no Theme is selected, THEN THE Portal SHALL prevent output generation and display an error indication that a Theme must be selected.
5. WHEN output generation is requested for a Deployment_Form, THE Portal SHALL render the artifact using the HTML_Template corresponding to the active Theme (Light Mode uses the Light HTML_Template, Dark Mode uses the Dark HTML_Template).
6. THE Portal SHALL produce each generated Deployment_Form artifact so that its visual appearance matches the HTML_Template corresponding to the active Theme.
7. WHEN the coordinator changes the active Theme, THE Portal SHALL apply the newly selected Theme to every Deployment_Form artifact generated after the change within the Session.
8. WHEN the coordinator changes the active Theme, THE Portal SHALL leave all Deployment_Form artifacts generated before the change unchanged.

### Requirement 10: Output Generation

**User Story:** As a deployment coordinator, I want to generate all notification artifacts with one action, so that I can produce outputs efficiently. (US-018, US-019, US-020)

#### Acceptance Criteria

1. THE Portal SHALL provide a single Generate Outputs control.
2. WHEN the coordinator activates the Generate Outputs control, THE Validator SHALL validate every Deployment_Form before any artifact is generated.
3. IF any Deployment_Form fails validation, THEN THE Portal SHALL block generation for all Deployment_Form instances, SHALL display a validation error for each failure that identifies the specific Deployment_Form and the specific field that failed, and SHALL preserve all entered metadata so the coordinator can correct the failures and re-activate the Generate Outputs control.
4. WHEN all Deployment_Form instances pass validation, THE Output_Generator SHALL generate one HTML artifact, one PDF artifact, and one PNG artifact for each Deployment_Form, and each artifact SHALL contain all metadata entered in its corresponding Deployment_Form.
5. WHEN an HTML artifact is generated, THE Output_Generator SHALL open the HTML artifact in a new browser tab.
6. WHEN a PDF artifact is generated, THE Output_Generator SHALL download the PDF artifact automatically.
7. WHEN a PNG artifact is generated, THE Output_Generator SHALL download the PNG artifact automatically.
8. IF the Output_Generator fails to generate any artifact after validation passes, THEN THE Portal SHALL block delivery of all artifacts for the current activation, SHALL display an error indicating which Deployment_Form and which artifact type failed, and SHALL retain all entered metadata for re-activation.

### Requirement 11: Multiple Deployment Support

**User Story:** As a deployment coordinator, I want each form to produce its own artifacts, so that deployments remain distinct. (US-016, US-022)

#### Acceptance Criteria

1. WHEN output generation is triggered for a set of N Deployment_Forms, THE Output_Generator SHALL produce exactly N×3 artifacts, consisting of one HTML, one PDF, and one PNG artifact for each Deployment_Form.
2. THE Output_Generator SHALL ensure that each artifact contains only the data of its associated Deployment_Form and contains no data originating from any other Deployment_Form.
3. THE Output_Generator SHALL write the artifacts of each Deployment_Form as distinct files and SHALL NOT combine or merge artifacts belonging to different Deployment_Forms into a shared artifact.
4. IF artifact generation fails for one Deployment_Form, THEN THE Output_Generator SHALL continue generating artifacts for the remaining Deployment_Forms and SHALL produce an error indication identifying the Deployment_Form for which generation failed.

### Requirement 12: File Naming

**User Story:** As a deployment coordinator, I want predictable file names, so that I can identify and organize generated artifacts. (US-023)

#### Acceptance Criteria

1. THE File_Namer SHALL compute the Base_File_Name by concatenating the Application, Environment, CHG#, and Deployment Date components in that order, separated by single underscore characters, in the format `<Application>_<Environment>_<CHG#>_<YYYYMMDD>`.
2. THE File_Namer SHALL derive the date portion of the Base_File_Name from the Deployment Date formatted as an 8-digit YYYYMMDD string (4-digit year, 2-digit month 01-12, 2-digit day 01-31).
3. THE File_Namer SHALL replace every space character in the Application, Environment, and CHG# components with a single underscore character before concatenation.
4. THE File_Namer SHALL assign the HTML, PDF, and PNG artifacts of a Deployment_Form file names that share the identical Base_File_Name and differ only by their lowercase extension (`.html`, `.pdf`, `.png`).
5. THE File_Namer SHALL generate all artifact file names using only the Application, Environment, CHG#, and Deployment Date values from the Deployment_Form, without requiring or accepting coordinator input.
6. IF any of the Application, Environment, CHG#, or Deployment Date components is missing or empty when the Base_File_Name is computed, THEN THE File_Namer SHALL abort file-name generation, produce no artifact file names, and return an error indication identifying the missing component.

### Requirement 13: Sequential Output Delivery

**User Story:** As a deployment coordinator, I want reliable delivery of every artifact, so that browser throttling does not drop outputs. (US-021, D-003)

#### Acceptance Criteria

1. WHEN generating HTML artifacts for multiple Deployment_Form instances, THE Output_Generator SHALL open the HTML tabs one at a time in the order the Deployment_Form instances are listed, initiating each tab only after the previous tab has been initiated with a minimum interval of 500 milliseconds between initiations.
2. WHEN downloading PDF and PNG artifacts for multiple Deployment_Form instances, THE Output_Generator SHALL initiate each download one at a time in the order the Deployment_Form instances are listed, initiating each download only after the previous download has been initiated with a minimum interval of 500 milliseconds between initiations.
3. IF the browser blocks an HTML tab from opening, THEN THE Portal SHALL display a message indicating that pop-ups must be allowed to receive HTML artifacts and SHALL continue initiating the remaining HTML tabs.
4. IF the initiation of any PDF or PNG download fails, THEN THE Output_Generator SHALL continue initiating the remaining downloads and SHALL display a message indicating which artifacts were not delivered.

### Requirement 14: File Name Collision Handling

**User Story:** As a deployment coordinator, I want distinct file names across forms, so that artifacts do not overwrite one another. (R-007)

#### Acceptance Criteria

1. IF two or more Deployment_Form instances produce the same Base_File_Name within a generation batch, THEN THE File_Namer SHALL append a distinguishing suffix to the Base_File_Name of each colliding Deployment_Form so that every resulting artifact file name is unique within that generation batch.
2. WHEN File_Namer evaluates a pair of Deployment_Form instances for collision, THE File_Namer SHALL classify them as colliding if and only if they share the same application, environment, change number, and deployment date.
3. WHEN File_Namer appends a distinguishing suffix to a Deployment_Form, THE File_Namer SHALL apply the identical base name, including that suffix, to the same form's HTML, PDF, and PNG artifacts so that the three artifacts of one form share a single base name.
4. WHEN File_Namer assigns distinguishing suffixes to a set of colliding Deployment_Form instances, THE File_Namer SHALL assign them according to a stable, repeatable ordering of those instances so that regenerating the same batch produces identical artifact file names.

## Open Items and Assumptions

The following items were raised during refinement and require product-owner confirmation. Where a default behavior is assumed, it is stated so it can be validated or overridden.

- **G-004 (Blocker) — HTML templates not yet provided.** The existing Light Mode and Dark Mode HTML_Template documents and their placeholder schema have not been supplied. Requirements 6, 7, and 10 assume templates expose insertion points for the Deployment_Title, Notification_Header, schedule, outage details, Change_Item list, Impact_Item list, and contact details. Final rendering requirements depend on receiving the templates.
- **G-008 — Application catalog fallback.** Requirement 2.6 assumes an empty or failed catalog load displays a message and blocks generation. Confirm the desired fallback content and whether a default catalog should be bundled.
- **D-002 — Cross-midnight deployment window.** Requirement 4.6 assumes an End Time earlier than or equal to Start Time on a single Deployment Date is rejected. Confirm whether cross-midnight windows should instead be supported (for example, by adding an end date).
- **US-017 / US-017b — Remove and reset forms.** Requirements 1.6 through 1.9 capture form removal and reset. These behaviors were added during refinement and need product-owner acceptance.
- **All-or-nothing generation.** Requirement 10.3 assumes generation is blocked entirely if any Deployment_Form is invalid. Confirm this over generating only the valid forms.
- **D-008 — File-name slug rules.** Requirement 12.3 defines only space-to-underscore conversion. The handling of other non-alphanumeric characters in application names, change numbers, or versions is undefined and needs a rule.
- **D-010 — Unsaved-data warning.** A `beforeunload` warning on refresh is currently out of scope. Confirm whether the Portal should warn the coordinator before discarding entered data.
- **XC-005 — Accessibility.** No WCAG conformance level or accessibility acceptance criteria were specified. Confirm the target accessibility requirements.
