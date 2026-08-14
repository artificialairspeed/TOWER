# Design Document: Deployment Notification Generator Portal

## Overview

The Deployment Notification Generator Portal is a client-side React web application that enables deployment coordinators to create and manage deployment notification artifacts efficiently. The portal provides a form-based interface for entering deployment metadata and generates HTML, PDF, and PNG outputs by populating pre-existing templates with user-supplied data.

### Core Design Principles

- **Single-Page Application**: Pure client-side implementation with no backend dependencies
- **Session-Based State**: All data exists only in browser memory during the session
- **Multi-Form Management**: Support for up to 5 simultaneous deployment forms
- **Template-Driven Output**: Leverages existing HTML templates with token-based injection
- **Sequential Delivery**: Staggered artifact generation to prevent browser throttling

### Technology Stack

- **Framework**: React 18+ with TypeScript
- **UI Library**: Material UI (MUI) v5+
- **PDF Generation**: html2pdf.js
- **Image Generation**: html-to-image
- **Date Formatting**: Intl.DateTimeFormat API
- **Build Tool**: Vite or Create React App
- **State Management**: React Context API or local component state

## Architecture

### Component Hierarchy

```
App
├── ThemeSelector (Session-level theme control)
├── FormManager (Container for deployment forms)
│   ├── DeploymentForm (1-5 instances)
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
│   │   │   ├── OutageIndicator (Yes/No)
│   │   │   ├── OutageStartDateTimePicker
│   │   │   └── OutageEndDateTimePicker
│   │   ├── ChangeItemsSection
│   │   │   └── ChangeItemList (1-999 items)
│   │   ├── ImpactSection
│   │   │   └── ImpactItemList (1-100 items)
│   │   ├── ContactSection
│   │   │   ├── ContactNameInput
│   │   │   ├── EmailInput
│   │   │   └── PhoneInput
│   │   └── FormActions (Reset, Remove)
│   └── AddFormButton
└── OutputGenerator (Generate button + orchestration logic)
```

### Data Flow

1. **User Input → Form State**: Form inputs update local component state
2. **Form State → Validation**: Validator component checks completeness and format
3. **Validated Data → Template Population**: Output Generator injects data into HTML templates
4. **Populated Templates → Artifacts**: Generation libraries produce HTML/PDF/PNG files
5. **Artifacts → User**: Sequential delivery with 500ms intervals

### State Management Strategy

#### Global State (React Context)
- Selected theme (Light/Dark Mode)
- Application catalog
- All deployment form instances
- Validation errors

#### Local Component State
- Individual form field values
- Form-specific UI state (collapsed/expanded)
- Temporary input values before validation

## Components and Interfaces

### Core Components

#### 1. FormManager Component

**Responsibility**: Manages lifecycle of deployment form instances

**Props**:
```typescript
interface FormManagerProps {
  maxForms: number; // 5
}
```

**State**:
```typescript
interface FormManagerState {
  forms: DeploymentFormData[];
  nextFormId: number;
}
```

**Methods**:
- `addForm(): void` - Creates new form instance (max 5)
- `removeForm(formId: string): void` - Removes form if count > 1
- `resetForm(formId: string): void` - Clears form data with confirmation

#### 2. DeploymentForm Component

**Props**:
```typescript
interface DeploymentFormProps {
  formId: string;
  formData: DeploymentFormData;
  onUpdate: (formId: string, data: Partial<DeploymentFormData>) => void;
  onRemove: (formId: string) => void;
  onReset: (formId: string) => void;
  isRemovable: boolean;
  applicationCatalog: Application[];
}
```

**State**:
```typescript
interface DeploymentFormData {
  application: string | null;
  changeNumber: string;
  releaseVersion: string;
  environment: 'PROD' | 'QA' | 'ITEST' | 'DEV' | null;
  deploymentDate: Date;
  startTime: Date;
  endTime: Date;
  hasOutage: boolean;
  outageStartDate: Date | null;
  outageStartTime: Date | null;
  outageEndDate: Date | null;
  outageEndTime: Date | null;
  changeItems: ChangeItem[];
  impactItems: ImpactItem[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}
```

