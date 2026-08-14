# useNotifications Hook

## Overview

The `useNotifications` hook provides user feedback for artifact generation results in the Deployment Notification Generator Portal. It manages notification state and provides methods to display success messages, warnings, errors, and detailed generation result feedback.

**Task**: 17.3  
**Requirements**: 10.8, 11.4, 13.3, 13.4

## Features

- ✅ Display success notifications for successful generation
- ✅ Display warning notifications for partial success
- ✅ Display error notifications for complete failures
- ✅ Show detailed error messages per form and artifact type
- ✅ Handle popup blocked scenarios
- ✅ Dismissible notifications with close button
- ✅ Automatic message formatting from DeliveryResult

## API

### Hook Return Value

```typescript
interface UseNotificationsReturn {
  notification: Notification | null;
  showSuccess: (message: string, details?: string[]) => void;
  showInfo: (message: string, details?: string[]) => void;
  showWarning: (message: string, details?: string[]) => void;
  showError: (message: string, details?: string[]) => void;
  showGenerationResult: (result: DeliveryResult, totalForms: number) => void;
  clearNotification: () => void;
}
```

### Notification Type

```typescript
interface Notification {
  id: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  message: string;
  details?: string[];
}
```

## Usage

### Basic Usage

```typescript
import { useNotifications } from './hooks/useNotifications';
import { NotificationDisplay } from './components/NotificationDisplay';

function MyComponent() {
  const { notification, showSuccess, clearNotification } = useNotifications();
  
  const handleAction = () => {
    showSuccess('Operation completed successfully!');
  };
  
  return (
    <>
      <NotificationDisplay 
        notification={notification} 
        onClose={clearNotification} 
      />
      <button onClick={handleAction}>Do Something</button>
    </>
  );
}
```

### Generation Result Notifications

The `showGenerationResult` method automatically formats messages based on the delivery result:

```typescript
import { deliverArtifacts } from './utils/sequentialDelivery';
import { useNotifications } from './hooks/useNotifications';

function GenerateButton() {
  const { notification, showGenerationResult, clearNotification } = useNotifications();
  
  const handleGenerate = async () => {
    const bundles = buildArtifactBundles(forms, theme);
    const result = await deliverArtifacts(bundles);
    
    // Automatically shows appropriate notification based on result
    showGenerationResult(result, forms.length);
  };
  
  return (
    <>
      <NotificationDisplay notification={notification} onClose={clearNotification} />
      <button onClick={handleGenerate}>Generate Outputs</button>
    </>
  );
}
```

## Notification Messages

### Success (All artifacts generated)

**Requirement**: 17.3

```
✅ Success
Generated 3×3 artifacts successfully
• All 9 artifacts (HTML, PDF, PNG) were delivered successfully.
```

### Warning (Popup blocked)

**Requirement**: 13.3

```
⚠️ Partial Success
Generated 2 of 3 artifacts (1 failed)
• Please allow pop-ups to view HTML notifications
• Form form-1: Failed to generate HTML
```

### Warning (Partial failure)

**Requirement**: 13.4

```
⚠️ Partial Success
Generated 7 of 9 artifacts (2 failed)
• Form form-1: Failed to generate PDF
• Form form-2: Failed to generate PNG
```

### Error (Complete failure)

**Requirements**: 10.8, 11.4

```
❌ Generation Failed
Generation failed for all artifacts
• All artifacts failed to generate. Please try again.
```

## Integration with App Component

```typescript
import { useNotifications } from './hooks/useNotifications';
import { NotificationDisplay } from './components/NotificationDisplay';
import { validateBatch } from './utils/validation';
import { buildArtifactBundles } from './utils/bundleBuilder';
import { deliverArtifacts } from './utils/sequentialDelivery';

function App() {
  const { theme } = useTheme();
  const { forms } = useFormManager();
  const { notification, showGenerationResult, showError, clearNotification } = useNotifications();
  
  const handleGenerateOutputs = async () => {
    // Validation (task 17.2)
    const validationResult = validateBatch(forms, theme, APPLICATION_CATALOG.length === 0);
    
    if (!validationResult.isValid) {
      showError('Please correct validation errors before generating outputs');
      return;
    }
    
    try {
      // Build and deliver artifacts (task 16.1, 16.2)
      const bundles = buildArtifactBundles(forms, theme);
      const result = await deliverArtifacts(bundles);
      
      // Show result notification (task 17.3)
      showGenerationResult(result, forms.length);
    } catch (error) {
      showError('An unexpected error occurred during generation');
    }
  };
  
  return (
    <Container>
      <NotificationDisplay notification={notification} onClose={clearNotification} />
      <FormManager />
      <Button onClick={handleGenerateOutputs}>Generate Outputs</Button>
    </Container>
  );
}
```

## Error Grouping

The notification system automatically groups errors by form:

```typescript
// Input errors:
[
  { formId: 'form-1', artifactType: 'PDF', message: 'PDF failed' },
  { formId: 'form-1', artifactType: 'PNG', message: 'PNG failed' },
  { formId: 'form-2', artifactType: 'HTML', message: 'HTML blocked' }
]

// Displayed as:
• Form form-1: Failed to generate PDF, PNG
• Form form-2: Failed to generate HTML
```

## Accessibility

- ✅ ARIA alerts for screen readers
- ✅ Keyboard-accessible close button
- ✅ Clear visual hierarchy with titles and details
- ✅ Color-coded severity levels

## Testing

See `useNotifications.test.ts` and `NotificationDisplay.test.tsx` for comprehensive test coverage including:

- Basic notification operations
- Generation result formatting
- Error grouping logic
- Popup blocked handling
- Complete and partial failure scenarios

## Requirements Traceability

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| 10.8 | Display error messages for generation failures | `showError`, `showGenerationResult` |
| 11.4 | Display messages for artifact delivery failures | Error details in notification |
| 13.3 | Display popup blocked message | "Please allow pop-ups..." message |
| 13.4 | Display artifact failure messages | Per-form, per-artifact error details |
| 17.3 | Success message format | "Generated N×3 artifacts successfully" |

## See Also

- `NotificationDisplay.tsx` - Component for rendering notifications
- `useNotifications.example.tsx` - Usage examples
- `sequentialDelivery.ts` - Returns DeliveryResult for notifications
- Task 17.1 - Output generator integration
- Task 17.2 - Validation error display
