# useResetConfirmation Hook

## Overview

The `useResetConfirmation` hook manages the confirmation dialog state for resetting deployment forms. It provides a clean API for showing a confirmation prompt before clearing form data, ensuring users don't accidentally lose their work.

## Requirements

This hook implements the following requirements:
- **1.9**: Display a confirmation prompt before clearing any entered values
- **1.10**: On confirm, call the onConfirm callback and restore default values
- **1.11**: On cancel, close dialog and preserve all values unchanged

## API

```typescript
function useResetConfirmation(
  formId: string,
  onConfirm: () => void
): {
  isOpen: boolean;
  initiateReset: () => void;
  confirmReset: () => void;
  cancelReset: () => void;
}
```

### Parameters

- **formId** (string): The unique identifier of the form to be reset. While not directly used in the hook logic, it's included in the signature for clarity and potential future use.
- **onConfirm** (function): Callback function that will be executed when the user confirms the reset. This function should contain the logic to restore the form to its default values.

### Return Value

An object containing:

- **isOpen** (boolean): Whether the confirmation dialog is currently open
- **initiateReset** (function): Call this to show the confirmation dialog
- **confirmReset** (function): Call this when user confirms (closes dialog and executes onConfirm)
- **cancelReset** (function): Call this when user cancels (closes dialog without executing onConfirm)

## Usage Example

### Basic Usage with Material UI Dialog

```typescript
import { useResetConfirmation } from './hooks';
import { Dialog, DialogTitle, DialogActions, Button } from '@mui/material';

function DeploymentForm({ formId, resetFormData }) {
  const { isOpen, initiateReset, confirmReset, cancelReset } = useResetConfirmation(
    formId,
    () => resetFormData(formId)
  );

  return (
    <>
      <Button onClick={initiateReset}>Reset Form</Button>

      <Dialog open={isOpen} onClose={cancelReset}>
        <DialogTitle>Reset Form?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            All entered values will be cleared and restored to default values.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReset}>Cancel</Button>
          <Button onClick={confirmReset}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
```

### Usage with Form Manager

```typescript
function FormManager() {
  const { forms, resetForm } = useFormManager();

  return (
    <>
      {forms.map(form => (
        <DeploymentForm 
          key={form.formId}
          formId={form.formId}
          onResetForm={resetForm}
        />
      ))}
    </>
  );
}
```

### Integration with useFormManager

The `useResetConfirmation` hook is designed to work seamlessly with the `useFormManager` hook:

```typescript
function DeploymentFormCard({ form }) {
  const { resetForm } = useFormManager();
  
  // Hook manages the confirmation dialog state
  const { isOpen, initiateReset, confirmReset, cancelReset } = useResetConfirmation(
    form.formId,
    () => resetForm(form.formId) // Call useFormManager's resetForm on confirm
  );

  return (
    <Card>
      <CardContent>
        {/* Form fields */}
      </CardContent>
      <CardActions>
        <Button onClick={initiateReset}>Reset</Button>
      </CardActions>
      
      {/* Confirmation Dialog */}
      <Dialog open={isOpen} onClose={cancelReset}>
        <DialogTitle>Reset Deployment Form?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset this deployment form? 
            All entered values will be cleared and restored to their default values.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReset}>Cancel</Button>
          <Button onClick={confirmReset} color="warning">Reset Form</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
```

## Implementation Details

### State Management

The hook uses a single boolean state (`isOpen`) to track whether the confirmation dialog should be visible.

### Callback Stability

All returned functions (`initiateReset`, `confirmReset`, `cancelReset`) are wrapped in `useCallback` to maintain stable references across re-renders. This is important for:
- Preventing unnecessary re-renders of child components
- Safe use as dependencies in other hooks
- Optimal performance in complex component trees

### Dialog Lifecycle

1. **Initial State**: Dialog closed (`isOpen: false`)
2. **User clicks reset button**: `initiateReset()` → Opens dialog (`isOpen: true`)
3. **User confirms**: `confirmReset()` → Executes `onConfirm()`, closes dialog (`isOpen: false`)
4. **User cancels**: `cancelReset()` → Closes dialog without executing `onConfirm()` (`isOpen: false`)

## Testing

The hook includes comprehensive tests covering:
- Initial state
- Opening the dialog (Requirement 1.9)
- Confirming reset and executing callback (Requirement 1.10)
- Canceling reset without executing callback (Requirement 1.11)
- Stable function references
- Multiple open/cancel cycles
- Multiple form instances

Run tests with:
```bash
npm test -- src/hooks/useResetConfirmation.test.ts
```

## Design Decisions

1. **Separate Concerns**: The hook manages only the dialog state, not the actual reset logic. This keeps it reusable and testable.

2. **Explicit formId Parameter**: While not used internally, including formId in the signature makes the API clearer and allows for potential future enhancements (like tracking which form is being reset).

3. **Simple State**: Uses a single boolean rather than a more complex state object, keeping the implementation simple and predictable.

4. **No Dialog Component**: The hook doesn't include a dialog component, allowing consumers to use their preferred UI library and customize the dialog appearance.

## Future Enhancements

Potential improvements for future iterations:
- Add support for custom confirmation messages
- Add support for async reset operations
- Add undo/redo support
- Track reset history for analytics

