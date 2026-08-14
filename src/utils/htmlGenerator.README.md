# HTML Artifact Generator

## Overview

The HTML artifact generator is responsible for creating HTML notification artifacts from deployment form data. It implements task 15.1 of the deployment notification generator specification.

## Requirements

This module satisfies the following requirements:

- **Requirement 10.4**: Generate HTML artifact containing all metadata from the deployment form
- **Requirement 10.5**: Open HTML artifact in a new browser tab (HTML generation component)
- **Requirement 9.5**: Render artifact using the HTML template corresponding to the active theme
- **Requirement 9.6**: Visual appearance matches the HTML template for the active theme

## Usage

```typescript
import { generateHTML } from './utils/htmlGenerator';
import type { DeploymentFormData, Theme } from './types/models';

// Prepare deployment form data
const formData: DeploymentFormData = {
  formId: '1',
  application: {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  },
  changeNumber: 'CHG12345',
  releaseVersion: 'v5.4.1',
  environment: 'PROD',
  deploymentDate: new Date('2025-03-05'),
  startTime: new Date('2025-03-05T20:00:00'),
  endTime: new Date('2025-03-05T22:00:00'),
  hasOutage: false,
  changeItems: [
    { id: '1', jiraNumber: 'JIRA-123', description: 'Updated authentication' }
  ],
  impactItems: [
    { id: '1', text: 'Improved login performance' }
  ],
  contactName: 'John Doe',
  contactEmail: 'john.doe@example.com',
  contactPhone: '(555) 123-4567',
  // ... other fields
};

// Generate HTML with selected theme
const html = generateHTML(formData, 'Dark Mode');

// The html variable now contains a complete HTML document string
// that can be opened in a new tab or saved to a file
```

## API

### `generateHTML(data: DeploymentFormData, theme: Theme): string`

Generates an HTML artifact from deployment form data.

**Parameters:**
- `data` - Complete deployment form data including all required fields
- `theme` - Selected visual theme ('Light Mode' or 'Dark Mode')

**Returns:**
- Complete HTML string with all tokens replaced with deployment data

**Throws:**
- `Error` if templates haven't been initialized via `templateProvider.initialize()`
- `Error` if the requested theme template is not found

## Implementation Details

### Theme Mapping

The function maps UI theme names to template provider theme identifiers:
- `'Light Mode'` → `'light'`
- `'Dark Mode'` → `'dark'`

### Template Loading

Templates are loaded via the `TemplateProvider` singleton, which must be initialized before calling `generateHTML()`:

```typescript
import { templateProvider } from './utils/templateProvider';

// Initialize templates (typically done at application startup)
await templateProvider.initialize();

// Now safe to generate HTML
const html = generateHTML(formData, theme);
```

### Token Injection

The generator uses the `injectTemplate()` function from `formatters.ts` to replace all template tokens with deployment data:

- `{{NOTIFICATION_HEADER}}` - Application-specific notification header
- `{{DEPLOYMENT_TITLE}}` - Computed deployment title
- `{{DEPLOYMENT_SUBTITLE}}` - Change number (CHG#####)
- `{{SCHEDULE}}` - Formatted deployment schedule
- `{{OUTAGE_BLOCK}}` - Outage information (if applicable)
- `{{JIRA_ITEMS}}` - HTML list of change items
- `{{IMPACT_ITEMS}}` - HTML list of impact items
- `{{CONTACT}}` - Contact information block

### Security

All user-provided text data is HTML-escaped before injection to prevent XSS attacks. The `injectTemplate()` function handles this automatically using the `escapeHtml()` utility.

## Testing

The module includes comprehensive test coverage:

### Unit Tests (`htmlGenerator.test.ts`)
- Theme selection (Light Mode vs Dark Mode)
- Data injection for all fields
- Multiple change items and impact items
- HTML escaping for security
- Error handling for uninitialized templates
- Data integrity preservation

### Integration Tests (`htmlGenerator.integration.test.ts`)
- Complete HTML artifact generation with realistic data
- Template structure validation
- Cross-application testing
- Outage information handling
- HTML validity checks

Run tests with:
```bash
npm test -- htmlGenerator --run
```

## Dependencies

- `templateProvider` - Loads and caches HTML templates
- `injectTemplate` - Replaces template tokens with deployment data
- `DeploymentFormData` - Type definition for form data
- `Theme` - Type definition for theme selection

## Related Files

- `src/utils/templateProvider.ts` - Template loading and caching
- `src/utils/formatters.ts` - Token injection and data formatting
- `src/types/models.ts` - Type definitions
- `public/templates/light-mode.html` - Light mode HTML template
- `public/templates/dark-mode.html` - Dark mode HTML template
