# TemplateProvider

The `TemplateProvider` class is responsible for loading and caching HTML templates for the Deployment Notification Generator.

## Features

- **Lazy Loading**: Templates are loaded asynchronously on demand
- **Caching**: Once loaded, templates are cached in memory for fast retrieval
- **Theme Support**: Supports both light and dark mode templates
- **Singleton Pattern**: A single instance manages all templates

## Usage

### Basic Usage

```typescript
import { templateProvider } from './utils/templateProvider';

// Initialize templates (should be done early in app lifecycle)
await templateProvider.initialize();

// Get a template
const lightTemplate = templateProvider.getTemplate('light');
const darkTemplate = templateProvider.getTemplate('dark');
```

### In React Components

```typescript
import { useEffect, useState } from 'react';
import { templateProvider } from './utils/templateProvider';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    templateProvider.initialize().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return <div>Loading templates...</div>;
  }

  return <div>App content...</div>;
}
```

### For Testing

```typescript
import { TemplateProvider } from './utils/templateProvider';

describe('My test', () => {
  let provider: TemplateProvider;

  beforeEach(() => {
    provider = new TemplateProvider();
    // Set mock templates for testing
    provider.setTemplate('light', '<html><body>Test</body></html>');
  });

  it('should work with mock templates', () => {
    const template = provider.getTemplate('light');
    expect(template).toContain('Test');
  });
});
```

## API Reference

### Methods

#### `initialize(): Promise<void>`
Initialize the template provider by loading templates from the server. This method:
- Loads both light-mode.html and dark-mode.html templates
- Caches them in memory
- Returns a promise that resolves when loading is complete
- Can be called multiple times safely (subsequent calls are no-ops)

#### `getTemplate(theme: Theme): string`
Get the HTML template for the specified theme.
- **Parameters**: 
  - `theme`: Either 'light' or 'dark'
- **Returns**: The HTML template as a string
- **Throws**: Error if templates haven't been initialized or theme not found

#### `isLoaded(): boolean`
Check if templates have been loaded.
- **Returns**: `true` if templates are loaded, `false` otherwise

#### `setTemplate(theme: Theme, template: string): void`
Manually set a template (useful for testing or dynamic template loading).
- **Parameters**:
  - `theme`: Either 'light' or 'dark'
  - `template`: The HTML template string

#### `clear(): void`
Clear all cached templates. Useful for testing or forcing a reload.

## Template Tokens

The HTML templates support the following tokens that should be replaced with actual data:

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

## Template Location

Templates are stored in the `public/templates/` directory:
- `public/templates/light-mode.html` - Light mode template
- `public/templates/dark-mode.html` - Dark mode template

## Requirements

This implementation fulfills:
- **Requirement 9.5**: Template selection based on theme
- **Requirement 9.6**: Consistent visual appearance per theme
- **Task 7.1**: Load and parse HTML templates, cache loaded templates
