# ApplicationSelector Component

A dropdown component for selecting an application from the APPLICATION_CATALOG.

## Requirements Coverage

This component implements the following requirements from the specification:

- **2.1**: Present all applications from APPLICATION_CATALOG as selectable options
- **2.2**: Display placeholder prompt when no application selected
- **2.7**: Display banner "No applications available" when catalog empty
- **2.8**: Disable dropdown when catalog empty

## Props

```typescript
interface ApplicationSelectorProps {
  /** Currently selected application (null if none selected) */
  value: Application | null;
  
  /** Callback when application selection changes */
  onChange: (application: Application | null) => void;
  
  /** Whether the selector is disabled */
  disabled?: boolean;
  
  /** Error message to display (if any) */
  error?: string;
  
  /** Application catalog to use (defaults to APPLICATION_CATALOG) */
  catalog?: Application[];
}
```

## Usage

### Basic Usage

```tsx
import { useState } from 'react';
import { ApplicationSelector } from './components';
import { Application } from './types/models';

function MyForm() {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  return (
    <ApplicationSelector
      value={selectedApp}
      onChange={setSelectedApp}
    />
  );
}
```

### With Validation Error

```tsx
import { ApplicationSelector } from './components';

function MyForm() {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [error, setError] = useState<string>('');

  const handleValidation = () => {
    if (!selectedApp) {
      setError('Application selection is required');
    }
  };

  return (
    <ApplicationSelector
      value={selectedApp}
      onChange={(app) => {
        setSelectedApp(app);
        if (app) setError('');
      }}
      error={error}
    />
  );
}
```

### Disabled State

```tsx
<ApplicationSelector
  value={null}
  onChange={() => {}}
  disabled={true}
/>
```

### Custom Catalog

```tsx
const customCatalog: Application[] = [
  {
    id: 'custom-app',
    name: 'Custom Application',
    notificationHeader: 'Custom Application Deployment Notification'
  }
];

<ApplicationSelector
  value={null}
  onChange={setSelectedApp}
  catalog={customCatalog}
/>
```

## Behavior

### Empty Catalog
When the `catalog` prop is an empty array:
- Displays an error banner: "No applications available"
- Disables the dropdown
- Prevents user interaction

### No Selection
When `value` is `null`:
- Shows the label "Application *" as a placeholder
- Dropdown appears empty until opened

### Selection Change
When user selects an application:
- Calls `onChange` with the selected `Application` object
- Displays the application name in the dropdown

## Accessibility

- Uses Material UI's FormControl and Select components for built-in accessibility
- Provides `aria-labelledby` for screen readers
- Shows error state with appropriate ARIA attributes
- Disabled state is properly communicated via `aria-disabled`

## Testing

All requirements are covered by comprehensive tests in `ApplicationSelector.test.tsx`:
- Displays all applications from catalog
- Shows placeholder when no selection
- Displays banner when catalog is empty
- Disables dropdown when catalog is empty
- Handles selection changes correctly
- Displays validation errors

Run tests:
```bash
npm test -- ApplicationSelector.test.tsx
```

## Integration with Form

This component is designed to be used within the `DeploymentForm` component as part of the complete deployment notification form workflow. It updates the `application` field of `DeploymentFormData`.

See `ApplicationSelector.example.tsx` for a complete working example.
