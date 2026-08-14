# ImpactSection Component

## Overview

The `ImpactSection` component provides a user interface for managing deployment impact items. It allows coordinators to add, edit, and remove impact descriptions with full validation support.

## Requirements Implemented

- **7.1**: Add impact items (1-100 total)
- **7.2**: Enforce maximum of 100 items with warning message
- **7.3**: Validate non-empty text
- **7.4**: Enforce 500 character maximum per item
- **7.5**: Remove impact items
- **7.6**: Prevent removal of last item (minimum 1 required)
- **7.7**: Display validation errors
- **7.8**: Preserve insertion order

## Usage

```tsx
import { ImpactSection } from './components';
import type { ImpactItem } from './types/models';

function MyForm() {
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([
    { id: '1', text: '' }
  ]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <ImpactSection
      impactItems={impactItems}
      onImpactItemsChange={setImpactItems}
      errors={errors}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `impactItems` | `ImpactItem[]` | Yes | Current list of impact items (1-100 items) |
| `onImpactItemsChange` | `(items: ImpactItem[]) => void` | Yes | Callback when impact items list changes |
| `errors` | `Record<string, string>` | No | Validation errors keyed by field path |

## Features

### Adding Impact Items

- Click "Add Impact Item" button to create a new empty impact item
- New items are appended to the end of the list (preserves insertion order)
- Button is disabled when 100 items exist
- Warning message displays when at maximum capacity: "Maximum 100 impact items reached"

### Editing Impact Items

- Each item has a multiline textarea (3 rows)
- Character count display: "X/500 characters"
- When text exceeds 500 characters, shows warning: "X/500 characters - Exceeds maximum length"
- Changes are immediately propagated via `onImpactItemsChange`

### Removing Impact Items

- Each item has a delete button (trash icon)
- Delete button is disabled when only 1 item remains
- Disabled button shows tooltip: "At least one impact item is required"
- Removal preserves the order of remaining items

### Validation Display

- Field-level errors appear below each textarea
- Textarea border turns red when error exists
- General list-level errors appear at the bottom of the section
- Errors keyed by field path: `impactItems[0].text`, `impactItems[1].text`, etc.
- General errors keyed by: `impactItems`

## Validation Rules

1. **Minimum items**: At least 1 impact item is required
2. **Maximum items**: No more than 100 impact items allowed
3. **Non-empty text**: Each impact item must have non-empty text after trimming
4. **Maximum length**: Each impact item must not exceed 500 characters after trimming

## Error Format

```tsx
const errors = {
  // Field-specific errors
  'impactItems[0].text': 'Impact Item 1: Text is required',
  'impactItems[1].text': 'Impact Item 2: Text must not exceed 500 characters',
  
  // General list-level errors
  'impactItems': 'At least one Impact Item is required'
};
```

## Accessibility

- All textareas have required attribute
- Remove buttons have aria-label: "Remove impact item N"
- Disabled remove button has descriptive title attribute
- Error messages are associated with their inputs via aria-describedby
- Textareas have aria-invalid attribute when errors exist

## Implementation Notes

- Uses MUI TextField component with multiline prop
- Uses MUI IconButton for delete functionality
- Item IDs are generated using timestamp + random string
- Component is fully controlled (no internal state management)
- Insertion order is preserved through all operations

## Testing

Comprehensive test coverage includes:
- Initial rendering with default items
- Adding items up to maximum capacity
- Removing items down to minimum capacity
- Text input and character count display
- Validation error display
- Order preservation
- Accessibility attributes

Run tests:
```bash
npm test -- ImpactSection.test.tsx
```

## Related Components

- **ChangeItemsSection**: Similar list management for Jira change items
- **DeploymentForm**: Parent component that integrates all form sections

## Related Types

```typescript
interface ImpactItem {
  id: string;
  text: string; // 1-500 chars
}
```

## Design Decisions

1. **Button Disabling vs Error Messages**: We disable add/remove buttons at limits rather than showing error messages after failed attempts
2. **Character Count Display**: Always visible to provide clear feedback to users
3. **Immediate Validation Feedback**: Character count shows warning when exceeding limit, even before form submission
4. **Browser Max Length**: We set `maxLength` on the input as a backup, but validation still checks the constraint
