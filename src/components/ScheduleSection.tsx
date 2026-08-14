/**
 * ScheduleSection Component
 * 
 * Provides combined date/time picker controls for deployment schedule:
 * - Deployment Start (DateTimePicker)
 * - Deployment End (DateTimePicker)
 * - Default values: tomorrow 20:00, tomorrow 22:00
 * - Validates End > Start
 * - Outage indicator (Yes/No radio button)
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 5.1, 5.2
 */

import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip
} from '@mui/material';
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
  /** Whether this deployment has an outage */
  hasOutage: boolean;
  /** Callback when outage indicator changes */
  onHasOutageChange: (hasOutage: boolean) => void;
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
  endDateTimeError,
  hasOutage,
  onHasOutageChange
}: ScheduleSectionProps) {
  const handleOutageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHasOutage = event.target.value === 'yes';
    onHasOutageChange(newHasOutage);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mb: 3 }} component="section" aria-labelledby="schedule-heading">
        <Typography variant="h6" gutterBottom id="schedule-heading">
          Deployment Schedule
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
          {/* Deployment Start DateTimePicker - Requirements: 4.1, 4.2, 4.3 */}
          <Box sx={{ flex: 1 }}>
            <DateTimePicker
              label="Deployment Start *"
              value={startDateTime}
              onChange={onStartDateTimeChange}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!startDateTimeError
                },
                field: {
                  'aria-label': 'Deployment start date and time',
                  'aria-describedby': 'start-datetime-help',
                  'aria-invalid': !!startDateTimeError
                },
                layout: {
                  sx: {
                    '& .MuiInputLabel-root': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                      '&.Mui-focused, &.MuiFormLabel-filled': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }
                  }
                }
              }}
            />
            <span id="start-datetime-help" className="sr-only">
              Select the date and time when the deployment will start. Defaults to tomorrow at 20:00.
            </span>
          </Box>

          {/* Deployment End DateTimePicker - Requirements: 4.1, 4.4, 4.6 */}
          <Box sx={{ flex: 1 }}>
            <DateTimePicker
              label="Deployment End *"
              value={endDateTime}
              onChange={onEndDateTimeChange}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!endDateTimeError
                },
                field: {
                  'aria-label': 'Deployment end date and time',
                  'aria-describedby': 'end-datetime-help',
                  'aria-invalid': !!endDateTimeError
                },
                layout: {
                  sx: {
                    '& .MuiInputLabel-root': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                      '&.Mui-focused, &.MuiFormLabel-filled': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }
                  }
                }
              }}
            />
            <span id="end-datetime-help" className="sr-only">
              Select the date and time when the deployment will end. Defaults to tomorrow at 22:00. Must be later than the start.
            </span>
          </Box>

          {/* Outage Radio Buttons - Prominent, on right side - Requirements: 5.1, 5.2 */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1, pl: 4 }}>
            <Chip
              label="Outage Associated"
              sx={{
                backgroundColor: 'error.main',
                color: 'error.contrastText',
                fontWeight: 600,
                fontSize: '0.875rem',
                height: '32px'
              }}
            />
            <FormControl size="small" component="fieldset">
              <RadioGroup
                row
                aria-label="Outage selector"
                name="outage-selector"
                value={hasOutage ? 'yes' : 'no'}
                onChange={handleOutageChange}
                sx={{ gap: 1 }}
              >
                <FormControlLabel 
                  value="no" 
                  control={<Radio size="small" />} 
                  label="No"
                  sx={{ m: 0 }}
                />
                <FormControlLabel 
                  value="yes" 
                  control={<Radio size="small" />} 
                  label="Yes"
                  sx={{ m: 0 }}
                />
              </RadioGroup>
            </FormControl>
            <span id="outage-help" className="sr-only">
              Select Yes if this deployment includes an outage window, otherwise select No.
            </span>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const ScheduleSection = React.memo(ScheduleSectionComponent);
