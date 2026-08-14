# useValidationErrors Hook

## Overview

The `useValidationErrors` hook manages validation errors for deployment forms. It provides a centralized way to store, retrieve, and clear validation errors across all forms in the application.

## Features

- **Centralized Error Management**: Store errors for multiple forms
- **Per-Field Error Tracking**: Get/set errors at the field level
- **Auto-Clear on Edit**: Clear field errors when users correct inputs
- **Form-Level Queries**: Check if a form has errors, get all errors for a form
- **Batch Error Setting**: Set all errors from validation results at once

## Usage

```tsx
import { useValidationErrors } from './hooks/useValidationErrors';
import { validateBatch } from './utils/validators';

function App() {
  const {
    setErrors,
    getFieldError,
    clearFieldError,
    hasFormErrors,
    getFormErrors,
    getAllErrors,
    clearAllErrors
  } = useValidationErrors();

  const handleGenerateOutputs = () => {
    // Run validation
    const result = validateBatch(forms, theme, catalogEmpty);
    
    if (!result.isValid) {
      // Set all errors
      setErrors(result.errors);
      return;
    }
    
    // Generate outputs...
  };

  // In form component
  const emailError = getFieldError(formId, 'contactEmail');
  
  // Clear error when user edits field
  const handleEmailChange = (value: string) => {
    updateForm({ contactEmail: value });
    clearFieldError(formId, 'contactEmail');
  };

  return (
    <FormManager
      validationErrors={getAllErrors()}
      onClearFieldError={clearFieldError}
    />
  );
}
```

## API Reference

### `setErrors(errors: ValidationError[])`

Sets all validation errors from a batch validation result.

**Parameters:**
- `errors`: Array of `ValidationError` objects

**Example:**
```tsx
const result = validateBatch(forms, theme, catalogEmpty);
if (!result.isValid) {
  setErrors(result.errors);
}
```

### `getFieldError(formId: string, field: string): string | undefined`

Gets the error message for a specific field.

**Parameters:**
- `formId`: The form identifier
- `field`: The field name

**Returns:** Error message or `undefined` if no error

**Example:**
```tsx
const emailError = getFieldError('form1', 'contactEmail');
// Returns: "Invalid email format" or undefined
```

### `clearFieldError(formId: string, field: string)`

Clears the error for a specific field. Automatically removes the form from the error map if it has no remaining errors.

**Parameters:**
- `formId`: The form identifier
- `field`: The field name

**Example:**
```tsx
// Clear error when user edits field
const handleEmailChange = (value: string) => {
  onUpdate({ contactEmail: value });
  clearFieldError(formId, 'contactEmail');
};
```

### `hasFormErrors(formId: string): boolean`

Checks if a form has any validation errors.

**Parameters:**
- `formId`: The form identifier

**Returns:** `true` if form has errors, `false` otherwise

**Example:**
```tsx
const hasErrors = hasFormErrors('form1');
// Use for conditional styling
<Paper sx={{ ...(hasErrors && { border: 2, borderColor: 'error.main' }) }}>
```

### `getFormErrors(formId: string): ValidationError[]`

Gets all errors for a specific form.

**Parameters:**
- `formId`: The form identifier

**Returns:** Array of `ValidationError` objects for this form

**Example:**
```tsx
const formErrors = getFormErrors('form1');
// Pass to ValidationErrorSummary component
<ValidationErrorSummary errors={formErrors} formNumber={1} />
```

### `getAllErrors(): ValidationError[]`

Gets all validation errors across all forms.

**Returns:** Array of all `ValidationError` objects

**Example:**
```tsx
const allErrors = getAllErrors();
// Pass to FormManager
<FormManager validationErrors={allErrors} />
```

### `clearFormErrors(formId: string)`

Clears all errors for a specific form.

**Parameters:**
- `formId`: The form identifier

**Example:**
```tsx
// Clear errors when form is removed
const handleRemoveForm = (formId: string) => {
  clearFormErrors(formId);
  removeForm(formId);
};
```

### `clearAllErrors()`

Clears all validation errors.

**Example:**
```tsx
// Clear errors after successful generation
const handleGenerate = async () => {
  clearAllErrors();
  await generateOutputs();
};
```

## Data Structure

The hook uses an internal error map structure:

```typescript
interface ValidationErrorMap {
  [formId: string]: {
    [field: string]: string;
  };
}

// Example:
{
  'form1': {
    'changeNumber': 'Change Number is required',
    'contactEmail': 'Invalid email format'
  },
  'form2': {
    'environment': 'Please select an environment'
  }
}
```

## Requirements

- **2.3, 3.5, 4.7, 5.6, 6.3, 6.6, 7.3, 7.4, 8.4, 8.5**: Field-level validation errors
- **10.2, 10.3**: Batch validation error handling
- **Preserve entered data**: Errors don't affect form data
- **Clear on edit**: Errors cleared when user corrects inputs

## Integration Points

### With DeploymentForm
```tsx
<DeploymentForm
  validationErrors={getFormErrors(formData.formId)}
  onClearFieldError={(field) => clearFieldError(formData.formId, field)}
/>
```

### With FormManager
```tsx
<FormManager
  validationErrors={getAllErrors()}
  onClearFieldError={clearFieldError}
/>
```

### With Validation
```tsx
const result = validateBatch(forms, theme, catalogEmpty);
if (!result.isValid) {
  setErrors(result.errors);
}
```

## Testing

See `useValidationErrors.test.ts` for comprehensive tests including:
- Initialize with no errors
- Set and retrieve errors
- Check if form has errors
- Get all errors for a form
- Clear field error when user corrects input
- Remove form from map when last error cleared
- Clear all errors for a form
- Clear all validation errors
- Handle clearing non-existent errors gracefully

## Performance Considerations

- Uses `useCallback` for all functions to prevent unnecessary re-renders
- Efficiently manages error map to minimize memory usage
- Automatically cleans up forms with no errors from the map

## Related Components

- `ValidationErrorSummary` - Displays form-level error summary
- `DeploymentForm` - Passes errors to field components
- `FormManager` - Distributes errors to forms
- `validateForm`, `validateBatch` - Generate ValidationError objects
