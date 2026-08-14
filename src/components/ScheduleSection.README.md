# ScheduleSection Component

## Overview

The `ScheduleSection` component provides date and time picker controls for entering deployment schedule information. It enforces picker-only input (rejecting keyboard entry) and validates that the end time occurs after the start time.

## Requirements

Implements requirements 4.1, 4.2, 4.3, 4.4, 4.6, 4.7:
- **4.1**: Picker-only controls that reject free-form typed entry
- **4.2**: Default deployment date to current date
- **4.3**: Default start time to 20:00 (8:00 PM)
- **4.4**: Default end time to 22:00 (10:00 PM)
- **4.6**: Validation error when End Time <= Start Time
- **4.7**: Display validation errors for missing schedule fields

## Features

- **Date Picker**: MUI DatePicker for deployment date selection
- **Time Pickers**: Two MUI TimePicker controls for start and end times
- **Read-Only Inputs**: All inputs are read-only to enforce picker-only interaction
- **Validation Display**: Shows validation errors inline with helper text
- **Time Order Validation**: Displays error when end time is not later than start time

## Props

```typescript
interface ScheduleSectionProps {
  deploymentDate: Date;
  startTime: Date;
  endTime: Date;
  onDeploymentDateChange: (value: Date | null) => void;
  onStartTimeChange: (value: Date | null) => void;
  onEndTimeChange: (value: Date | null) => void;
  deploymentDateError?: string;
  startTimeError?: string;
  endTimeError?: string;
  timeOrderError?: string;
}
```

## Usage Example

```tsx
import { ScheduleSection } from './components';
import { useState } from 'react';

function MyForm() {
  const [deploymentDate, setDeploymentDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  
  // Set default times
  startTime.setHours(20, 0, 0, 0); // 20:00
  endTime.setHours(22, 0, 0, 0);   // 22:00
  
  // Validate time order
  const timeOrderError = endTime <= startTime 
    ? 'End Time must be later than Start Time' 
    : undefined;

  return (
    <ScheduleSection
      deploymentDate={deploymentDate}
      startTime={startTime}
      endTime={endTime}
      onDeploymentDateChange={setDeploymentDate}
      onStartTimeChange={setStartTime}
      onEndTimeChange={setEndTime}
      timeOrderError={timeOrderError}
    />
  );
}
```

## Default Values

When creating a new deployment form, the schedule section should be initialized with:

```typescript
const now = new Date();
const startTime = new Date();
startTime.setHours(20, 0, 0, 0); // 20:00 (8:00 PM)

const endTime = new Date();
endTime.setHours(22, 0, 0, 0); // 22:00 (10:00 PM)

const formData = {
  deploymentDate: now,
  startTime: startTime,
  endTime: endTime,
  // ... other fields
};
```

## Validation Rules

The parent component should validate:

1. **Required Fields**: All three fields must have values
2. **Time Order**: End time must be later than start time on the same deployment date
3. **Date Completeness**: Deployment date must be a valid Date object

Example validation logic:

```typescript
function validateSchedule(date: Date, start: Date, end: Date): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!date) {
    errors.push({ field: 'deploymentDate', message: 'Deployment date is required' });
  }
  
  if (!start) {
    errors.push({ field: 'startTime', message: 'Start time is required' });
  }
  
  if (!end) {
    errors.push({ field: 'endTime', message: 'End time is required' });
  }
  
  if (date && start && end && end <= start) {
    errors.push({ 
      field: 'timeOrder', 
      message: 'End Time must be later than Start Time' 
    });
  }
  
  return errors;
}
```

## Accessibility

- All fields are marked as required with `*` indicator
- Helper text provides guidance on default values and validation rules
- Error messages are announced to screen readers via MUI's error handling
- Keyboard navigation works for picker controls (tab to open, arrow keys to navigate)

## Design Decisions

### Picker-Only Input (Requirement 4.1)

The component enforces picker-only input by setting `inputProps.readOnly: true` on all text fields. This prevents users from typing directly into the input fields while still allowing picker interaction.

### Time Order Validation Display

When a time order error occurs (End Time <= Start Time), the error message is displayed on **both** the Start Time and End Time fields. This makes it clear to the user that the relationship between these two fields is invalid.

### Date Formatting

The component uses MUI's default date and time formatting based on the user's locale. The actual formatting for display in generated artifacts is handled by the `formatSchedule()` utility function (Requirement 4.5).

## Dependencies

- `@mui/material`: Box, Typography components
- `@mui/x-date-pickers`: DatePicker, TimePicker, LocalizationProvider
- `@mui/x-date-pickers/AdapterDateFns`: Date adapter for date-fns library
- `date-fns`: Date manipulation (peer dependency)

## Testing

See `ScheduleSection.test.tsx` for comprehensive test coverage including:
- Component rendering
- Read-only input behavior
- Validation error display
- Time order error handling
- Helper text display
