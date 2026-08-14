/**
 * ScheduleSection Component
 * 
 * Provides combined date/time picker controls for deployment schedule:
 * - Deployment Start (DateTimePicker)
 * - Deployment End (DateTimePicker)
 * - Default values: today 20:00, today 22:00
 * - Validates End > Start
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export interface ScheduleSectionProps {
  /** Current deployment start date/time value */
  startDateTime: Date;
  /** Current deployment end date/time value */
  endDateTime: Date;
  /** Callback when deployment start date/time changes */
  onStartDateTimeChange: (value: Date | null) => void;
  /** Callback when deployment end date/time changes */
  onEndDateTimeChange: (value: Date | null) => void;
  /** Validation error for start date/time field */
  startDateTimeError?: string;
  /** Validation error for end date/time field */
  endDateTimeError?: string;
}

/**
 * ScheduleSection component for entering deployment schedule
 * 
 * Performance optimization:
 * - Wrapped with React.memo to prevent re-renders when parent changes (22.2)
 */
function ScheduleSectionComponent({
  startDateTime,
  endDateTime,
  onStartDateTimeChange,
  onEndDateTimeChange,
  startDateTimeError,
  endDateTimeError
}: ScheduleSectionProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mb: 3 }} component="section" aria-labelledby="schedule-heading">
        <Typography variant="h6" gutterBottom id="schedule-heading">
          Deployment Schedule
        </Typography>

        {/* Deployment Start DateTimePicker - Requirements: 4.1, 4.2, 4.3 */}
        <DateTimePicker
          label="Deployment Start *"
          value={startDateTime}
          onChange={onStartDateTimeChange}
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              error: !!startDateTimeError,
              helperText: startDateTimeError || 'Select deployment start date and time',
              sx: { mb: 2 }
            },
            field: {
              'aria-label': 'Deployment start date and time',
              'aria-describedby': 'start-datetime-help',
              'aria-invalid': !!startDateTimeError
            }
          }}
        />
        <span id="start-datetime-help" className="sr-only">
          Select the date and time when the deployment will start. Defaults to today at 20:00.
        </span>

        {/* Deployment End DateTimePicker - Requirements: 4.1, 4.4, 4.6 */}
        <DateTimePicker
          label="Deployment End *"
          value={endDateTime}
          onChange={onEndDateTimeChange}
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              error: !!endDateTimeError,
              helperText: endDateTimeError || 'Must be later than Deployment Start',
              sx: { mb: 2 }
            },
            field: {
              'aria-label': 'Deployment end date and time',
              'aria-describedby': 'end-datetime-help',
              'aria-invalid': !!endDateTimeError
            }
          }}
        />
        <span id="end-datetime-help" className="sr-only">
          Select the date and time when the deployment will end. Defaults to today at 22:00. Must be later than the start.
        </span>
      </Box>
    </LocalizationProvider>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const ScheduleSection = React.memo(ScheduleSectionComponent);
