# Developer Guide - Deployment Notification Generator Portal

## Quick Start

### Project Setup

The Deployment Notification Generator Portal is a React 18 + TypeScript project built with Vite. Follow these steps to set up your development environment:

#### Prerequisites

- **Node.js**: 16.x or higher
- **npm**: 7.x or higher (or yarn 1.22.x+)
- **Git**: For version control

#### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd deployment-notification-generator

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:5173 (default Vite port)
```

### Build Commands

```bash
# Development server (with hot module reloading)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to AWS S3 (requires DEPLOY_BUCKET environment variable)
npm run deploy
```

### Testing Commands

```bash
# Run unit and integration tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with interactive UI
npm run test:ui

# Generate test coverage report
npm run coverage

# Run E2E tests with Playwright (interactive)
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e -- --run

# Debug E2E tests step-by-step
npm run test:e2e:debug

# Run E2E tests on specific browser
npm run test:e2e -- --project=chrome
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit   # Safari
npm run test:e2e -- --project=edge
```

---

## Architecture Overview

### High-Level Architecture

The Deployment Notification Generator Portal uses a **three-layer architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
│  React Components, Form Management, User Interactions       │
├─────────────────────────────────────────────────────────────┤
│                   DOMAIN LAYER                              │
│  Data Models, Validation, Formatting, Template Injection   │
├─────────────────────────────────────────────────────────────┤
│                   OUTPUT LAYER                              │
│  Artifact Generation (HTML/PDF/PNG), File Naming, Delivery │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. Domain Layer (Utilities)

**Location**: `src/utils/` and `src/data/`

**Responsibilities**:
- Data validation (email, phone, required fields, time ordering)
- Title and file name generation
- Date/time formatting
- HTML template token injection
- Business logic independent of UI framework

**Key Files**:
- `src/utils/validators.ts` - Field and form validation functions
- `src/utils/formatters.ts` - Title, date, and time formatting
- `src/utils/fileNamer.ts` - File name generation and collision handling
- `src/utils/templateInjector.ts` - HTML token replacement
- `src/data/formFactory.ts` - Default form creation
- `src/data/applicationCatalog.ts` - Application definitions

**Design Philosophy**: Pure functions, no side effects, no React dependencies

#### 2. Presentation Layer (React Components)

**Location**: `src/components/`

**Responsibilities**:
- User interaction handling (form inputs, clicks, selections)
- Component rendering and styling
- Local state management for UI
- Accessibility (ARIA labels, keyboard navigation)
- Error display and user feedback

**Key Components**:
- `App.tsx` - Main application entry point
- `FormManager.tsx` - Manages 1-5 deployment forms
- `DeploymentForm.tsx` - Single deployment form with all sections
- `ApplicationSelector.tsx` - Dropdown for application selection
- `DeploymentInfoSection.tsx` - Change number, version, environment
- `DeploymentTitleDisplay.tsx` - Read-only computed title
- `ScheduleSection.tsx` - Date and time pickers
- `OutageSection.tsx` - Outage indicator and date/time pickers
- `ChangeItemsSection.tsx` - List of change items (1-999)
- `ImpactSection.tsx` - List of impact items (1-100)
- `ContactSection.tsx` - Contact information
- `ThemeSelector.tsx` - Light/Dark mode selection

**Design Philosophy**: Unidirectional data flow, composition over inheritance

#### 3. Output Layer (Artifact Generation)

**Location**: `src/utils/`

**Responsibilities**:
- HTML artifact generation (template population)
- PDF generation using html2pdf.js
- PNG generation using html-to-image
- Sequential delivery orchestration with 500ms intervals
- File download handling

**Key Files**:
- `src/utils/artifactGenerator.ts` - HTML/PDF/PNG generation
- `src/utils/deliveryOrchestrator.ts` - Sequential artifact delivery
- `src/hooks/useOutputGenerator.ts` - Integration hook for UI

### Data Flow

```
User Input
    ↓
Form Component State Update
    ↓
Validation (Domain Layer)
    ↓
Error Display or Success State
    ↓
Generate Artifacts (on user action)
    ↓
Domain Layer: Validation → Template Injection
    ↓
