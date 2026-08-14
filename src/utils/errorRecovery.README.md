# Error Recovery and Reporting

## Overview

The error recovery module provides robust error handling for artifact generation, implementing the requirement that generation failures for one deployment form should not prevent generation for other forms.

**Task**: 16.3 - Implement error recovery and reporting  
**Requirements**: 10.8, 11.4, 13.3, 13.4

## Key Features

### 1. Resilient Bundle Building

The `buildArtifactBundlesWithRecovery` function wraps the `buildArtifactBundles` function with error recovery logic:

- **Fast Path**: Attempts to build all bundles together (efficient when all forms are valid)
- **Fallback**: If batch building fails, processes forms individually to isolate failures
- **Continue on Error**: Failed forms are captured as errors while remaining forms continue processing

```typescript
const result = buildArtifactBundlesWithRecovery(forms, 'Dark Mode');
// result.bundles: Successfully built bundles
// result.errors: Array of errors for failed forms
```

### 2. Error Reporting Utilities

#### `formatGenerationError`
Converts a `GenerationError` object into a user-friendly error message:

```typescript
const error = { formId: 'form-1', artifactType: 'PDF', message: 'Generation failed' };
const message = formatGenerationError(error, 'Crew Portal Deployment');
// "Failed to generate PDF for Crew Portal Deployment: Generation failed"
```

#### `getErrorSummary`
Creates a summary of multiple errors:

```typescript
const summary = getErrorSummary(errors);
// "2 artifacts failed to generate"
```

#### `groupErrorsByForm`
Organizes errors by form for per-form error display:

```typescript
const grouped = groupErrorsByForm(errors);
// Map { 'form-1' => [error1, error2], 'form-2' => [error3] }
```

## Architecture

### Error Recovery Flow

```
┌─────────────────────────────────────────────────────────────┐
│ buildArtifactBundlesWithRecovery(forms, theme)              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Try batch building    │───── Success ──────┐
              │  (all forms together)  │                    │
              └────────────────────────┘                    │
                           │                                │
                        Failure                             │
                           │                                │
                           ▼                                │
              ┌────────────────────────┐                    │
              │  Fall back to          │                    │
              │  individual processing │                    │
              └────────────────────────┘                    │
                           │                                │
                           ▼                                │
              ┌────────────────────────┐                    │
              │  For each form:        │                    │
              │  - Try to build bundle │                    │
              │  - On success: add     │                    │
              │  - On failure: capture │                    │
              │    error, continue     │                    │
              └────────────────────────┘                    │
                           │                                │
                           └────────────────────────────────┘
                                        │
                                        ▼
                           ┌────────────────────────┐
                           │  Return:               │
                           │  - bundles (successes) │
                           │  - errors (failures)   │
                           └────────────────────────┘
```

### Error Types

The module handles three categories of errors:

1. **Bundle Build Errors** (caught in this module)
   - Missing required fields
   - Template loading failures
   - File name generation failures

2. **Artifact Generation Errors** (caught in sequential delivery)
   - PDF generation failures
   - PNG generation failures
   - HTML rendering failures

3. **Delivery Errors** (caught in sequential delivery)
   - Popup blocked by browser
   - Download failures
   - Network errors

## Usage Examples

### Basic Usage

```typescript
import { buildArtifactBundlesWithRecovery, deliverArtifacts } from './utils';

// Build bundles with error recovery
const buildResult = buildArtifactBundlesWithRecovery(forms, 'Dark Mode');

if (buildResult.errors.length > 0) {
  console.error(`${buildResult.errors.length} forms failed to build`);
  buildResult.errors.forEach(error => {
    console.error(formatGenerationError(error));
  });
}

// Continue with successful bundles
if (buildResult.bundles.length > 0) {
  const deliveryResult = await deliverArtifacts(buildResult.bundles);
  
  // Check for delivery errors
  if (deliveryResult.errors.length > 0) {
    console.error(`${deliveryResult.errors.length} artifacts failed to deliver`);
  }
}
```

### Error Display in UI

```typescript
import { 
  buildArtifactBundlesWithRecovery, 
  groupErrorsByForm,
  formatGenerationError 
} from './utils';

const result = buildArtifactBundlesWithRecovery(forms, 'Dark Mode');

if (result.errors.length > 0) {
  const errorsByForm = groupErrorsByForm(result.errors);
  
  // Display errors per form
  errorsByForm.forEach((errors, formId) => {
    const formName = forms.find(f => f.formId === formId)?.deploymentTitle;
    
    errors.forEach(error => {
      showErrorToUser(formatGenerationError(error, formName));
    });
  });
}
```

### Combined Build and Delivery

```typescript
async function generateAllArtifacts(forms: DeploymentFormData[], theme: Theme) {
  // Step 1: Build bundles with recovery
  const buildResult = buildArtifactBundlesWithRecovery(forms, theme);
  
  const allErrors = [...buildResult.errors];
  
  // Step 2: Deliver successful bundles
  if (buildResult.bundles.length > 0) {
    const deliveryResult = await deliverArtifacts(buildResult.bundles);
    allErrors.push(...deliveryResult.errors);
  }
  
  // Step 3: Report results
  const totalRequested = forms.length * 3; // 3 artifacts per form
  const successful = buildResult.bundles.length * 3 - allErrors.length;
  
  return {
    total: totalRequested,
    successful,
    failed: totalRequested - successful,
    errors: allErrors
  };
}
```

## Implementation Details

### Fast Path Optimization

The function attempts batch building first because it's more efficient when all forms are valid:

```typescript
try {
  const bundles = buildArtifactBundles(forms, theme);
  result.bundles = bundles;
  return result; // Fast path - no errors
} catch (error) {
  // Fall back to individual processing
}
```

This means:
- **Common case** (all valid): Single bundle building call
- **Error case** (some invalid): 1 batch call + N individual calls

### Error Preservation

All error information is preserved:

```typescript
{
  formId: string;        // Which form failed
  artifactType: 'HTML' | 'PDF' | 'PNG';  // Which artifact type
  message: string;       // User-friendly message
  error?: Error;         // Original error for debugging
}
```

## Requirements Mapping

| Requirement | Implementation |
|-------------|----------------|
| 10.8 | `buildArtifactBundlesWithRecovery` catches bundle build errors |
| 11.4 | Continues processing remaining forms on single-form failure |
| 13.3 | Popup blocking detected and reported (in `deliverArtifacts`) |
| 13.4 | PDF/PNG generation errors caught and reported (in `deliverArtifacts`) |

## Testing

The module includes comprehensive unit tests covering:

- ✅ Success scenarios (all forms valid)
- ✅ Single form failure (continue with others)
- ✅ Multiple form failures
- ✅ Error type handling (Error objects vs strings)
- ✅ Fast path optimization
- ✅ Form order preservation
- ✅ Error formatting and grouping utilities

Run tests:
```bash
npm test errorRecovery.test.ts
```

## Related Modules

- **`bundleBuilder.ts`**: Core bundle building logic (wrapped by this module)
- **`sequentialDelivery.ts`**: Artifact delivery with error recovery
- **`artifactGeneration.ts`**: Individual artifact generation functions

## Future Enhancements

Potential improvements:

1. **Retry Logic**: Automatic retry for transient failures
2. **Partial Recovery**: Save partial artifacts for manual completion
3. **Error Categories**: Distinguish recoverable vs. non-recoverable errors
4. **User Actions**: Suggest corrective actions based on error type
