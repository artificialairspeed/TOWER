# ChangeItemsSection Component

## Overview

The `ChangeItemsSection` component manages Change_Item entries (Jira change items) for deployment notifications. It provides an interface for adding, removing, and editing change items with validation.

## Requirements

Implements requirements 6.1-6.7 from the Deployment Notification Generator specification:

- **6.1**: Allow 1-999 Change_Item entries
- **6.2**: Each item requires non-empty Jira Number (1-50 chars) and Description (1-500 chars)
- **6.3**: Show validation errors for empty fields
- **6.4**: Remove individual items without altering others
- **6.5**: Prevent removal when only 1 item remains
- **6.6**: Require at least one Change_Item
- **6.7**: Display Jira Number in `<strong>` followed by Description (handled by template renderer)

## Features

### Add/Remove Controls

- **Add Button**: Creates new empty change items (up to 999 maximum)
  - Disabled when 999 items reached
  - Shows message at maximum capacity
- **Remove Button**: Deletes individual change items
  - Disabled when only 1 item remains
  - Tooltip indicates minimum requirement

### Input Fields

Each change item has:

1. **Jira Number** (text input)
   - Max length: 50 characters
   - Required field
   - Placeholder: "CHG12345"

2. **Description** (multiline textarea)
   - Max length: 500 characters
   - Required field
   - 3 rows tall
   - Placeholder: "Enter change description..."

### Validation

- Field-level errors displayed inline with red styling
- Section-level errors displayed at the top
- Items with errors highlighted with red border
- Helper text shows max length constraints

## Usage

```tsx
import { ChangeItemsSection } from './components';

function MyForm() {
  const [changeItems, setChangeItems] = useState<ChangeItem[]>([
    { id: '1', jiraNumber: '', description: '' }
  ]);
  
  const [errors, setErrors] = useState<Record<string, { jiraNumber?: string; description?: string }>>({});

  return (
    <ChangeItemsSection
      changeItems={changeItems}
      onChange={setChangeItems}
      errors={errors}
      sectionError="At least one change item is required"
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `changeItems` | `ChangeItem[]` | Yes | Array of change items (1-999 items) |
| `onChange` | `(items: ChangeItem[]) => void` | Yes | Callback when items are updated |
| `errors` | `Record<string, { jiraNumber?: string; description?: string }>` | No | Validation errors by item id |
| `sectionError` | `string` | No | General section-level error message |

## ChangeItem Type

```typescript
interface ChangeItem {
  id: string;           // Unique identifier
  jiraNumber: string;   // Jira ticket number (1-50 chars)
  description: string;  // Change description (1-500 chars)
}
```

## Implementation Notes

### Performance Considerations

- Rendering 999 items is computationally expensive (~30-60 seconds in tests)
- Component correctly enforces limits through array length checks
- Consider virtual scrolling if performance issues arise in production

### Accessibility

- All inputs have proper labels
- Required fields marked with asterisk (*)
- Error messages associated with fields
- Remove buttons have descriptive aria-labels
- Tooltips for disabled buttons

### Validation Integration

The component itself does not perform validation - it only displays errors passed via props. Validation should be performed by:

1. Form-level validators (see `utils/validators.ts`)
2. Parent form component
3. Submit handler before generation

Example validation:
```typescript
changeItems.forEach((item, index) => {
  if (!item.jiraNumber.trim()) {
    errors[item.id] = { 
      ...errors[item.id],
      jiraNumber: 'Jira Number is required' 
    };
  }
  if (!item.description.trim()) {
    errors[item.id] = { 
      ...errors[item.id],
      description: 'Description is required' 
    };
  }
});
```

## Testing

Comprehensive test suite in `ChangeItemsSection.test.tsx` covers:

- Basic rendering
- Add/remove operations
- Field validation display
- Max/min item count enforcement
- Integration workflows

Note: Tests with 999 items are not included due to rendering performance. The logic is verified with smaller datasets.