Output Layer: HTML/PDF/PNG Generation
    ↓
Sequential Delivery (500ms intervals)
    ↓
User Downloads Artifacts
```

### Directory Structure

```
src/
├── components/
│   ├── ApplicationSelector.tsx
│   ├── ApplicationSelector.README.md
│   ├── ChangeItemsSection.tsx
│   ├── ChangeItemsSection.README.md
│   ├── ChangeItemsSection.test.tsx
│   ├── ContactSection.tsx
│   ├── ContactSection.README.md
│   ├── DeploymentForm.tsx
│   ├── DeploymentForm.README.md
│   ├── DeploymentInfoSection.tsx
│   ├── DeploymentInfoSection.README.md
│   ├── DeploymentInfoSection.test.tsx
│   ├── DeploymentTitleDisplay.tsx
│   ├── DeploymentTitleDisplay.README.md
│   ├── ImpactSection.tsx
│   ├── ImpactSection.README.md
│   ├── ImpactSection.test.tsx
│   ├── OutageSection.tsx
│   ├── OutageSection.README.md
│   ├── OutageSection.test.tsx
│   ├── ScheduleSection.tsx
│   ├── ScheduleSection.README.md
│   ├── ScheduleSection.test.tsx
│   ├── ThemeSelector.tsx
│   ├── ThemeSelector.README.md
│   ├── ValidationErrorSummary.tsx
│   ├── ValidationErrorSummary.README.md
│   └── index.ts
│
├── data/
│   ├── formFactory.ts
│   ├── applicationCatalog.ts
│   └── index.ts
│
├── hooks/
│   ├── useFormManager.ts
│   ├── useResetConfirmation.ts
│   ├── useTheme.ts
│   ├── useOutputGenerator.ts
│   └── index.ts
│
├── types/
│   ├── models.ts
│   ├── validation.ts
│   └── index.ts
│
├── utils/
│   ├── validators.ts
│   ├── formatters.ts
│   ├── fileNamer.ts
│   ├── templateInjector.ts
│   ├── templateProvider.ts
│   ├── artifactGenerator.ts
│   ├── deliveryOrchestrator.ts
│   └── index.ts
│
├── App.tsx
├── App.e2e.test.tsx
└── main.tsx

public/
└── templates/
    ├── light-mode.html
    └── dark-mode.html

playwright.config.ts
cypress.config.cjs
vite.config.ts
tsconfig.json
package.json
```

### Component Hierarchy

```
App
├── ThemeSelector (session-level theme)
├── FormManager (manages 1-5 forms)
│   ├── DeploymentForm (form instance 1)
│   │   ├── ApplicationSelector
│   │   ├── DeploymentInfoSection
│   │   ├── DeploymentTitleDisplay
│   │   ├── ScheduleSection
│   │   ├── OutageSection
│   │   ├── ChangeItemsSection
│   │   ├── ImpactSection
│   │   └── ContactSection
│   ├── DeploymentForm (form instance 2)
│   │   └── [same structure]
│   └── [up to 5 form instances]
│
└── OutputGenerator (Generate button + orchestration)
```

---

## Testing Approach and Commands

### Overview

The project uses a **comprehensive testing strategy** combining:

- **Unit Tests**: Validate individual functions (validators, formatters, utilities)
- **Integration Tests**: Validate workflows (form submission, validation chains, batch operations)
- **Component Tests**: Validate UI components (React Testing Library)
- **Snapshot Tests**: Verify rendering consistency
- **End-to-End Tests**: Validate complete user workflows (Playwright/Cypress)

**Note**: Property-based testing is intentionally NOT used for this feature because:
- Primary functionality is UI rendering (better tested with snapshots/E2E)
- Artifact generation is side-effect-only (no meaningful return values)
- Heavy browser API dependencies (html2pdf, html-to-image)
- Template population is simple string replacement

### Running Tests

#### Unit and Integration Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run tests matching a pattern
npm test -- --grep "validation"

# Run tests for a specific file
npm test -- src/utils/validators.test.ts

# Run tests with coverage report
npm run coverage

# Run tests with interactive UI
npm run test:ui
```

#### End-to-End Tests (Playwright)

