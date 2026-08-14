# DeploymentInfoSection Component

## Overview

The `DeploymentInfoSection` component provides input controls for core deployment identifiers:
- Change Number (required, max 20 chars, auto-trim on blur)
- Release Version (required, max 50 chars, auto-trim on blur)
- Environment dropdown (required, PROD/QA/ITEST/DEV options, none selected by default)

## Requirements

Implements requirements: **3.1, 3.2, 3.3, 3.4, 3.5**

## Usage

```tsx
import { DeploymentInfoSection } from './components';

function MyForm() {
  const [changeNumber, setChangeNumber] = useState('');
  const [releaseVersion, setReleaseVersion] = useState('');
  const [environment, setEnvironment] = useState<Environment | null>(null);
  
  return (
    <DeploymentInfoSection
      changeNumber={changeNumber}
      releaseVersion={releaseVersion}
      environment={environment}
      onChangeNumberChange={setChangeNumber}
      onReleaseVersionChange={setReleaseVersion}
      onEnvironmentChange={setEnvironment}
      changeNumberError={errors.changeNumber}
      releaseVersionError={errors.releaseVersion}
      environmentError={errors.environment}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `changeNumber` | `string` | Yes | Current change number value |
| `releaseVersion` | `string` | Yes | Current release version value |
| `environment` | `Environment \| null` | Yes | Current environment value (null if not selected) |
| `onChangeNumberChange` | `(value: string) => void` | Yes | Callback when change number changes |
| `onReleaseVersionChange` | `(value: string) => void` | Yes | Callback when release version changes |
| `onEnvironmentChange` | `(value: Environment \| null) => void` | Yes | Callback when environment changes |
| `changeNumberError` | `string` | No | Validation error for change number field |
| `releaseVersionError` | `string` | No | Validation error for release version field |
| `environmentError` | `string` | No | Validation error for environment field |

## Features

### Auto-Trim on Blur (Requirement 3.4)

When the user leaves the Change Number or Release Version input fields, any leading or trailing whitespace is automatically trimmed:

```tsx
// User enters "  CHG12345  " and tabs away
// onChange is called with "CHG12345" (trimmed)
```

### Max Length Enforcement (Requirements 3.1, 3.2)

- Change Number: Maximum 20 characters
- Release Version: Maximum 50 characters

### Environment Dropdown (Requirement 3.3)

The environment dropdown provides exactly four options:
- PROD
- QA
- ITEST
- DEV

No environment is selected by default. The dropdown can be cleared by selecting the placeholder option.

### Validation Error Display (Requirement 3.5)

Validation errors are displayed adjacent to the field with the error, and the field is highlighted with MUI's error styling:

```tsx
<DeploymentInfoSection
  {...props}
  changeNumberError="Change Number is required"
/>
// Displays error message below the Change Number field
// Field border turns red
```

## Testing

The component has comprehensive test coverage including:
- Field rendering and value display
- Input change handlers
- Max length enforcement
- Auto-trim on blur behavior
- Validation error display
- Environment dropdown options and selection
- Integration scenarios

Run tests with:
```bash
npm test -- DeploymentInfoSection.test.tsx
```

## Implementation Notes

- Uses Material UI v5 components (TextField, Select, FormControl, etc.)
- Follows React best practices with controlled components
- Only calls onChange callbacks when values actually change (e.g., blur handler only trims if needed)
- Provides helpful placeholder text and helper messages
- Fully accessible with proper ARIA labels from MUI
