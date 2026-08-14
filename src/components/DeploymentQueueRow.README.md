# DeploymentQueueRow Component

## Overview

The `DeploymentQueueRow` component displays a deployment form as a collapsible row in a queue interface. It provides a summary view when collapsed and the full deployment form when expanded.

## Features

- **Queue Position Indicator**: Shows the deployment's position in the queue with a numbered badge
- **Summary Information**: Displays key information in collapsed state:
  - Application name
  - Target environment (with color coding for PROD)
  - Deployment date
  - Error count (if validation errors exist)
- **Expandable/Collapsible**: Click anywhere on the row to expand/collapse
- **Visual Indicators**:
  - Error state: Red border on badge and error count display
  - Active state: Blue border when expanded
  - Hover state: Background highlight on hover
- **Quick Actions**: Remove button accessible without expanding
- **Full Form Access**: Expands to show complete DeploymentForm component

## Props

```typescript
interface DeploymentQueueRowProps {
  formData: DeploymentFormData;      // The deployment form data
  position: number;                   // Position in queue (1-indexed)
  onUpdate: (updates: Partial<DeploymentFormData>) => void;
  onReset: () => void;               // Callback when form reset confirmed
  onRemove: () => void;              // Callback when form is removed
  canRemove: boolean;                // Whether remove button is enabled
  validationErrors?: ValidationError[];
  onClearFieldError?: (field: string) => void;
}
```

## Usage

```tsx
import { DeploymentQueueRow } from './components/DeploymentQueueRow';

<DeploymentQueueRow
  formData={formData}
  position={1}
  onUpdate={(updates) => updateForm(formData.formId, updates)}
  onReset={() => resetForm(formData.formId)}
  onRemove={() => removeForm(formData.formId)}
  canRemove={canRemoveForm}
  validationErrors={validationErrors}
  onClearFieldError={(field) => clearError(formData.formId, field)}
/>
```

## Behavior

### Collapsed State
- Shows queue position number in a circular badge
- Displays application name (or "Not Selected")
- Shows environment chip (PROD in red, others in default color)
- Displays formatted deployment date
- Shows error count if validation errors exist
- Remove button visible and functional
- Click anywhere on row to expand

### Expanded State
- Blue left border indicates active/expanded state
- Full DeploymentForm component visible
- All form fields editable
- Validation errors highlighted
- Click row again to collapse

### Error State
- Red circular badge (instead of blue)
- Red left border when collapsed
- Error count displayed below application name
- Validation errors passed to nested DeploymentForm

### Remove Button
- Stops click propagation (doesn't trigger expand/collapse)
- Disabled when canRemove is false (only 1 form in queue)
- Shows appropriate aria-label based on state

## Accessibility

- **ARIA Labels**: Clear descriptions for all interactive elements
- **Keyboard Navigation**: Full keyboard support for expand/collapse and actions
- **Screen Reader Support**: Proper role and state announcements
- **Focus Management**: Focus preserved through expand/collapse transitions

## Styling

Uses Material-UI theming:
- Responsive grid layout for summary information
- Smooth transitions for expand/collapse animations
- Elevation changes based on state
- Color-coded environment chips
- Hover effects for better interactivity

## Integration with FormManager

The `FormManager` component uses `DeploymentQueueRow` to display all forms in a queue:

```tsx
<Stack spacing={2}>
  {forms.map((formData, index) => (
    <DeploymentQueueRow
      key={formData.formId}
      formData={formData}
      position={index + 1}
      // ... other props
    />
  ))}
</Stack>
```

## Testing

The component includes comprehensive unit tests:
- Render in collapsed state
- Expand/collapse behavior
- Display of application information
- Error state indicators
- Remove button functionality
- Date formatting
- Accessibility attributes