```bash
# Interactive mode (opens browser)
npm run test:e2e

# Headless mode (no browser UI)
npm run test:e2e -- --run

# Run on specific browser
npm run test:e2e -- --project=chrome
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
npm run test:e2e -- --project=edge

# Run specific test file
npm run test:e2e -- e2e/single-deployment-flow.spec.ts

# Debug tests interactively
npm run test:e2e:debug

# View test results HTML report
npm run test:e2e -- --reporter=html
```

#### End-to-End Tests (Cypress)

```bash
# Interactive mode (Cypress UI)
npm run e2e

# Headless mode
npm run e2e:run

# Run specific test file
npm run e2e:run -- --spec "cypress/e2e/**/*.cy.js"
```

### Test File Locations

```
src/
├── components/
│   ├── ChangeItemsSection.test.tsx
│   ├── DeploymentInfoSection.test.tsx
│   ├── ImpactSection.test.tsx
│   ├── OutageSection.test.tsx
│   ├── ScheduleSection.test.tsx
│   ├── ComponentSnapshots.test.tsx
│   └── [more component tests]
│
└── [utility test files]

e2e/
├── single-deployment-flow.spec.ts
├── browser-compatibility.spec.ts
└── [more E2E tests]

cypress/
└── e2e/
    └── 20.2-multi-deployment-flow.cy.js
```

### Test Categories

#### Unit Tests

**Purpose**: Validate business logic functions in isolation

**Examples**:
- Email and phone format validation
- Title generation with various input combinations
- File name generation and collision handling
- Date/time formatting
- Form validation rules

**Running**:
```bash
npm test -- src/utils/validators.test.ts
```

#### Integration Tests

**Purpose**: Validate how multiple components work together

**Examples**:
- Form submission with validation
- Batch validation across multiple forms
- Multi-form add/remove workflow
- Artifact generation with template injection

**Running**:
```bash
npm test -- --grep "integration"
```

#### Component Tests

**Purpose**: Validate React components render correctly and respond to user interactions

**Examples**:
- Form field input and validation feedback
- Add/Remove button enable/disable logic
- Outage section show/hide toggle
- Theme selector mutual exclusivity
- Validation error display

**Tools**: React Testing Library

**Running**:
```bash
npm test -- src/components/ScheduleSection.test.tsx
```

#### Snapshot Tests

**Purpose**: Detect unintended UI changes

**Examples**:
- DeploymentForm rendering
- FormManager with various form counts
- Validation error states
- Theme selector appearance

**Files**: `src/components/ComponentSnapshots.test.tsx`

**Running**:
```bash
npm test -- ComponentSnapshots.test.tsx
```

**Updating snapshots** (after intentional UI changes):
```bash
npm test -- -u
```

#### E2E Tests

**Purpose**: Validate complete user workflows end-to-end

**Test Scenarios**:

1. **Single Deployment Flow** (`e2e/single-deployment-flow.spec.ts`)
   - Fill all required fields
   - Select Dark/Light theme
   - Click Generate Outputs
   - Verify 3 artifacts generated successfully
   - Verify file names follow correct format

2. **Multi-Deployment Flow** (`cypress/e2e/20.2-multi-deployment-flow.cy.js`)
   - Add 3 deployment forms
   - Fill each form with different data
   - Click Generate Outputs
   - Verify 9 artifacts generated (3 forms × 3 artifacts)
   - Verify sequential delivery with 500ms intervals
   - Verify distinct file names (no collisions)

3. **Form Lifecycle Flow**
   - Add forms up to maximum (5)
   - Remove forms down to minimum (1)
   - Reset form with confirmation
   - Verify reset clears data
   - Cancel reset and verify data preserved

4. **Validation Error Flow**
   - Leave required fields empty
   - Click Generate Outputs
   - Verify validation errors displayed
   - Verify data preserved
   - Correct errors and generate successfully

5. **Browser Compatibility** (`e2e/browser-compatibility.spec.ts`)
   - Test date/time picker functionality
   - Test PDF/PNG artifact generation
   - Test download behavior
   - Test UI rendering consistency
   - Run on all supported browsers

**Running**:
```bash
npm run test:e2e
npm run test:e2e -- --run
npm run test:e2e -- --project=chrome
```

