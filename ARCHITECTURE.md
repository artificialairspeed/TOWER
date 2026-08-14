# Architecture Documentation - Deployment Notification Generator

This document provides a detailed overview of the Deployment Notification Generator's architecture, component structure, and data flow.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Component Hierarchy](#component-hierarchy)
3. [Data Flow](#data-flow)
4. [Domain Models](#domain-models)
5. [Component Descriptions](#component-descriptions)
6. [State Management](#state-management)
7. [Utility Functions](#utility-functions)
8. [Error Handling](#error-handling)
9. [Design Patterns](#design-patterns)

---

## High-Level Architecture

The Deployment Notification Generator uses a **three-layer architecture** that separates concerns and enables testing:

```
┌────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                            │
│  React Components, Form State Management, User Interactions    │
│                                                                  │
│  Responsibilities:                                              │
│  • Render UI components (forms, fields, buttons)               │
│  • Handle user interactions (clicks, input changes)            │
│  • Manage local component state                                │
│  • Display validation errors and feedback                      │
│  • Accessibility (ARIA labels, keyboard navigation)            │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                                 │
│  Business Logic, Data Models, Validation, Formatting          │
│                                                                  │
│  Responsibilities:                                              │
│  • Define data models (TypeScript interfaces)                  │
│  • Validate form data (email, phone, required fields)          │
│  • Generate titles and file names                              │
│  • Format dates and times                                      │
│  • Inject tokens into HTML templates                           │
│  • Pure functions (no React, no side effects)                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    OUTPUT LAYER                                 │
│  Artifact Generation, Delivery Orchestration, File Handling    │
│                                                                  │
│  Responsibilities:                                              │
│  • Generate HTML artifacts                                     │
│  • Generate PDF artifacts (html2pdf.js)                        │
│  • Generate PNG artifacts (html-to-image)                      │
│  • Orchestrate sequential delivery                             │
│  • Handle file downloads                                       │
│  • Manage user notifications                                   │
└────────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

1. **Separation of Concerns**: Each layer has a clear responsibility
2. **Testability**: Domain layer can be unit tested without React
3. **Reusability**: Utilities can be reused in other projects
4. **Maintainability**: Changes to UI don't affect business logic
5. **Scalability**: Easy to replace one layer (e.g., UI framework)

---

## Component Hierarchy

### Visual Component Tree

```
App (Root)
│
├── ThemeSelector
│   └── Radio buttons for Light/Dark mode (session-level)
│
├── FormManager
│   │
│   ├── DeploymentForm (Instance 1)
│   │   ├── ApplicationSelector
│   │   ├── DeploymentInfoSection
│   │   │   ├── ChangeNumberInput
│   │   │   ├── ReleaseVersionInput
│   │   │   └── EnvironmentDropdown
│   │   ├── DeploymentTitleDisplay (read-only computed)
│   │   ├── ScheduleSection
│   │   │   ├── DeploymentDatePicker
│   │   │   ├── StartTimePicker
│   │   │   └── EndTimePicker
│   │   ├── OutageSection
│   │   │   ├── OutageIndicator (Yes/No radio)
│   │   │   ├── OutageStartDateTimePicker (conditional)
│   │   │   └── OutageEndDateTimePicker (conditional)
│   │   ├── ChangeItemsSection
│   │   │   ├── ChangeItemList
│   │   │   │   ├── ChangeItem 1
│   │   │   │   ├── ChangeItem 2
│   │   │   │   └── ...
│   │   │   └── Add/Remove Buttons
│   │   ├── ImpactSection
│   │   │   ├── ImpactItemList
│   │   │   │   ├── ImpactItem 1
│   │   │   │   ├── ImpactItem 2
│   │   │   │   └── ...
│   │   │   └── Add/Remove Buttons
│   │   ├── ContactSection
│   │   │   ├── ContactNameInput
│   │   │   ├── EmailInput
│   │   │   └── PhoneInput
│   │   └── FormActions
│   │       ├── ResetButton (with confirmation)
│   │       └── RemoveButton (conditionally enabled)
│   │
│   ├── DeploymentForm (Instance 2-5)
│   │   └── [Same structure as Instance 1]
│   │
│   ├── AddFormButton
│   │
│   └── ValidationErrorSummary (per form)
│
└── OutputGenerator
    ├── GenerateButton
    └── DeliveryResultsDisplay
        ├── SuccessMessage
        ├── ErrorMessages
        └── PopupBlockedWarning
```

### File Structure

```
src/
├── components/
│   ├── ApplicationSelector.tsx
│   ├── ChangeItemsSection.tsx
│   ├── ChangeItemsSection.test.tsx
│   ├── ComponentSnapshots.test.tsx
│   ├── ContactSection.tsx
│   ├── DeploymentForm.tsx
│   ├── DeploymentInfoSection.tsx
│   ├── DeploymentInfoSection.test.tsx
│   ├── DeploymentTitleDisplay.tsx
│   ├── FormManager.tsx
│   ├── ImpactSection.tsx
│   ├── ImpactSection.test.tsx
│   ├── OutageSection.tsx
│   ├── OutageSection.test.tsx
│   ├── ScheduleSection.tsx
│   ├── ScheduleSection.test.tsx
│   ├── ThemeSelector.tsx
│   ├── ValidationErrorSummary.tsx
│   ├── __snapshots__/
│   │   └── ComponentSnapshots.test.tsx.snap
│   ├── *.README.md (component documentation)
│   └── index.ts (exports)
│
├── data/
│   ├── formFactory.ts (create default forms)
│   ├── applicationCatalog.ts (5 applications)
│   └── index.ts
│
├── hooks/
│   ├── useFormManager.ts (form CRUD operations)
│   ├── useResetConfirmation.ts (reset confirmation dialog)
│   ├── useTheme.ts (light/dark mode)
│   ├── useOutputGenerator.ts (artifact generation)
│   └── index.ts
│
├── types/
│   ├── models.ts (DeploymentFormData, etc.)
│   ├── validation.ts (ValidationResult, ValidationError)
│   └── index.ts
│
├── utils/
│   ├── validators.ts (field and form validation)
│   ├── formatters.ts (title, date/time formatting)
│   ├── fileNamer.ts (file name generation + collision handling)
│   ├── templateInjector.ts (token replacement in HTML)
│   ├── templateProvider.ts (load HTML templates)
│   ├── artifactGenerator.ts (HTML/PDF/PNG generation)
│   ├── deliveryOrchestrator.ts (sequential delivery)
│   └── index.ts
│
├── App.tsx (main app component)
├── App.e2e.test.tsx
├── main.tsx (React entry point)
└── index.css
```

---

## Data Flow

### User Input to Artifact Generation

```
1. USER INTERACTION
   └─> User types in form field
   
2. COMPONENT STATE UPDATE
   └─> Form component updates local state
   └─> onChange/onBlur handlers called
   
3. VALIDATION (on blur or submit)
   └─> Validator functions check field format
   └─> Display error if invalid
   
4. FORM MANAGER UPDATES
   └─> Parent FormManager component updates
   └─> All 1-5 forms managed centrally
   
5. USER INITIATES GENERATION
   └─> User clicks "Generate Outputs" button
   
6. BATCH VALIDATION
   └─> Validate all forms, theme, and catalog
   └─> If errors: display errors, block generation
   └─> If valid: proceed to generation
   
7. ARTIFACT GENERATION (Domain Layer)
   └─> Load HTML template
   └─> Inject tokens with form data
   └─> Generate HTML string
   └─> Convert to PDF using html2pdf.js
   └─> Convert to PNG using html-to-image
   
8. SEQUENTIAL DELIVERY (Output Layer)
   └─> For each form:
       ├─> Open HTML in new tab
       ├─> Wait 500ms
       ├─> Trigger PDF download
       ├─> Wait 500ms
       ├─> Trigger PNG download
       ├─> Wait 500ms
   
9. DISPLAY RESULTS
   └─> Show success message
   └─> Show any errors
   └─> Show popup blocked warning (if applicable)
   
10. USER ACTION
    └─> User reviews/downloads artifacts
```

### Validation Flow

```
User Input
    ↓
Component onChange
    ↓
Auto-trim (for text fields)
    ↓
Update parent FormManager
    ↓
On blur: Field-level validation
    ├─> Email format check
    ├─> Phone format check
    ├─> Required field check
    ├─> Length check
    └─> Display inline error if invalid
    ↓
On submit: Form-level validation
    ├─> All required fields present
    ├─> Time ordering (end > start)
    ├─> Outage ordering
    ├─> List item counts and content
    ├─> Contact information
    └─> Display summary errors if invalid
    ↓
If all valid: Proceed to generation
If invalid: Block generation, show errors
```

### State Management Hierarchy

```
Global Session State (React Context)
├── Selected Theme (Light/Dark)
├── Application Catalog
│
Form-Level State (FormManager)
├── Array of DeploymentFormData objects
├── Form add/remove/reset operations
│
Form Data State (DeploymentForm props)
├── Application selection
├── Change number, Release version, Environment
├── Deployment date and times
├── Outage indicator and times
├── Change items list (1-999 items)
├── Impact items list (1-100 items)
├── Contact information
│
Component-Level State (Local)
├── Temporary input values (before validation)
├── UI state (dropdown open/closed, etc.)
├── Validation errors (per component)
```

---

## Domain Models

### Core Data Structures

#### DeploymentFormData

```typescript
interface DeploymentFormData {
  // Unique identifier
  formId: string;
  
  // Application Selection (required)
  application: Application | null;
  
  // Deployment Information
  changeNumber: string;           // max 20 chars, required
  releaseVersion: string;         // max 50 chars, required
  environment: Environment | null; // 'PROD' | 'QA' | 'ITEST' | 'DEV', required
  
  // Computed Title (read-only)
  deploymentTitle: string;
  
  // Schedule (all required)
  deploymentDate: Date;           // default: today
  startTime: Date;                // default: 20:00
  endTime: Date;                  // default: 22:00
  
  // Outage (optional)
  hasOutage: boolean;             // default: false
  outageStartDate: Date | null;   // only if hasOutage=true
  outageStartTime: Date | null;   // only if hasOutage=true
  outageEndDate: Date | null;     // only if hasOutage=true
  outageEndTime: Date | null;     // only if hasOutage=true
  
  // Change Items (1-999 required)
  changeItems: ChangeItem[];
  
  // Impact Items (1-100 required)
  impactItems: ImpactItem[];
  
  // Contact Information (all required)
  contactName: string;            // max 255 chars
  contactEmail: string;           // max 255 chars, email format
  contactPhone: string;           // max 255 chars, format: (###) ###-####
}
```

#### ChangeItem

```typescript
interface ChangeItem {
  id: string;                     // unique within form
  jiraNumber: string;             // 1-50 chars, required
  description: string;            // 1-500 chars, required
}
```

#### ImpactItem

```typescript
interface ImpactItem {
  id: string;                     // unique within form
  text: string;                   // 1-500 chars, required
}
```

#### Application

```typescript
interface Application {
  id: string;                     // unique identifier
  name: string;                   // display name
  notificationHeader: string;     // header text for templates
}
```

#### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];      // empty if valid
}

interface ValidationError {
  formId: string;                 // which form had error (or 'batch')
  field: string;                  // field name
  message: string;                // user-friendly message
}
```

#### DeliveryResult

```typescript
interface DeliveryResult {
  success: boolean;
  artifactsGenerated: number;     // 1-5 (number of forms)
  artifactsFailed: number;
  popupBlocked: boolean;
  errors: ArtifactError[];
}

interface ArtifactError {
  formId: string;
  artifactType: 'HTML' | 'PDF' | 'PNG';
  message: string;
}
```

---

## Component Descriptions

### Presentation Layer Components

#### 1. App.tsx

**Purpose**: Root component orchestrating the entire application

**Responsibilities**:
- Render ThemeSelector
- Render FormManager
- Render OutputGenerator button
- Provide global context (theme, catalog)
- Handle application-level state

**Props**: None (root component)

**Key Features**:
- Session-level theme selection
- Integration of all major sections
- Empty catalog banner display

---

#### 2. FormManager.tsx

**Purpose**: Manage the lifecycle of 1-5 deployment forms

**Responsibilities**:
- Render array of DeploymentForm instances
- Handle add form button (disabled at 5)
- Handle remove form button (disabled at 1)
- Maintain form data array
- Preserve form values during operations

**State**:
```typescript
- forms: DeploymentFormData[]
- nextFormId: number
```

**Methods**:
- addForm() → void
- removeForm(formId: string) → void
- updateForm(formId: string, updates: Partial<DeploymentFormData>) → void
- resetForm(formId: string) → void (with confirmation)

---

#### 3. DeploymentForm.tsx

**Purpose**: Render a single deployment form with all sections

**Responsibilities**:
- Compose all form sections
- Display validation errors
- Render Reset and Remove buttons
- Handle form-level actions

**Props**:
```typescript
interface DeploymentFormProps {
  formData: DeploymentFormData;
  formNumber: number;
  onUpdate: (updates: Partial<DeploymentFormData>) => void;
  onReset: () => void;
  onRemove: () => void;
  canRemove: boolean;
}
```

**Composed Sections**:
1. ApplicationSelector
2. DeploymentInfoSection
3. DeploymentTitleDisplay
4. ScheduleSection
5. OutageSection
6. ChangeItemsSection
7. ImpactSection
8. ContactSection

---

#### 4. Section Components

Each section component follows a similar pattern:

**ApplicationSelector**:
- Dropdown from APPLICATION_CATALOG
- Placeholder when empty
- Disabled when catalog empty

**DeploymentInfoSection**:
- Change Number input (max 20 chars, auto-trim on blur)
- Release Version input (max 50 chars, auto-trim on blur)
- Environment dropdown (PROD/QA/ITEST/DEV)

**DeploymentTitleDisplay**:
- Read-only text display
- Auto-updates within 500ms of changes
- Shows computed title or empty string

**ScheduleSection**:
- Deployment Date picker (picker-only)
- Start Time picker (picker-only)
- End Time picker (picker-only)
- Validation error if End Time ≤ Start Time

**OutageSection**:
- Yes/No radio buttons
- Conditional date/time pickers
- Show when Yes selected
- Hide and clear when No selected

**ChangeItemsSection**:
- Add/Remove buttons (max 999, min 1)
- Per-item Jira Number and Description inputs
- Validation errors for empty/invalid items

**ImpactSection**:
- Add/Remove buttons (max 100, min 1)
- Per-item text input (max 500 chars)
- Validation errors for empty/invalid items

**ContactSection**:
- Contact Name input (max 255 chars)
- Email input (format validation)
- Phone input (format: (###) ###-####)
- Validation errors adjacent to fields

**ThemeSelector**:
- Light Mode and Dark Mode radio buttons
- Default: Dark Mode
- Mutually exclusive (exactly one selected)

---

### Domain Layer Components (Utilities)

#### 5. validators.ts

**Field-Level Validators**:
```typescript
isValidEmail(email: string): boolean
isValidPhone(phone: string): boolean
isNonEmpty(value: string): boolean
isWithinLength(value: string, max: number): boolean
trimInput(value: string): string
```

**Form-Level Validator**:
```typescript
validateForm(data: DeploymentFormData): ValidationResult
  - Checks all required fields
  - Validates email and phone formats
  - Validates time ordering
  - Validates list counts and contents
  - Returns aggregated errors
```

**Batch Validator**:
```typescript
validateBatch(
  forms: DeploymentFormData[],
  theme: Theme | null,
  catalogEmpty: boolean
): ValidationResult
  - Validates all forms
  - Checks theme selected
  - Checks catalog non-empty
  - Returns aggregated errors
```

---

#### 6. formatters.ts

**Title Generation**:
```typescript
generateDeploymentTitle(data: DeploymentFormData): string
  - Format: [CHG#####] — [App: Version - Deploy Product to ENV]
  - Returns empty if any component missing
  - HTML-safe (no special chars that break HTML)
```

**Date/Time Formatting**:
```typescript
formatSchedule(date: Date, startTime: Date, endTime: Date): string
  - Format: Month DD, YYYY, HH:MM AM/PM–HH:MM AM/PM
  - Uses Intl.DateTimeFormat

formatYYYYMMDD(date: Date): string
  - Format: YYYYMMDD (e.g., 20250115)
```

---

#### 7. fileNamer.ts

**Base File Name Generation**:
```typescript
generateBaseFileName(data: DeploymentFormData): string | null
  - Format: Application_Environment_CHG#_YYYYMMDD
  - Replaces spaces with underscores
  - Returns null if any component missing
```

**Collision Handling**:
```typescript
detectCollisions(forms: DeploymentFormData[]): Map<string, DeploymentFormData[]>
  - Groups forms by base file name

disambiguateFileNames(forms: DeploymentFormData[]): Map<string, string>
  - Assigns suffixes (-1, -2, etc.) to collisions
  - First form in group gets no suffix
  - Maintains stable ordering
```

---

#### 8. templateInjector.ts

**Template Token Injection**:
```typescript
injectTemplate(template: string, data: DeploymentFormData): string
  - Replaces all tokens with form data
  - Escapes HTML in text tokens
  - Renders lists (change items, impact items)
  - Returns fully populated HTML
```

**Rendered Lists**:
```typescript
renderChangeItems(items: ChangeItem[]): string
  - Format: <strong>{jiraNumber}</strong> {description}
  - HTML-escapes all content

renderImpactItems(items: ImpactItem[]): string
  - Format: <ul><li>{text}</li></ul>
  - Preserves insertion order

renderOutageSection(hasOutage, startDate, startTime, endDate, endTime): string
  - Shows formatted outage window
  - Hidden if hasOutage=false
```

---

### Output Layer Components

#### 9. artifactGenerator.ts

**HTML Generation**:
```typescript
generateHTML(data: DeploymentFormData, theme: Theme): string
  - Loads template using TemplateProvider
  - Injects all tokens
  - Returns complete HTML
```

**PDF Generation**:
```typescript
generatePDF(htmlString: string, fileName: string): Promise<void>
  - Uses html2pdf.js
  - Handles errors gracefully
```

**PNG Generation**:
```typescript
generatePNG(htmlElement: HTMLElement, fileName: string): Promise<void>
  - Uses html-to-image
  - Handles errors gracefully
```

**HTML Tab Opener**:
```typescript
openHTMLTab(htmlString: string): boolean
  - Uses window.open with HTML content
  - Returns false if popup blocked
```

---

#### 10. deliveryOrchestrator.ts

**Sequential Delivery**:
```typescript
deliverArtifacts(bundles: ArtifactBundle[]): Promise<DeliveryResult>
  - Processes each bundle sequentially
  - For each bundle:
    1. Open HTML tab
    2. Wait 500ms
    3. Download PDF
    4. Wait 500ms
    5. Download PNG
    6. Wait 500ms
  - Continues on individual failures
  - Returns aggregated results
```

---

## State Management

### Form State Management Strategy

The application uses a **lift-state-up pattern** with React hooks:

1. **FormManager** holds the array of all DeploymentFormData
2. **DeploymentForm** receives data as props
3. **Section components** receive section data as props
4. **Input components** call `onUpdate` to propagate changes up

**Benefits**:
- Single source of truth (FormManager)
- Easy to validate all forms at once
- Easy to generate artifacts from current state
- Easy to reset/remove forms

---

### Theme State Management

**Global Context**:
```typescript
const ThemeContext = React.createContext<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}>(...);
```

**Usage**:
- ThemeSelector reads/writes to context
- App passes to OutputGenerator
- OutputGenerator uses for artifact generation

---

## Utility Functions

### Validation Pipeline

```
Input User Data
    ↓
Field-level validators (email, phone, required)
    ↓
Form-level validators (time ordering, list counts)
    ↓
Batch validators (all forms, theme, catalog)
    ↓
ValidationResult (isValid boolean, errors array)
```

### Template Injection Pipeline

```
Load HTML template
    ↓
Escape HTML in user text
    ↓
Render lists (change items, impact items)
    ↓
Replace token placeholders
    ↓
Return populated HTML
```

### Artifact Generation Pipeline

```
Validate batch
    ↓
Build artifact bundles
    ├─> Generate HTML for each form
    ├─> Compute file names (with collision handling)
    └─> Create bundles
    ↓
Deliver sequentially
    ├─> For each bundle:
    │   ├─> Open HTML tab
    │   ├─> Download PDF
    │   └─> Download PNG
    │   └─> Wait 500ms between
    └─> Return results
```

---

## Error Handling

### Validation Error Display

**Per-Field Errors**:
- Displayed adjacent to input field
- Shown on blur (not on change)
- Cleared when user corrects value

**Per-Form Summary**:
- Displayed above all sections
- Shows all errors in form
- Blocks generation until corrected

**Batch Errors**:
- Displayed at top of page
- Shows all errors across all forms
- Blocks generation

---

### Generation Error Handling

**Popup Blocked**:
- Detected: window.open returns null
- User notified: "Please enable pop-ups"
- Continue with remaining artifacts

**PDF/PNG Generation Failure**:
- Error caught: continue with next artifact
- User notified: "Failed to generate [type] for [form]"
- Continue with remaining forms

**Template Injection Error**:
- Should not occur (all data validated)
- If occurs: caught, form skipped, user notified

---

## Design Patterns

### 1. Component Composition

Components are built from smaller, focused components:
```
DeploymentForm
  ├─ ApplicationSelector
  ├─ DeploymentInfoSection
  │   ├─ ChangeNumberInput
  │   ├─ ReleaseVersionInput
  │   └─ EnvironmentDropdown
  └─ [more sections]
```

**Benefits**:
- Each component testable independently
- Reusable across forms
- Easy to understand responsibility

---

### 2. Unidirectional Data Flow

```
Parent State
    ↓
Pass data as props
    ↓
Child renders based on props
    ↓
Child calls callback (onUpdate, onRemove, etc.)
    ↓
Parent updates state
    ↓
Re-render
```

**Benefits**:
- Predictable data flow
- Easy to debug
- No prop drilling (in most cases)
- No circular dependencies

---

### 3. Pure Functions (Domain Layer)

All utility functions are pure:
```typescript
// Pure: same input → same output, no side effects
const validateEmail = (email: string): boolean => {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email);
};

// Not pure: depends on external state, has side effects
const saveToDatabase = (data: Data): void => {
  database.save(data);
};
```

**Benefits**:
- Easy to test
- No hidden dependencies
- Easy to reason about
- Easy to reuse

---

### 4. Error Aggregation

Errors are collected and returned, not thrown:
```typescript
// ✅ Good: Errors returned, execution continues
const validateBatch = (forms): ValidationResult => {
  const errors = [];
  forms.forEach(form => {
    errors.push(...validateForm(form).errors);
  });
  return { isValid: errors.length === 0, errors };
};

// ❌ Bad: Throws error, stops execution
const validateBatch = (forms) => {
  forms.forEach(form => {
    if (!form.isValid) throw new Error('Invalid form');
  });
};
```

**Benefits**:
- Display all errors at once
- Don't block entire batch for single error
- Better user experience

---

### 5. Context + Hooks for Global State

```typescript
// Global context for theme
const ThemeContext = createContext();

// Hook for accessing theme
const useTheme = () => {
  return useContext(ThemeContext);
};

// Usage in components
const MyComponent = () => {
  const { theme, setTheme } = useTheme();
  // ...
};
```

**Benefits**:
- Avoid prop drilling
- Cleaner component props
- Centralized global state

---

## Summary

The Deployment Notification Generator uses a clean, layered architecture that:

1. **Separates concerns** into presentation, domain, and output layers
2. **Uses composition** to build complex components from simpler ones
3. **Follows unidirectional data flow** for predictability
4. **Uses pure functions** in the domain layer for testability
5. **Aggregates errors** for better user feedback
6. **Manages global state** with Context API
7. **Handles errors gracefully** with recovery and fallback logic

This makes the codebase **maintainable**, **testable**, and **scalable**.

---

**Last Updated**: 2025  
**Related Docs**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md), [Design Document](/.kiro/specs/deployment-notification-generator/design.md)
