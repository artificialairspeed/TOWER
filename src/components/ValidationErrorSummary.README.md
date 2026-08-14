# ValidationErrorSummary Component

## Overview

The `ValidationErrorSummary` component displays a summary of validation errors for a deployment form. It shows all validation errors in a prominent alert box at the top of the form when validation fails.

## Features

- **Error Summary Display**: Shows all validation errors in a formatted list
- **Form Identification**: Clearly identifies which form has errors with form number
- **Error Count**: Displays the total number of errors (singular/plural)
- **Field Labels**: Maps field names to user-friendly labels
- **Conditional Rendering**: Only displays when there are errors

## Usage

```tsx
import { ValidationErrorSummary } from './components/ValidationErrorSummary';
import type { ValidationError } from './types/models';

// Get validation errors for a specific form
const formErrors: ValidationError[] = [
  { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
  { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' }
];

// Display error summary
<ValidationErrorSummary errors={formErrors} formNumber={1} />
```

## Props

### `errors` (required)
- **Type**: `ValidationError[]`
- **Description**: Array of validation errors for this form

### `formNumber` (required)
- **Type**: `number`
- **Description**: Form number for display (1-indexed)

## Requirements

- **Display per-form summary errors**: Shows all errors for a form in one place
- **Preserve all entered data**: Error display does not affect form data
- **Clear user feedback**: Errors are prominently displayed with clear messages

## Styling

- Uses MUI `Alert` component with `error` severity
- Red color scheme for error indication
- Bulleted list format for multiple errors
- Bold field labels for clarity

## Field Label Mapping

The component maps technical field names to user-friendly labels:

- `changeNumber` → "Change Number"
- `contactEmail` → "Email"
- `contactPhone` → "Phone"
- `deploymentDate` → "Deployment Date"
- `startTime` → "Start Time"
- `endTime` → "End Time"
- And more...

Array fields (like `changeItems[0].jiraNumber`) are displayed as-is since they already include formatting in the validation message.

## Example Output

```
❌ Validation Errors in Deployment Form 1

Please correct the following 3 errors before generating outputs:
• Change Number: Change Number is required
• Email: Please enter a valid email address (example@domain.com)
• Environment: Please select an environment
```

## Accessibility

- Uses semantic HTML with proper heading structure
- Error icon for visual indication
- Clear, descriptive error messages
- Screen reader compatible

## Related Components

- `DeploymentForm` - Parent component that uses ValidationErrorSummary
- `useValidationErrors` - Hook for managing validation errors
- `validateForm` - Function that generates ValidationError objects

## Testing

See `ValidationErrorSummary.test.tsx` for comprehensive component tests including:
- Conditional rendering (no errors = no display)
- Error count display (singular/plural)
- All error messages displayed
- Field label mapping
- Alert styling verification