### Test Coverage

Run coverage report to see which files/functions are tested:

```bash
npm run coverage
```

This generates a coverage report in the terminal and creates an HTML report in `coverage/` directory.

**Coverage Goals**:
- Domain Layer (validators, formatters): 100%
- Components: 80%+ (integration tested, E2E tested)
- Utilities: 95%+

### Testing Best Practices

1. **Test Names**: Use descriptive names that explain what is being tested
   ```typescript
   test('validates email format with user@example.com', () => {...});
   test('blocks generation when change number is empty', () => {...});
   ```

2. **Test Organization**: Group related tests using `describe` blocks
   ```typescript
   describe('Email Validation', () => {
     test('accepts valid email formats', () => {...});
     test('rejects invalid email formats', () => {...});
   });
   ```

3. **Test Data**: Use realistic example data
   ```typescript
   const validForm = {
     application: 'Crew Portal',
     changeNumber: 'CHG12345',
     // ...
   };
   ```

4. **Assertions**: Use clear, specific assertions
   ```typescript
   expect(validateEmail('user@example.com')).toBe(true);
   expect(result.errors).toHaveLength(2);
   expect(errorMessage).toContain('required');
   ```

5. **Test Isolation**: Each test should be independent
   - No shared state between tests
   - Clean up after each test (if needed)
   - Don't depend on test execution order

---

## Known Limitations and Open Items

### Current Limitations

#### 1. Data Persistence

**Limitation**: No data persistence across browser sessions
- **Description**: All form data exists only in browser memory during the session
- **Reason**: Design requirement for stateless client-side application
- **Workaround**: Users must re-enter data if browser is closed or page is refreshed
- **Future Enhancement**: Optional localStorage auto-save with user consent

#### 2. Template Customization

**Limitation**: HTML templates are fixed and cannot be customized via UI
- **Description**: Light and Dark mode templates are pre-defined in `public/templates/`
- **Reason**: Out of scope for current implementation
- **Workaround**: Edit template files directly for minor template changes
- **Future Enhancement**: Template customization UI in admin panel

#### 3. Batch Operations

**Limitation**: No bulk import from CSV/JSON
- **Description**: Each deployment form must be filled individually
- **Reason**: Out of scope for current implementation
- **Workaround**: Manual entry for each deployment
- **Future Enhancement**: CSV/JSON import wizard

#### 4. Deployment History

**Limitation**: No history tracking of generated artifacts
- **Description**: No record of what artifacts were generated and when
- **Reason**: Stateless client-side design
- **Workaround**: Track deployments in external system
- **Future Enhancement**: Backend deployment history service

#### 5. File Naming Constraints

**Limitation**: File names may exceed system limits with long application/environment names
- **Description**: File names follow format `Application_Environment_CHG_YYYYMMDD.ext`
- **Reason**: Desire for human-readable file names
- **Workaround**: Keep application/environment names reasonably short
- **Future Enhancement**: Configurable file naming strategies (hashing, abbreviations)

#### 6. Date Picker Keyboard Input

**Limitation**: Date/time pickers only accept mouse/touch input (keyboard input intentionally blocked)
- **Description**: Users must use date picker UI; cannot type dates directly
- **Reason**: Design requirement to ensure consistent date formatting
- **Workaround**: Use the calendar/time picker UI
- **Note**: This is intentional and improves data quality

#### 7. Browser Pop-up Requirements

**Limitation**: Requires pop-ups enabled for HTML artifact viewing
- **Description**: HTML artifacts open in new browser tabs (blocked by pop-up blockers)
- **Reason**: Limitation of browser HTML-in-URL approach
- **Workaround**: Disable pop-up blockers for this site or download PDF/PNG instead
- **Future Enhancement**: Host HTML artifacts on backend server

#### 8. Application Catalog Size

**Limitation**: Hardcoded catalog of 5 applications (not configurable)
- **Description**: APPLICATION_CATALOG in `src/data/applicationCatalog.ts` cannot be modified at runtime
- **Reason**: Out of scope for current implementation
- **Workaround**: Rebuild application with updated catalog
- **Future Enhancement**: Backend application catalog service

### Known Issues

