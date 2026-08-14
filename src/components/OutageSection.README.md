# OutageSection Component

A section component for capturing outage indicator and optional outage date/time details for deployment notifications.

## Requirements Coverage

This component implements the following requirements from the specification:

- **5.1**: Yes/No outage indicator using radio buttons
- **5.2**: Default outage indicator to No
- **5.3**: Conditionally render MUI DateTimePickers for outage start/end (4 pickers total)
- **5.4**: Hide pickers when No selected
- **5.5**: Clear outage values when switching from Yes to No
- **5.6**: Show validation error when outage end <= outage start

## Props

```typescript
interface OutageSectionProps {
  /** Whether this deployment has an outage */
  hasOutage: boolean;
  
  /** Outage start date (null if no outage or not set) */
  outageStartDate: Date | null;
  
  /** Outage start time (null if no outage or not set) */
  outageStartTime: Date | null;
  
  /** Outage end date (null if no outage or not set) */
  outageEndDate: Date | null;
  
  /** Outage end time (null if no outage or not set) */
  outageEndTime: Date | null;
  
  /** Callback when outage indicator changes */
  onHasOutageChange: (hasOutage: boolean) => void;
  
  /** Callback when outage start date changes */
  onOutageStartDateChange: (date: Date | null) => void;
  
  /** Callback when outage start time changes */
  onOutageStartTimeChange: (time: Date | null) => void;
  
  /** Callback when outage end date changes */
  onOutageEndDateChange: (date: Date | null) => void;
  
  /** Callback when outage end time changes */
  onOutageEndTimeChange: (time: Date | null) => void;
  
  /** Validation error message (if any) */
  error?: string;
}
```

## Usage

### Basic Usage (No Outage - Default)

```tsx
import { useState } from 'react';
import { OutageSection } from './components';

function MyForm() {
  const [hasOutage, setHasOutage] = useState(false);
  const [outageStartDate, setOutageStartDate] = useState<Date | null>(null);
  const [outageStartTime, setOutageStartTime] = useState<Date | null>(null);
  const [outageEndDate, setOutageEndDate] = useState<Date | null>(null);
  const [outageEndTime, setOutageEndTime] = useState<Date | null>(null);

  return (
    <OutageSection
      hasOutage={hasOutage}
      outageStartDate={outageStartDate}
      outageStartTime={outageStartTime}
      outageEndDate={outageEndDate}
      outageEndTime={outageEndTime}
      onHasOutageChange={setHasOutage}
      onOutageStartDateChange={setOutageStartDate}
      onOutageStartTimeChange={setOutageStartTime}
      onOutageEndDateChange={setOutageEndDate}
      onOutageEndTimeChange={setOutageEndTime}
    />
  );
}
```

### With Outage Details

```tsx
function MyForm() {
  const [hasOutage, setHasOutage] = useState(true);
  const [outageStartDate, setOutageStartDate] = useState<Date | null>(new Date('2025-01-15'));
  const [outageStartTime, setOutageStartTime] = useState<Date | null>(new Date('2025-01-15T20:00:00'));
  const [outageEndDate, setOutageEndDate] = useState<Date | null>(new Date('2025-01-15'));
  const [outageEndTime, setOutageEndTime] = useState<Date | null>(new Date('2025-01-15T22:00:00'));

  return (
    <OutageSection
      hasOutage={hasOutage}
      outageStartDate={outageStartDate}
      outageStartTime={outageStartTime}
      outageEndDate={outageEndDate}
      outageEndTime={outageEndTime}
      onHasOutageChange={setHasOutage}
      onOutageStartDateChange={setOutageStartDate}
      onOutageStartTimeChange={setOutageStartTime}
      onOutageEndDateChange={setOutageEndDate}
      onOutageEndTimeChange={setOutageEndTime}
    />
  );
}
```

### With Validation Error

