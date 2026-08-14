# DeploymentTitleDisplay Component

## Overview

The `DeploymentTitleDisplay` component is a read-only text field that displays the computed deployment title. It automatically updates when any of the title's constituent fields change, using a 500ms debounce to avoid excessive re-computation during rapid user input.

## Requirements

This component satisfies requirements 3.6, 3.7, and 3.8:

- **3.6**: Computes the deployment title in the format `[CHG#####] — [Application Name: Release Version - Deploy to ENVIRONMENT]`
- **3.7**: Updates the title within 500ms of any change to Change Number, Release Version, Environment, or Application
- **3.8**: Displays the title as a read-only value that cannot be edited directly

## Usage

```tsx
import { DeploymentTitleDisplay } from './components';
import { DeploymentFormData } from './types/models';

function MyForm() {
  const [formData, setFormData] = useState<DeploymentFormData>({
    // ... form data
  });

  return (
    <div>
      {/* Other form fields */}
      <DeploymentTitleDisplay data={formData} />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `DeploymentFormData` | Yes | The deployment form data containing all fields needed for title generation |

## Behavior

### Title Generation

The component uses the `generateDeploymentTitle` utility function to compute the title from:
- Application name
- Change number
- Release version
- Environment

If any of these fields are missing or empty, the component displays an empty string.

### Debouncing

The component debounces title updates by 500ms. This means:
- When a dependent field changes, the component waits 500ms before recomputing the title
- If another change occurs within that 500ms, the timer resets
- This prevents excessive computation during rapid user input (e.g., typing)

### Read-Only

The field is displayed as read-only and cannot be edited by the user. It provides a helper text explaining that it is automatically generated.

## Testing

The component includes comprehensive unit tests covering:
- Initial empty state (before debounce)
- Title computation after debounce
- Empty display when required fields are missing
- Title updates when each dependent field changes
- Debounce behavior with rapid changes
- Read-only attribute
- Helper text presence

Run tests with:
```bash
npm test -- DeploymentTitleDisplay.test.tsx
```

## Implementation Details

### Technology
- React 18 with hooks (`useEffect`, `useState`)
- Material UI `TextField` component
- TypeScript for type safety

### Debounce Implementation
Uses `setTimeout` within a `useEffect` hook with proper cleanup to cancel pending timeouts when dependencies change.

### Dependencies
The component re-computes the title when any of these change:
- `data.application`
- `data.changeNumber`
- `data.releaseVersion`
- `data.environment`

Other fields in the form data do not trigger title updates.