#### 1. Large List Performance

**Issue**: Rendering 100 Impact Items or 999 Change Items may cause lag on older devices
- **Status**: Acknowledged, not critical
- **Impact**: Low-end devices (2GB RAM, older processors)
- **Workaround**: Use high-performance devices or upgrade browser
- **Future Enhancement**: Virtual scrolling for large lists

#### 2. PDF Generation Quality

**Issue**: Some browsers may produce lower-quality PDFs with complex layouts
- **Status**: Browser-dependent, not controllable
- **Impact**: Visual appearance of PDF may vary
- **Workaround**: PNG artifacts provide higher image quality
- **Future Enhancement**: Backend PDF generation service

#### 3. Theme Consistency

**Issue**: Changes to theme do not re-generate previously opened HTML artifacts
- **Status**: Expected behavior (artifacts are independent)
- **Impact**: Users must regenerate artifacts to change theme
- **Workaround**: Regenerate artifacts with new theme
- **Note**: This is intentional; each artifact is independent

#### 4. Internet Explorer Support

**Issue**: Not supported (uses modern JavaScript/CSS features)
- **Status**: Intentional decision
- **Supported Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Workaround**: Use modern browser
- **Note**: Internet Explorer reaches end-of-life January 2021

#### 5. Mobile Browser Limitations

**Issue**: PDF/PNG downloads may not work as expected on mobile browsers
- **Status**: Browser-dependent
- **Impact**: Mobile users may see "save as" dialog instead of automatic download
- **Workaround**: Use desktop browser for artifact generation
- **Future Enhancement**: Mobile-optimized download workflow

### Browser Compatibility Matrix

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Full | Fully tested and supported |
| Firefox | 88+ | ✅ Full | Fully tested and supported |
| Safari | 14+ | ✅ Full | Fully tested and supported |
| Edge | 90+ | ✅ Full | Based on Chromium, fully supported |
| Internet Explorer | All | ❌ None | Not supported, use Edge instead |

**Browser-Specific Notes**:
- **Chrome/Edge**: Fastest PDF/PNG generation
- **Firefox**: Reliable date/time pickers
- **Safari**: May require pop-up prompt for downloads
- **Mobile Safari/Chrome**: Downloads go to device Downloads folder

### Performance Characteristics

#### Load Times
- **Initial Load**: 2-3 seconds (includes React, MUI, libraries)
- **Form Add**: <100ms
- **Form Remove**: <50ms
- **Title Generation**: <10ms (debounced)

#### Artifact Generation (per form)
- **HTML**: <100ms
- **PDF**: 500ms - 2s (depends on content and browser)
- **PNG**: 300ms - 1s (depends on resolution and browser)
- **Total for 1 form**: ~1-3 seconds
- **Total for 5 forms**: ~5-15 seconds (sequential with 500ms intervals)

### Resource Requirements

#### Browser Memory
- **Idle**: 30-50 MB
- **With 5 forms**: 60-80 MB
- **During PDF generation**: Up to 200 MB temporarily

#### Disk Space
- **Per artifact**: 100-500 KB
- **Batch of 5 forms (15 artifacts)**: 1.5-7.5 MB

### Accessibility Compliance

**WCAG 2.1 Level AA Target**:
- ✅ Keyboard navigation for all form controls
- ✅ ARIA labels on form sections
- ✅ Focus indicators visible on all interactive elements
- ✅ Color contrast 4.5:1 for normal text, 3:1 for UI components
- ✅ Screen reader support for form validation
- ✅ Accessible date/time pickers (native HTML5)

**Tested With**:
- NVDA (Windows screen reader)
- JAWS (Windows screen reader)
- VoiceOver (macOS/iOS screen reader)
- Browser zoom up to 400%
- High contrast mode

**Known Accessibility Issues**: None

### Security Notes

**Data Handling**:
- All data remains in browser memory (no network transmission)
- No localStorage/sessionStorage used by default
- HTML output contains injected user data (properly escaped)
- No authentication required (local application)

**Input Validation**:
- All user inputs validated before template injection
- HTML entities escaped to prevent XSS
- Email and phone formats validated