#### 3. TitleGenerator Component

**Responsibility**: Computes deployment title in real-time

**Format**: `[CHG#####] — [Application Name: Release Version - Deploy Product to ENVIRONMENT]`

**Implementation**:
```typescript
const generateTitle = (data: DeploymentFormData): string => {
  if (!data.application || !data.changeNumber || !data.releaseVersion || !data.environment) {
    return '';
  }
  return `[${data.changeNumber}] — [${data.application}: ${data.releaseVersion} - Deploy Product to ${data.environment}]`;
};
```

#### 4. Validator Component

**Responsibility**: Field completeness and format validation

**Validation Rules**:
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  formId: string;
  field: string;
  message: string;
}
```

**Validation Checks**:
- Required field presence
- Email format: standard regex pattern
- Phone format: `(###) ###-####`
- Time logic: End Time > Start Time
- Outage logic: Outage End > Outage Start
- Change Items: 1-999 items, non-empty Jira Number and Description
- Impact Items: 1-100 items, non-empty text, max 500 chars

#### 5. OutputGenerator Component

**Responsibility**: Artifact generation and delivery orchestration

**Methods**:
```typescript
class OutputGenerator {
  async generateAllOutputs(
    forms: DeploymentFormData[],
    theme: Theme,
    templates: Templates
  ): Promise<GenerationResult>;
  
  private async generateHTML(data: DeploymentFormData, template: string): Promise<Blob>;
  private async generatePDF(html: HTMLElement): Promise<Blob>;
  private async generatePNG(html: HTMLElement): Promise<Blob>;
  
  private async deliverArtifacts(artifacts: Artifact[]): Promise<void>;
}
```

**Sequential Delivery Logic**:
1. Validate all forms first
2. Generate all artifacts for all forms
3. Deliver artifacts sequentially with 500ms intervals
4. Handle failures gracefully (continue with remaining artifacts)

#### 6. FileNamer Component

**Responsibility**: Generate consistent file names

**Format**: `<Application>_<Environment>_<CHG#>_<YYYYMMDD>.<ext>`

**Implementation**:
```typescript
class FileNamer {
  generateBaseName(data: DeploymentFormData): string {
    const app = data.application.replace(/ /g, '_');
    const env = data.environment;
    const chg = data.changeNumber.replace(/ /g, '_');
    const date = formatDate(data.deploymentDate, 'YYYYMMDD');
    return `${app}_${env}_${chg}_${date}`;
  }
  
  handleCollisions(baseNames: string[]): string[] {
    // Append suffixes (-1, -2, etc.) for collisions
    const counts = new Map<string, number>();
    return baseNames.map(name => {
      const count = counts.get(name) || 0;
      counts.set(name, count + 1);
      return count > 0 ? `${name}-${count}` : name;
    });
  }
}
```

### Data Models

#### Application

```typescript
interface Application {
  id: string;
  name: string;
  notificationHeader: string;
}
```

#### ChangeItem

```typescript
interface ChangeItem {
  id: string;
  jiraNumber: string; // 1-50 chars
  description: string; // 1-500 chars
}
```

#### ImpactItem

```typescript
interface ImpactItem {
  id: string;
  text: string; // 1-500 chars
}
```

#### Template Tokens

The HTML templates use the following token placeholders:

- `{{NOTIFICATION_HEADER}}` - Application-specific header
- `{{DEPLOYMENT_TITLE}}` - Computed deployment title
- `{{DEPLOYMENT_ID}}` - Change number
- `{{DEPLOYMENT_SCHEDULE}}` - Formatted date/time
- `{{OUTAGE_WINDOW}}` - Outage details (if applicable)
- `{{CHANGE_ITEMS}}` - HTML list of change items
- `{{IMPACT_ITEMS}}` - HTML list of impact items
- `{{CONTACT_NAME}}` - Contact name
- `{{CONTACT_EMAIL}}` - Contact email
- `{{CONTACT_PHONE}}` - Contact phone

## Data Models

### DeploymentFormData (Complete Schema)

```typescript
interface DeploymentFormData {
  // Unique identifier
  formId: string;
  
  // Application Selection
  application: Application | null;
  
  // Deployment Information
  changeNumber: string; // max 20 chars, includes CHG prefix
  releaseVersion: string; // max 50 chars
  environment: 'PROD' | 'QA' | 'ITEST' | 'DEV' | null;
  
  // Computed Title (read-only)
  deploymentTitle: string;
  
  // Schedule
  deploymentDate: Date;
  startTime: Date; // default 20:00
  endTime: Date; // default 22:00
  
  // Outage
  hasOutage: boolean; // default false
  outageStartDate: Date | null;
  outageStartTime: Date | null;
  outageEndDate: Date | null;
  outageEndTime: Date | null;
  
  // Change Items (1-999)
  changeItems: ChangeItem[];
  
  // Impact Items (1-100)
  impactItems: ImpactItem[];
  
  // Contact Information
  contactName: string; // max 255 chars
  contactEmail: string; // max 255 chars
  contactPhone: string; // max 255 chars, format (###) ###-####
}
```

### Application Catalog

```typescript
const APPLICATION_CATALOG: Application[] = [
  {
    id: 'ao-crew-training',
    name: 'AO Crew Training',
    notificationHeader: 'AO Crew Training Deployment Notification'
  },
  {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  },
  {
    id: 'crew-mobile',
    name: 'Crew Mobile',
    notificationHeader: 'Crew Mobile Deployment Notification'
  },
  {
    id: 'learning-management',
    name: 'Learning Management',
    notificationHeader: 'Learning Management Deployment Notification'
  },
  {
    id: 'administration-portal',
    name: 'Administration Portal',
    notificationHeader: 'Administration Portal Deployment Notification'
  }
];
```

## Error Handling

### Validation Error Handling

```typescript
interface ValidationErrorDisplay {
  // Display inline errors adjacent to fields
  showFieldError(formId: string, fieldName: string, message: string): void;
  
  // Display summary errors at form or page level
  showSummaryError(errors: ValidationError[]): void;
  
  // Clear errors when user corrects input
  clearFieldError(formId: string, fieldName: string): void;
}
```

### Generation Error Handling

```typescript
interface GenerationErrorHandling {
  // Failed artifact generation
  onArtifactGenerationFailed(
    formId: string,
    artifactType: 'HTML' | 'PDF' | 'PNG',
    error: Error
  ): void;
  
  // Browser blocking (pop-ups)
  onPopupBlocked(): void;
  
  // Download failure
  onDownloadFailed(fileName: string): void;
}
```

**Error Recovery Strategy**:
1. **Validation Errors**: Block generation, display all errors, preserve data
2. **Generation Errors**: Continue with remaining artifacts, log failures, notify user
3. **Browser Restrictions**: Display instructions to enable pop-ups/downloads
4. **Partial Success**: Deliver successful artifacts, report failures clearly

### User-Facing Error Messages

- **Validation**: "Please complete all required fields before generating outputs"
- **Email Format**: "Please enter a valid email address (example@domain.com)"
- **Phone Format**: "Please enter phone number as (###) ###-####"
- **Time Logic**: "End Time must be later than Start Time"
- **Popup Blocked**: "Please allow pop-ups to view HTML notifications"
- **Generation Failed**: "Failed to generate [artifact type] for [form name]. Please try again."

## Testing Strategy

### Testing Approach

This feature uses a **unit testing and integration testing** approach rather than property-based testing. Property-based testing is **not appropriate** for this feature because:

1. **UI Rendering**: The primary functionality involves React component rendering and user interactions, which are better tested with snapshot tests and integration tests
2. **Side-Effect Operations**: Artifact generation (PDF/PNG creation, file downloads) are side-effect-only operations with no meaningful return values to assert universal properties on
3. **Browser API Dependencies**: Heavy reliance on browser APIs (html2pdf.js, html-to-image, native pickers) that are not pure functions
4. **Template Population**: String replacement operations are deterministic but simple enough for unit tests

The testing strategy focuses on:
- **Unit Tests**: Test individual validation functions, formatting logic, and data transformations
- **Integration Tests**: Test form workflows, validation chains, and artifact generation with mocked libraries
- **Component Tests**: Use React Testing Library for user interaction testing
- **Snapshot Tests**: Verify UI component rendering consistency
- **E2E Tests**: Validate complete user workflows with tools like Cypress or Playwright

### Unit Testing

**Target Coverage**: Individual validation functions, formatters, and utility functions

**Test Cases**:
- Email validation with valid/invalid formats
- Phone validation with various formats
- Title generation with different input combinations
- File name generation and collision handling
- Date formatting with Intl.DateTimeFormat
- Token replacement in template strings

**Example**:
```typescript
describe('Validator', () => {
  test('validates email format correctly', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });
  
  test('validates phone format', () => {
    expect(validatePhone('(555) 123-4567')).toBe(true);
    expect(validatePhone('555-123-4567')).toBe(false);
  });
  
  test('validates time order', () => {
    const start = new Date('2025-01-01T20:00:00');
    const end = new Date('2025-01-01T22:00:00');
    expect(validateTimeOrder(start, end)).toBe(true);
  });
});
```

### Integration Testing

**Target Coverage**: Form workflows, validation chains, artifact generation

**Test Cases**:
- Complete form submission with valid data
- Form validation with missing required fields
- Multi-form management (add, remove, reset)
- Theme selection and application across forms
- Artifact generation workflow (mocked html2pdf and html-to-image)

**Example**:
```typescript
describe('DeploymentForm Integration', () => {
  test('blocks generation when validation fails', async () => {
    const { getByText, getByLabelText } = render(<App />);
    
    // Leave required field empty
    fireEvent.change(getByLabelText('Change Number'), { target: { value: '' } });
    
    // Attempt generation
    fireEvent.click(getByText('Generate Outputs'));
    
    // Expect error message
    expect(screen.getByText(/Please complete all required fields/i)).toBeInTheDocument();
  });
});
```

### Component Testing (React Testing Library)

**Target Coverage**: User interactions, component rendering, state updates

**Test Cases**:
- Form field input and validation
- Add/Remove form buttons enable/disable logic
- Outage section show/hide based on indicator
- Deployment title updates in real-time
- Contact section validation feedback

### Snapshot Testing

**Target Coverage**: UI component consistency

**Test Cases**:
- DeploymentForm initial render
- FormManager with multiple forms
- Validation error states
- Theme selector appearance

### End-to-End Testing

**Target Coverage**: Complete user workflows

**Test Scenarios**:
1. **Single Deployment Flow**: Fill form, generate outputs, verify artifacts
2. **Multi-Deployment Flow**: Add 3 forms, fill all, generate outputs sequentially
3. **Validation Flow**: Submit incomplete form, see errors, correct, submit successfully
4. **Reset Flow**: Fill form, reset with confirmation, verify cleared state
5. **Theme Switch**: Generate with Dark Mode, switch to Light Mode, generate again

**Tools**: Cypress or Playwright

## Additional Considerations

### Accessibility

**WCAG Compliance** (Target: WCAG 2.1 Level AA):
- Keyboard navigation for all form controls
- ARIA labels for form sections and dynamic content
- Focus management during validation errors
- Screen reader announcements for validation feedback
- Color contrast compliance (4.5:1 for normal text)
- Accessible date/time pickers (native HTML5 inputs)

### Performance Optimization

**Strategies**:
- Debounced validation for real-time title updates (300ms)
- Lazy loading of html2pdf.js and html-to-image
- Memoization of computed values (deployment title)
- Virtual scrolling for large change/impact item lists
- Code splitting for artifact generation logic

### Browser Compatibility

**Target Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Polyfills**:
- Intl.DateTimeFormat for older Safari
- Promise polyfill if targeting older browsers

### Security Considerations

**Client-Side Security**:
- Input sanitization before template injection (XSS prevention)
- CSP headers to prevent script injection
- No localStorage/sessionStorage usage (data not persisted)
- Validate all user inputs before processing

### Future Enhancements (Out of Scope)

- Backend persistence of deployment data
- User authentication and authorization
- Email notification sending
- Deployment history tracking
- Template customization UI
- Bulk import from CSV/JSON
- Undo/Redo functionality
- Auto-save to localStorage with user consent

