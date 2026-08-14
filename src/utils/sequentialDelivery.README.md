# Sequential Delivery Pacer

## Overview

The Sequential Delivery Pacer implements artifact delivery orchestration with 500ms intervals between operations to prevent browser throttling. It handles opening HTML tabs and downloading PDF/PNG artifacts in a controlled, sequential manner.

**Task:** 16.2  
**Requirements:** 13.1, 13.2, 13.3, 13.4

## Core Functionality

### `deliverArtifacts(bundles: ArtifactBundle[]): Promise<DeliveryResult>`

Delivers all artifacts for multiple deployment forms sequentially with proper timing.

**Process:**
1. Opens HTML tab for form 1
2. Waits 500ms
3. Downloads PDF for form 1
4. Waits 500ms
5. Downloads PNG for form 1
6. Waits 500ms
7. Repeats for remaining forms

**Parameters:**
- `bundles` - Array of artifact bundles from `buildArtifactBundles()`

**Returns:**
- `DeliveryResult` object containing:
  - `total` - Total number of artifacts (bundles × 3)
  - `successful` - Number of successfully delivered artifacts
  - `failed` - Number of failed artifacts
  - `errors` - Array of error details
  - `popupBlocked` - Whether any HTML tabs were blocked

## Requirements Coverage

### Requirement 13.1: Sequential HTML Tab Opening
HTML tabs are opened one at a time in form order, with a minimum 500ms interval between each tab opening.

```typescript
const result = await deliverArtifacts(bundles);
// Opens HTML tabs sequentially with 500ms spacing
```

### Requirement 13.2: Sequential Download Delivery
PDF and PNG downloads are initiated one at a time with minimum 500ms intervals.

```typescript
// Order: HTML1 → (500ms) → PDF1 → (500ms) → PNG1 → (500ms) → HTML2 → ...
```

### Requirement 13.3: Popup Blocking Recovery
If a browser blocks an HTML tab, the pacer records the failure and continues with remaining artifacts.

```typescript
if (result.popupBlocked) {
  console.log('Please allow pop-ups to view HTML artifacts');
}
// Remaining artifacts still delivered
```

### Requirement 13.4: Download Failure Recovery
If any PDF or PNG generation fails, the pacer continues with remaining artifacts and reports all failures.

```typescript
result.errors.forEach(error => {
  console.log(`${error.artifactType} failed for form ${error.formId}`);
});
```

## Usage Examples

### Basic Usage

```typescript
import { deliverArtifacts } from './sequentialDelivery';
import { buildArtifactBundles } from './bundleBuilder';

// Build bundles
const bundles = buildArtifactBundles(forms, theme);

// Deliver sequentially
const result = await deliverArtifacts(bundles);

console.log(`Delivered ${result.successful}/${result.total} artifacts`);
```

### Error Handling

```typescript
const result = await deliverArtifacts(bundles);

if (result.failed > 0) {
  // Some artifacts failed - show specific errors
  result.errors.forEach(error => {
    showError(`${error.artifactType} for ${error.formId}: ${error.message}`);
  });
}

if (result.popupBlocked) {
  showWarning('Please enable pop-ups to view HTML notifications');
}
```

### Multiple Forms

```typescript
// 5 forms = 15 artifacts
const forms = [form1, form2, form3, form4, form5];
const bundles = buildArtifactBundles(forms, 'Dark Mode');

// Minimum delivery time: (15 - 1) × 500ms = 7000ms (7 seconds)
const result = await deliverArtifacts(bundles);
```

### User Feedback

```typescript
// Show loading indicator
setLoading(true);
setStatus('Generating artifacts...');

const result = await deliverArtifacts(bundles);

// Update status
if (result.successful === result.total) {
  setStatus(`✅ Successfully delivered ${result.total} artifacts`);
} else {
  setStatus(`⚠️  Delivered ${result.successful}/${result.total} artifacts`);
}

setLoading(false);
```

## Implementation Details

### Timing Strategy

The pacer uses `setTimeout` with 500ms delays between each artifact operation:

```typescript
async function deliverArtifacts(bundles) {
  for (const bundle of bundles) {
    await deliverHTMLTab(bundle, result);
    await delay(500); // Wait 500ms
    
    await deliverPDF(bundle, result);
    await delay(500); // Wait 500ms
    
    await deliverPNG(bundle, result);
    await delay(500); // Wait 500ms before next bundle
  }
}
```

### Error Isolation

Each artifact delivery is wrapped in try-catch to ensure one failure doesn't stop the entire batch:

```typescript
try {
  await generatePDF(html, fileName);
  result.successful++;
} catch (error) {
  result.failed++;
  result.errors.push({ formId, artifactType: 'PDF', message, error });
  // Continue with next artifact
}
```

### Popup Blocking Detection

HTML tab opening returns a boolean indicating success:

```typescript
const opened = openHTMLTab(htmlContent);
if (!opened) {
  result.popupBlocked = true;
  result.failed++;
  // Continue with PDF and PNG
}
```

## Performance Characteristics

### Timing Calculations

| Forms | Total Artifacts | Minimum Time | Intervals |
|-------|----------------|--------------|-----------|
| 1     | 3              | 1000ms (1s)  | 2         |
| 2     | 6              | 2500ms (2.5s)| 5         |
| 3     | 9              | 4000ms (4s)  | 8         |
| 5     | 15             | 7000ms (7s)  | 14        |

**Formula:** `(total_artifacts - 1) × 500ms`

### Browser Compatibility

The pacer uses standard browser APIs:
- `setTimeout` for delays
- `window.open` for HTML tabs
- Automatic downloads for PDF/PNG

All modern browsers support these APIs without polyfills.

## Testing

The pacer includes comprehensive unit tests covering:

1. **Basic delivery flow** - Single bundle with 3 artifacts
2. **Sequential ordering** - Correct order and timing
3. **Multiple bundles** - N forms → N×3 artifacts
4. **Error handling** - Popup blocking, generation failures
5. **Edge cases** - Empty bundles, total failures

Run tests:
```bash
npm test -- sequentialDelivery.test.ts
```

## Integration Points

### Before Delivery

```typescript
// 1. Validate forms
const validation = validateBatch(forms, theme, catalogEmpty);
if (!validation.isValid) {
  throw new Error('Validation failed');
}

// 2. Build bundles (generates HTML, computes file names)
const bundles = buildArtifactBundles(forms, theme);
```

### After Delivery

```typescript
// 3. Deliver artifacts
const result = await deliverArtifacts(bundles);

// 4. Show results to user
if (result.successful === result.total) {
  showSuccess('All artifacts delivered!');
} else {
  showErrors(result.errors);
}
```

## Common Patterns

### Progress Tracking

```typescript
// The pacer doesn't provide progress callbacks, but you can estimate:
const totalArtifacts = bundles.length * 3;
const estimatedTime = (totalArtifacts - 1) * 500;

showProgress(`Delivering ${totalArtifacts} artifacts (~${estimatedTime}ms)...`);
await deliverArtifacts(bundles);
```

### Retry Failed Artifacts

```typescript
const result = await deliverArtifacts(bundles);

if (result.failed > 0) {
  // Extract failed form IDs
  const failedFormIds = [...new Set(result.errors.map(e => e.formId))];
  
  // Rebuild bundles for failed forms only
  const failedForms = forms.filter(f => failedFormIds.includes(f.formId));
  const retryBundles = buildArtifactBundles(failedForms, theme);
  
  // Retry delivery
  await deliverArtifacts(retryBundles);
}
```

## Limitations

1. **No progress callbacks** - The function doesn't provide real-time progress updates during delivery
2. **No cancellation** - Once started, delivery cannot be cancelled mid-process
3. **Fixed 500ms interval** - The interval is not configurable (per requirements)
4. **Browser-dependent** - Popup blocking behavior varies by browser
5. **No retry logic** - Failed artifacts are reported but not automatically retried

## Future Enhancements (Out of Scope)

- Configurable interval timing
- Progress callbacks for real-time UI updates
- Cancellation token support
- Automatic retry with exponential backoff
- Batch delivery with configurable concurrency
