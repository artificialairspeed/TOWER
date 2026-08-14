# FormManager Component

## Overview

The `FormManager` component manages the lifecycle of multiple deployment form instances. It provides controls to add, remove, and reset forms while preserving data integrity across all operations.

## Requirements

Implements requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8

## Features

- **Initial State**: Displays exactly one deployment form on load (Requirement 1.1)
- **Add Forms**: Add up to 5 deployment forms (Requirements 1.2, 1.3, 1.4)
- **Remove Forms**: Remove forms with a minimum of 1 form required (Requirements 1.6, 1.7, 1.8)
- **Expanded Display**: All forms are always shown in expanded state (Requirement 1.5)
- **Data Preservation**: All form values are preserved during add/remove operations

## Props

```typescript
interface FormManagerProps {
  /** Maximum number of forms allowed (default: 5) */
  maxForms?: number;
}
```

## Usage

### Basic Usage

```tsx
import { FormManager } from './components/FormManager';

function App() {
  return (
    <div>
      <h1>Deployment Notification Generator</h1>
      <FormManager />
    </div>
  );
}
```

### Custom Maximum

```tsx
<FormManager maxForms={3} />
```

## Behavior

### Adding Forms

- **Enabled**: When fewer than 5 (or maxForms) forms exist
- **Disabled**: When at maximum capacity
- **Action**: Creates a new form with default values alongside existing forms
- **Data Preservation**: All existing form values remain unchanged

### Removing Forms

- **Enabled**: When more than 1 form exists
- **Disabled**: When only 1 form exists (minimum requirement)
- **Action**: Deletes the specified form and all its data
- **Data Preservation**: All other form values remain unchanged

### Resetting Forms

Each deployment form includes a Reset button that:
1. Shows a confirmation dialog before clearing values
2. On confirm: Clears all entered values and restores defaults
3. On cancel: Preserves all entered values unchanged

## Visual Layout

```
┌─────────────────────────────────────────────┐
│ Deployment Forms (2/5)    [Add Form] Button │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Deployment Form 1   [Reset] [Remove]    │ │
│ │ [All form sections...]                  │ │
│ └─────────────────────────────────────────┘ │
│                                               │
│ ┌─────────────────────────────────────────┐ │
│ │ Deployment Form 2   [Reset] [Remove]    │ │
│ │ [All form sections...]                  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## State Management

The FormManager uses the `useFormManager` hook internally to manage:
- Array of deployment form instances
- Add/remove/update/reset operations
- Capacity constraints (min 1, max 5)

## Related Components

- **DeploymentForm**: Individual form instance managed by FormManager
- **useFormManager**: Hook providing form lifecycle management
- **useResetConfirmation**: Hook providing reset confirmation dialog

## Accessibility

- Add Form button has descriptive aria-label indicating state
- Remove buttons have appropriate aria-labels based on state
- Form count is displayed visually for user awareness
- Helper text shown when at maximum capacity
