# useOutputGenerator Hook

## Overview

The `useOutputGenerator` hook orchestrates the complete output generation workflow for deployment notification artifacts. It validates deployment forms, builds artifact bundles with file name collision handling, and delivers HTML, PDF, and PNG artifacts sequentially to prevent browser throttling.

## Task

**Task ID**: 17.1  
**Phase**: Output Generation Integration  
**Requirements**: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 13.3, 13.4

## Usage

```typescript
import { useOutputGenerator } from '../hooks';
import { useFormManager } from '../hooks';
import { useTheme } from '../hooks';
import { APPLICATION_CATALOG } from '../types/models';

function GenerateButton() {
  const { forms } = useFormManager();
  const { theme } = useTheme();
  const {
    state,
    validationResult,
    deliveryResult,
    generateOutputs,
    clearResults,
    isGenerating
  } = useOutputGenerator();

  const handleGenerate = async () => {
    const catalogEmpty = APPLICATION_CATALOG.length === 0;
    await generateOutputs(forms, theme, catalogEmpty);
  };

  return (
    <div>
      <button 
        onClick={handleGenerate} 
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Outputs'}
      </button>
      
      {/* Display validation errors */}
      {state === 'error' && validationResult && (
        <div>
          {validationResult.errors.map((error, i) => (
            <div key={i}>
              {error.field}: {error.message}
            </div>
          ))}
        </div>
      )}
      
      {/* Display delivery results */}
      {state === 'complete' && deliveryResult && (
        <div>
          <p>Successfully delivered: {deliveryResult.successful} / {deliveryResult.total}</p>
          {deliveryResult.popupBlocked && (
            <p>Some HTML tabs were blocked. Please allow pop-ups.</p>
          )}
          {deliveryResult.errors.map((error, i) => (
            <div key={i}>
              Failed: {error.artifactType} for form {error.formId}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## API

### Return Value

```typescript
interface OutputGeneratorState {
  // Current generation state
  state: GenerationState;
  
  // Validation result (populated if validation fails)
  validationResult: ValidationResult | null;
  
  // Delivery result (populated after delivery completes)
  deliveryResult: DeliveryResult | null;
  
  // Generate outputs for all forms
  generateOutputs: (
    forms: DeploymentFormData[],
    theme: Theme | null,
    catalogEmpty: boolean
  ) => Promise<void>;
  
  // Clear results and reset to idle state
  clearResults: () => void;
  
  // Whether generation is in progress
  isGenerating: boolean;
}
```

### Generation States

```typescript
type GenerationState = 
  | 'idle'        // Not generating, ready to start
  | 'validating'  // Running validation
  | 'generating'  // Building artifact bundles
  | 'delivering'  // Delivering artifacts
  | 'complete'    // Generation completed (success or partial success)
  | 'error';      // Generation failed at validation stage
```

## Workflow

### 1. Validation (Requirements 10.2, 10.3)

The hook validates all forms before generating any artifacts:

- **All forms are valid** → Proceed to generation
- **Any form fails validation** → Block generation, display all errors, preserve all entered data

Validation checks:
- Theme is selected
- Application catalog is not empty
- All form fields are complete and correctly formatted

### 2. Bundle Building (Requirements 10.4, 14.1-14.4)

If validation passes, the hook builds artifact bundles:

- Generates HTML content for each form using the selected theme
- Computes file names with collision detection and disambiguation
- Creates bundles containing HTML content, file names, and form data

### 3. Sequential Delivery (Requirements 10.5-10.7, 13.1-13.4)

Artifacts are delivered sequentially with 500ms intervals:

1. For each form (in order):
   - Open HTML in new tab
   - Wait 500ms
   - Download PDF
   - Wait 500ms
   - Download PNG
   - Wait 500ms (before next form)

### 4. Error Handling (Requirements 10.8, 13.3, 13.4)

The hook handles partial failures gracefully:

- **Popup blocked**: Records failure, continues with remaining artifacts
- **PDF/PNG generation fails**: Records failure, continues with remaining artifacts
- **Complete generation failure**: Reports error, blocks all delivery

All failures are reported in the `deliveryResult.errors` array.

## Requirements Coverage

### Requirement 10: Output Generation

- **10.1**: Single Generate Outputs control via `generateOutputs` method
- **10.2**: Validates every form before generating any artifact
- **10.3**: Blocks generation if any form fails, displays errors, preserves state
- **10.4**: Generates HTML for each form containing all metadata
- **10.5**: Opens HTML artifacts in new browser tabs
- **10.6**: Downloads PDF artifacts automatically
- **10.7**: Downloads PNG artifacts automatically
- **10.8**: Blocks delivery on generation failure, displays errors

### Requirement 13: Sequential Output Delivery

- **13.1**: Opens HTML tabs one at a time with 500ms minimum intervals
- **13.2**: Downloads PDF/PNG one at a time with 500ms minimum intervals
- **13.3**: Displays popup blocked message, continues with remaining
- **13.4**: Continues on individual failures, displays failure messages

## Example: Complete Integration

```typescript
function OutputGeneratorComponent() {
  const { forms } = useFormManager();
  const { theme } = useTheme();
  const {
    state,
    validationResult,
    deliveryResult,
    generateOutputs,
    clearResults,
    isGenerating
  } = useOutputGenerator();

  const handleGenerate = async () => {
    await generateOutputs(
      forms,
      theme,
      APPLICATION_CATALOG.length === 0
    );
  };

  return (
    <div>
      {/* Generate Button */}
      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating 
          ? `Generating (${state})...` 
          : 'Generate Outputs'
        }
      </button>

      {/* Validation Errors */}
      {state === 'error' && validationResult && (
        <div className="error-container">
          <h3>Validation Failed</h3>
          <p>Please correct the following errors:</p>
          <ul>
            {validationResult.errors.map((error, i) => (
              <li key={i}>
                <strong>Form {error.formId}</strong> - 
                {error.field}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delivery Results */}
      {state === 'complete' && deliveryResult && (
        <div className="success-container">
          <h3>Generation Complete</h3>
          <p>
            Successfully delivered {deliveryResult.successful} of {deliveryResult.total} artifacts
          </p>

          {/* Popup Blocked Warning */}
          {deliveryResult.popupBlocked && (
            <div className="warning">
              Some HTML tabs were blocked by your browser. 
              Please allow pop-ups to view HTML artifacts.
            </div>
          )}

          {/* Individual Failures */}
          {deliveryResult.errors.length > 0 && (
            <div className="error-list">
              <h4>Failures:</h4>
              <ul>
                {deliveryResult.errors.map((error, i) => (
                  <li key={i}>
                    {error.artifactType} failed for form {error.formId}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clear Results */}
          <button onClick={clearResults}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
```

## Testing

The hook includes comprehensive unit tests covering:

- **Validation blocking**: Ensures generation is blocked when validation fails
- **Successful workflows**: Verifies complete generation pipeline
- **Partial failures**: Tests popup blocking and artifact generation failures
- **State management**: Validates state transitions and result clearing

Run tests:

```bash
npm test -- useOutputGenerator
```

## Dependencies

- `validateBatch` from `../utils/validators`
- `buildArtifactBundles` from `../utils/bundleBuilder`
- `deliverArtifacts` from `../utils/sequentialDelivery`

## Related Files

- `/src/utils/validators.ts` - Form and batch validation
- `/src/utils/bundleBuilder.ts` - Artifact bundle creation
- `/src/utils/sequentialDelivery.ts` - Sequential artifact delivery
- `/src/hooks/useFormManager.ts` - Form lifecycle management
- `/src/hooks/useTheme.ts` - Theme selection
