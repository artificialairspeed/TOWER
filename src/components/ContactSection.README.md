# ContactSection Component

## Overview

The `ContactSection` component provides input controls for capturing deployment coordinator contact information. It is part of the Deployment Notification Generator Portal and implements all requirements for contact information entry (Requirements 8.1-8.5).

## Features

- **Contact Name Input**: Text field for contact person's name (max 255 characters, required)
- **Email Input**: Email field with format validation (max 255 characters, required)
- **Phone Input**: Phone number field with specific format validation (max 255 characters, required)
- **Inline Validation**: Displays format and required field errors adjacent to each field
- **Value Preservation**: Retains entered values when validation fails
- **Accessibility**: Proper ARIA labels and error associations

## Requirements Coverage

- **8.1**: Provides required input fields for Contact Name, Email, and Phone (max 255 characters each)
- **8.2**: Validates email format using standard email pattern
- **8.3**: Validates phone format as `(###) ###-####`
- **8.4**: Displays required field and format errors adjacent to fields
- **8.5**: Preserves entered values when validation fails

## Usage

```tsx
import { ContactSection } from './ContactSection';

function MyForm() {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState({});

  return (
    <ContactSection
      contactName={contactName}
      contactEmail={contactEmail}
      contactPhone={contactPhone}
      onContactNameChange={setContactName}
      onContactEmailChange={setContactEmail}
      onContactPhoneChange={setContactPhone}
      contactNameError={errors.contactName}
      contactEmailError={errors.contactEmail}
      contactPhoneError={errors.contactPhone}
    />
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `contactName` | `string` | Current contact name value |
| `contactEmail` | `string` | Current contact email value |
| `contactPhone` | `string` | Current contact phone value |
| `onContactNameChange` | `(value: string) => void` | Callback when contact name changes |
| `onContactEmailChange` | `(value: string) => void` | Callback when contact email changes |
| `onContactPhoneChange` | `(value: string) => void` | Callback when contact phone changes |

### Optional Props

| Prop | Type | Description |
|------|------|-------------|
| `contactNameError` | `string` | Validation error message for contact name field |
| `contactEmailError` | `string` | Validation error message for email field |
| `contactPhoneError` | `string` | Validation error message for phone field |

## Validation

The component expects validation to be handled externally. Common validation errors include:

### Contact Name
- `"Contact Name is required"` - When field is empty
- `"Contact Name must not exceed 255 characters"` - When over length limit

### Email
- `"Email is required"` - When field is empty
- `"Please enter a valid email address (example@domain.com)"` - When format is invalid
- `"Email must not exceed 255 characters"` - When over length limit

### Phone
- `"Phone is required"` - When field is empty
- `"Please enter phone number as (###) ###-####"` - When format is invalid
- `"Phone must not exceed 255 characters"` - When over length limit

Use the `validateForm` function from `src/utils/validators.ts` to perform validation:

```tsx
import { validateForm } from '../utils/validators';

const validationResult = validateForm(formData);
if (!validationResult.isValid) {
  // Extract contact errors
  const contactErrors = {
    contactName: validationResult.errors.find(e => e.field === 'contactName')?.message,
    contactEmail: validationResult.errors.find(e => e.field === 'contactEmail')?.message,
    contactPhone: validationResult.errors.find(e => e.field === 'contactPhone')?.message
  };
}
```

## Field Constraints

- **Contact Name**: 1-255 characters, required
- **Email**: 1-255 characters, required, must match email format `[^\s@]+@[^\s@]+\.[^\s@]+`
- **Phone**: 1-255 characters, required, must match format `(###) ###-####` (e.g., `(555) 123-4567`)

## Accessibility

- All fields have proper ARIA labels
- Error messages are associated with fields via `aria-describedby`
- Required fields are marked with `aria-required="true"`
- Error states are indicated with `aria-invalid="true"`
- Keyboard navigation is fully supported

## Styling

The component uses Material-UI components and respects the application theme:
- Uses `Box` for layout with consistent spacing (`mb: 3`)
- Uses `TextField` components with MUI styling
- Fields are full-width with 2-unit bottom margin
- Error states use MUI's built-in error styling

## Testing

Comprehensive test coverage (35 tests) includes:
- Rendering all three input fields
- Field value display and updates
- Change callbacks invocation
- Required field marking
- Maximum length enforcement
- Validation error display
- Error state styling
- Value preservation on validation failure
- Multiple simultaneous errors
- Accessibility features
- Placeholder values

Run tests:
```bash
npm test -- ContactSection.test.tsx --run
```