```tsx
function MyForm() {
  const [hasOutage, setHasOutage] = useState(true);
  const [outageStartDate, setOutageStartDate] = useState<Date | null>(new Date('2025-01-15'));
  const [outageStartTime, setOutageStartTime] = useState<Date | null>(new Date('2025-01-15T22:00:00'));
  const [outageEndDate, setOutageEndDate] = useState<Date | null>(new Date('2025-01-15'));
  const [outageEndTime, setOutageEndTime] = useState<Date | null>(new Date('2025-01-15T20:00:00'));
  const [error, setError] = useState<string>('');

  const validateOutage = () => {
    if (hasOutage && outageStartDate && outageStartTime && outageEndDate && outageEndTime) {
      const start = new Date(outageStartDate);
      start.setHours(outageStartTime.getHours(), outageStartTime.getMinutes());
      
      const end = new Date(outageEndDate);
      end.setHours(outageEndTime.getHours(), outageEndTime.getMinutes());
      
      if (end <= start) {
        setError('Outage end time must be later than outage start time');
      } else {
        setError('');
      }
    }
  };

  return (
    <OutageSection
      hasOutage={hasOutage}
      outageStartDate={outageStartDate}
      outageStartTime={outageStartTime}
      outageEndDate={outageEndDate}
      outageEndTime={outageEndTime}
      onHasOutageChange={setHasOutage}
      onOutageStartDateChange={(date) => {
        setOutageStartDate(date);
        validateOutage();
      }}
      onOutageStartTimeChange={(time) => {
        setOutageStartTime(time);
        validateOutage();
      }}
      onOutageEndDateChange={(date) => {
        setOutageEndDate(date);
        validateOutage();
      }}
      onOutageEndTimeChange={(time) => {
        setOutageEndTime(time);
        validateOutage();
      }}
      error={error}
    />
  );
}
```

## Behavior

### Default State (Requirement 5.2)
When the component first renders:
- `hasOutage` should be `false` by default
- Radio button "No" is selected
- Date/time pickers are hidden

### Switching to Yes (Requirement 5.3)
When user selects "Yes":
- Calls `onHasOutageChange(true)`
- Shows 4 date/time pickers:
  - Outage Start Date
  - Outage Start Time
  - Outage End Date
  - Outage End Time

### Switching to No (Requirements 5.4, 5.5)
When user selects "No":
- Calls `onHasOutageChange(false)`
- Automatically clears all outage values by calling:
  - `onOutageStartDateChange(null)`
  - `onOutageStartTimeChange(null)`
  - `onOutageEndDateChange(null)`
  - `onOutageEndTimeChange(null)`
- Hides the date/time pickers

### Validation (Requirement 5.6)
When the `error` prop is provided:
- Displays an error Alert at the top of the section
- Error message should indicate validation failures (e.g., end time before start time)

## Date/Time Pickers

The component uses Material UI's `@mui/x-date-pickers` with the following configuration:
- **DatePicker**: For selecting outage dates
- **TimePicker**: For selecting outage times
- **LocalizationProvider**: Uses `date-fns` adapter for date formatting
- **Picker-only input**: Rejects keyboard input, requires picker interaction

All pickers are marked as required when visible (`hasOutage === true`).

## Accessibility

- Uses Material UI's FormControl and Radio components for built-in accessibility
- Proper ARIA labels for radio button group
- Required fields marked with asterisk (*)
- Error messages displayed with Alert component (accessible via `role="alert"`)
- Date/time pickers have proper labels and required indicators

## Testing

All requirements are covered by comprehensive tests in `OutageSection.test.tsx`:
- Renders Yes/No radio buttons with No selected by default
- Hides pickers when hasOutage is false
- Shows all 4 pickers when hasOutage is true
- Calls callback when radio selection changes
- Clears all outage values when switching from Yes to No
- Does NOT clear values when switching from No to Yes
- Displays validation error when provided
- Does not display error when error prop is undefined

Run tests:
```bash
npm test -- OutageSection.test.tsx
```

## Integration with Form

This component is designed to be used within the `DeploymentForm` component as part of the complete deployment notification form workflow. It updates the following fields of `DeploymentFormData`:
- `hasOutage`
- `outageStartDate`
- `outageStartTime`
- `outageEndDate`
- `outageEndTime`

The parent form should handle validation logic to ensure that outage end date/time is after outage start date/time.

See `OutageSection.example.tsx` for a complete working example with validation.
