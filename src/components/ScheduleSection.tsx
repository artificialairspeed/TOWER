/**
 * ScheduleSection Component
 * 
 * Provides date and time picker controls for deployment schedule:
 * - Deployment Date (picker-only, reject keyboard input)
 * - Start Time (picker-only, reject keyboard input)
 * - End Time (picker-only, reject keyboard input)
 * - Default values: today, 20:00, 22:00
 * - Validates End Time > Start Time
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

export interface ScheduleSectionProps {
  /** Current deployment date value */
  deploymentDate: Date;
  /** Current start time value */
  startTime: Date;
  /** Current end time value */
  endTime: Date;
  /** Callback when deployment date changes */
  onDeploymentDateChange: (value: Date | null) => void;
  /** Callback when start time changes */
  onStartTimeChange: (value: Date | null) => void;
  /** Callback when end time changes */
  onEndTimeChange: (value: Date | null) => void;
  /** Validation error for deployment date field */
  deploymentDateError?: string;
  /** Validation error for start time field */
  startTimeError?: string;
  /** Validation error for end time field */
  endTimeError?: string;
  /** Validation error for time ordering (End Time <= Start Time) */
  timeOrderError?: string;
}

/**
 * ScheduleSection component for entering deployment schedule
 */
export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  deploymentDate,
  startTime,
  endTime,
  onDeploymentDateChange,
  onStartTimeChange,
  onEndTimeChange,
  deploymentDateError,
  startTimeError,
  endTimeError,
  timeOrderError
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mb: 3 }} component="section" aria-labelledby="schedule-heading">
        <Typography variant="h6" gutterBottom id="schedule-heading">
          Deployment Schedule
        </Typography>

        {/* Deployment Date Picker - Requirements: 4.1, 4.2 */}
        <DatePicker
          label="Deployment Date *"
          value={deploymentDate}
          onChange={onDeploymentDateChange}
          readOnly
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              error: !!deploymentDateError,
              helperText: deploymentDateError || 'Select deployment date',
              sx: { mb: 2 }
            },
            field: {
              'aria-label': 'Deployment date',
              'aria-describedby': 'deployment-date-help',
              'aria-invalid': !!deploymentDateError
            }
          }}
        />
        <span id="deployment-date-help" className="sr-only">
          Select the date when the deployment will occur. Use the date picker to choose a date.
        </span>

        {/* Start Time Picker - Requirements: 4.1, 4.3 */}
        <TimePicker
          label="Start Time *"
          value={startTime}
          onChange={onStartTimeChange}
          readOnly
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              error: !!startTimeError || !!timeOrderError,
              helperText: startTimeError || timeOrderError || 'Default 20:00 (8:00 PM)',
              sx: { mb: 2 }
            },
            field: {
              'aria-label': 'Deployment start time',
              'aria-describedby': 'start-time-help',
              'aria-invalid': !!(startTimeError || timeOrderError)
            }
          }}
        />
        <span id="start-time-help" className="sr-only">
          Select the time when the deployment will start. Defaults to 8:00 PM. Use the time picker to choose a time.
        </span>

        {/* End Time Picker - Requirements: 4.1, 4.4, 4.6 */}
        <TimePicker
          label="End Time *"
          value={endTime}
          onChange={onEndTimeChange}
          readOnly
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              error: !!endTimeError || !!timeOrderError,
              helperText: endTimeError || timeOrderError || 'Default 22:00 (10:00 PM). Must be later than Start Time.',
              sx: { mb: 2 }
            },
            field: {
              'aria-label': 'Deployment end time',
              'aria-describedby': 'end-time-help',
              'aria-invalid': !!(endTimeError || timeOrderError)
            }
          }}
        />
        <span id="end-time-help" className="sr-only">
          Select the time when the deployment will end. Defaults to 10:00 PM. Must be later than the start time. Use the time picker to choose a time.
        </span>
      </Box>
    </LocalizationProvider>
  );
};