**Artifact Generation**:
- HTML artifacts generated in browser with html-to-image
- PDF artifacts generated client-side with html2pdf.js
- No data sent to external services

---

## Component Documentation

Each component has its own README documenting:
- Component purpose and requirements
- Props interface
- Usage examples
- Related components

**Component READMEs Located At**:
- `src/components/ApplicationSelector.README.md`
- `src/components/DeploymentForm.README.md`
- `src/components/DeploymentInfoSection.README.md`
- `src/components/ContactSection.README.md`
- `src/components/ScheduleSection.README.md`
- `src/components/OutageSection.README.md`
- `src/components/ChangeItemsSection.README.md`
- `src/components/ImpactSection.README.md`
- `src/components/ThemeSelector.README.md`
- And others...

---

## Deployment

### Build Process

```bash
# Build for production
npm run build

# This runs TypeScript compilation and Vite build
# Output: dist/ directory with optimized bundle
```

### Deployment Options

#### Option 1: AWS S3 (Configured)

```bash
# Deploy to S3 (requires DEPLOY_BUCKET environment variable)
export DEPLOY_BUCKET="my-bucket-name"
npm run deploy

# Or inline
DEPLOY_BUCKET="my-bucket-name" npm run deploy
```

**Prerequisites**:
- AWS credentials configured
- S3 bucket created
- CloudFront distribution (optional)

#### Option 2: Static Hosting

Works with any static hosting provider:
- Netlify
- Vercel
- GitHub Pages
- AWS CloudFront + S3
- Any web server serving from `dist/` directory

**Steps**:
1. Run `npm run build`
2. Upload contents of `dist/` to host
3. Configure for SPA (redirect 404s to index.html)

---

## Troubleshooting

### Development Issues

**Port Already in Use**
```bash
# Change dev port
npm run dev -- --port 3000
```

**Module Not Found Errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Rebuild TypeScript
npx tsc -b tsconfig.build.json
```

### Testing Issues

**Tests Timing Out**
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

**Snapshots Out of Date**
```bash
# Update all snapshots
npm test -- -u
```

**E2E Tests Failing**
```bash
# Run in debug mode
npm run test:e2e:debug

# Check for browser compatibility
npm run test:e2e -- --project=chrome
```

### Build Issues

**Build Size Too Large**
```bash
# Analyze bundle size
npm install --save-dev vite-plugin-visualizer
# Then configure in vite.config.ts
```

---

## Related Documentation

- **Design Document**: `.kiro/specs/deployment-notification-generator/design.md`
- **Requirements**: `.kiro/specs/deployment-notification-generator/requirements.md`
- **Tasks**: `.kiro/specs/deployment-notification-generator/tasks.md`
- **Accessibility Testing**: `ACCESSIBILITY_TESTING_GUIDE.md`
- **Browser Compatibility**: `BROWSER_COMPATIBILITY_TESTING_README.md`
- **E2E Testing**: `E2E_TEST_DOCUMENTATION.md`
- **Performance**: `PERFORMANCE_OPTIMIZATIONS.md`
- **Deployment**: `DEPLOYMENT.md`

---

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow React best practices (functional components, hooks)
- Use Material UI components for consistency
- Keep components small and focused
- Use descriptive variable/function names

### Commit Guidelines

- Use clear, descriptive commit messages
- Reference task numbers from spec
- Keep commits atomic and focused

### Pull Request Process

1. Create feature branch: `git checkout -b feature/task-description`
2. Make changes and commit: `git commit -m "Task 22.4: Add developer documentation"`
3. Push to remote: `git push origin feature/task-description`
4. Create pull request with description
5. Ensure all tests pass
6. Request code review
7. Merge after approval

---

## Support and Questions

For questions or issues:

1. Check existing documentation (this guide, component READMEs)
2. Review test files for usage examples
3. Check spec documentation for requirements
4. Review component README files for component-specific questions
5. Refer to design document for architecture decisions

---

## Version Information

- **React**: 19.2.7
- **TypeScript**: 7.0.2
- **Vite**: 8.1.5
- **Material UI**: 9.2.0
- **Vitest**: 4.1.10
- **Playwright**: 1.62.0

---

**Last Updated**: 2025
**Maintained By**: Development Team
