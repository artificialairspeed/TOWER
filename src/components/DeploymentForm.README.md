# DeploymentForm Component

## Overview

The `DeploymentForm` component represents a single deployment form instance that composes all form sections into a cohesive user interface. It includes form-level actions for resetting and removing forms.

## Requirements

Implements requirements: 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11

## Features

- **Comprehensive Sections**: Integrates all deployment data entry sections
- **Reset with Confirmation**: Prompts user before clearing form data (Requirements 1.9, 1.10, 1.11)
- **Conditional Remove**: Remove button respects minimum form constraint (Requirements 1.6, 1.8)
- **Always Expanded**: No collapse functionality, always fully visible (Requirement 1.5)

## Props

```typescript
interface DeploymentFormProps {
  /** The deployment form data */
  formData: DeploymentFormData;
  /** Form number for display (1-indexed) */
  formNumber: number;
  /** Callback when form data is updated */
  onUpdate: (updates: Partial<DeploymentFormData>) => void;
  /** Callback when form reset is confirmed */
  onReset: () => void;
  /** Callback when form is removed */
  onRemove: () => void;
  /** Whether the remove button should be enabled */
  canRemove: boolean;
}
```

## Composed Sections

The DeploymentForm includes the following sections in order:

1. **ApplicationSelector**: Select application from catalog
2. **DeploymentInfoSection**: Change number, release version, environment
3. **DeploymentTitleDisplay**: Read-only computed title
4. **ScheduleSection**: Deployment date and time window
5. **OutageSection**: Outage indicator and date/time ranges
6. **ChangeItemsSection**: List of Jira change items (1-999)
7. **ImpactSection**: List of impact items (1-100)
8. **ContactSection**: Contact name, email, phone

## Usage

```tsx
import { DeploymentForm } from './components/DeploymentForm';
import { createDefaultForm } from './data/formFactory';

function Example() {
  const [formData, setFormData] = useState(createDefaultForm());

  const handleUpdate = (updates: Partial<DeploymentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setFormData(createDefaultForm());
  };

  const handleRemove = () => {
    // Remove form logic
  };

  return (
    <DeploymentForm
      formData={formData}
      formNumber={1}
      onUpdate={handleUpdate}
      onReset={handleReset}
      onRemove={handleRemove}
      canRemove={false} // Disabled for single form
    />
  );
}
```

## Form Actions

### Reset Button

- **Always Enabled**: Reset is always available
- **Confirmation Dialog**: Shows confirmation before clearing data
- **On Confirm**: Clears all values and restores defaults (Requirement 1.10)
- **On Cancel**: Preserves all entered values (Requirement 1.11)

### Remove Button

- **Conditionally Enabled**: Based on `canRemove` prop
- **Disabled State**: Shows "Cannot remove the only form" label
- **Enabled State**: Shows "Remove this form" label
- **Action**: Calls `onRemove` callback

## Visual Structure

```
┌─────────────────────────────────────────────────┐
│ Deployment Form 1         [Reset] [Remove]      │
├─────────────────────────────────────────────────┤
│                                                   │
│ Application Selector                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Select Application]                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│ Deployment Information                           │
│ ┌─────────────────────────────────────────────┐ │
│ │ Change Number, Release Version, Environment │ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│ Deployment Title (read-only)                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ [CHG#####] — [App: Version - Deploy to ENV]│ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│ [Schedule, Outage, Change Items,                 │
│  Impact Items, Contact sections...]              │
└─────────────────────────────────────────────────┘
```

## Reset Confirmation Dialog

```
┌─────────────────────────────────────────┐
│ Reset Deployment Form 1?                │
├─────────────────────────────────────────┤
│ This will clear all entered values and  │
│ restore the form to its default state.  │
│ This action cannot be undone. Are you   │
│ sure you want to continue?              │
│                                          │
│         [Cancel]  [Reset Form]          │
└─────────────────────────────────────────┘
```

## State Management

- **No Internal State**: All data is managed externally via props
- **Callback Pattern**: Uses `onUpdate`, `onReset`, `onRemove` callbacks
- **Partial Updates**: `onUpdate` accepts partial updates to merge with existing data

## Accessibility

- Form actions have descriptive aria-labels
- Reset confirmation dialog has proper ARIA attributes
- Form number is clearly indicated in heading
- All sections follow accessibility guidelines

## Related Components

- **FormManager**: Manages multiple DeploymentForm instances
- **useResetConfirmation**: Hook for reset confirmation dialog
- All section components (ApplicationSelector, DeploymentInfoSection, etc.)
