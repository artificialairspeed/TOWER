# Title Generation Functions

## Overview

This module implements the title generation functions required for Task 4.1 of the Deployment Notification Generator Portal.

## Functions Implemented

### `generateDeploymentTitle(data: DeploymentFormData): string`

Generates the deployment title in the standardized format used across all notification artifacts.

**Format:** `[CHG#####] — [Application Name: Release Version - Deploy Product to ENVIRONMENT]`

**Behavior:**
- Returns a complete title when all required fields are present:
  - Application (with name)
  - Change Number
  - Release Version
  - Environment
- Returns an empty string if any required component is missing
- Does not modify the input data (pure function)

**Examples:**
```typescript
// Complete data
generateDeploymentTitle({
  application: { name: 'Crew Portal', ... },
  changeNumber: 'CHG12345',
  releaseVersion: 'v5.4.1',
  environment: 'PROD',
  ...
})
// Returns: "[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]"

// Missing application
generateDeploymentTitle({
  application: null,
  changeNumber: 'CHG12345',
  releaseVersion: 'v5.4.1',
  environment: 'PROD',
  ...
})
// Returns: ""
```

### `generateNotificationHeader(applicationName: string): string`

Generates the notification header text for a given application.

**Format:** `{Application Name} Deployment Notification`

**Behavior:**
- Takes an application name string
- Returns the formatted header
- Simple string concatenation

**Examples:**
```typescript
generateNotificationHeader('Crew Portal')
// Returns: "Crew Portal Deployment Notification"

generateNotificationHeader('AO Crew Training')
// Returns: "AO Crew Training Deployment Notification"
```

## Requirements Met

- **Requirement 2.4**: WHEN the coordinator selects or changes the selected application, THE Title_Generator SHALL re-derive the Deployment_Title to reflect the currently selected application name.
- **Requirement 2.5**: WHEN the coordinator selects or changes the selected application, THE Portal SHALL re-derive the Notification_Header to reflect the currently selected application name.
- **Requirement 3.6**: THE Title_Generator SHALL compute the Deployment_Title in the format `[CHG#####] — [Application Name: Release Version - Deploy Product to ENVIRONMENT]`.

## Test Coverage

The implementation includes comprehensive unit tests covering:

### generateDeploymentTitle tests:
- ✓ Complete title with all fields present
- ✓ Empty string when application is missing
- ✓ Empty string when change number is missing
- ✓ Empty string when release version is missing
- ✓ Empty string when environment is missing
- ✓ Different applications (AO Crew Training, Crew Portal, etc.)
- ✓ Different environments (PROD, QA, ITEST, DEV)
- ✓ Different change numbers
- ✓ Different release versions
- ✓ Edge cases (no "v" prefix, no "CHG" prefix)

### generateNotificationHeader tests:
- ✓ Simple application names
- ✓ Multi-word application names
- ✓ All 5 applications in the catalog
- ✓ Edge cases (empty string, casing preservation)

**Total: 21 tests, all passing**

## Usage

Import from the utils module:

```typescript
import { generateDeploymentTitle, generateNotificationHeader } from '@/utils';

// Or directly from the module:
import { generateDeploymentTitle, generateNotificationHeader } from '@/utils/formatters';
```

## Files

- `src/utils/formatters.ts` - Implementation
- `src/utils/formatters.test.ts` - Unit tests
- `src/utils/formatters.example.ts` - Usage examples
- `src/utils/index.ts` - Re-exports for convenience

## Next Steps

These functions will be used by:
- Task 3.3: Form-level validation orchestrator (to compute deploymentTitle field)
- Task 9.3: DeploymentTitleDisplay component (real-time title updates)
- Task 7.4: Template token injection engine (for {{DEPLOYMENT_TITLE}} and {{NOTIFICATION_HEADER}} tokens)
