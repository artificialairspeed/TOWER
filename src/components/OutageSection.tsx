/**
 * OutageSection Component
 * 
 * Section for capturing outage indicator and optional outage date/time details.
 * 
 * Requirements:
 * - 5.1: Yes/No outage indicator
 * - 5.2: Default outage indicator to No
 * - 5.3: Conditionally render date/time pickers when Yes selected (2 DateTimePickers)
 * - 5.4: Hide pickers when No selected
 * - 5.5: Clear outage values when switching from Yes to No
 * - 5.6: Show validation error when outage end <= outage start
 */

import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export interface OutageSectionProps {
  /** Whether this deployment has an outage */
  hasOutage: boolean;
  /** Outage start date/time (null if no outage or not set) */
  outageStartDateTime: Date | null;
  /** Outage end date/time (null if no outage or not set) */
  outageEndDateTime: Date | null;
  /** Callback when outage indicator changes */
  onHasOutageChange: (hasOutage: boolean) => void;
  /** Callback when outage start date/time changes */
  onOutageStartDateTimeChange: (dateTime: Date | null) => void;
  /** Callback when outage end date/time changes */
  onOutageEndDateTimeChange: (dateTime: Date | null) => void;
  /** Validation error message (if any) */
  error?: string;
}

/**
 * OutageSection component
 * 
 * Displays a Yes/No radio button for outage indicator.
 * When Yes is selected, displays 2 DateTimePickers for outage start and end.
 * Automatically clears outage values when switching from Yes to No.
 * 
 * Performance optimization:
 * - Wrapped with React.memo to prevent re-renders when parent changes (22.2)
 */
function OutageSectionComponent({
  hasOutage,
  outageStartDateTime,
  outageEndDateTime,
  onHasOutageChange,
  onOutageStartDateTimeChange,
  onOutageEndDateTimeChange,
  error
}: OutageSectionProps) {
  
  // Requirement 5.5: Clear outage values when switching from Yes to No
  const handleOutageIndicatorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHasOutage = event.target.value === 'yes';
    
    if (!newHasOutage) {
      // Clear all outage values when switching to No
      onOutageStartDateTimeChange(null);
      onOutageEndDateTimeChange(null);
    }
    
    onHasOutageChange(newHasOutage);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mb: 3 }} component="section" aria-labelledby="outage-heading">
        <Typography variant="h6" gutterBottom id="outage-heading">
          Outage Information
        </Typography>
        
        {/* Requirement 5.6: Show validation error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-live="polite">
            {error}
          </Alert>
        )}
        
        {/* Requirements 5.1, 5.2: Yes/No outage indicator, default No */}
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend" id="outage-indicator-label">
            Does this deployment include an outage? *
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="outage-indicator-label"
            name="outage-indicator"
            value={hasOutage ? 'yes' : 'no'}
            onChange={handleOutageIndicatorChange}
          >
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          </RadioGroup>
        </FormControl>
        
        {/* Requirements 5.3, 5.4: Conditionally render pickers when Yes selected */}
        {hasOutage && (
          <Box 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            role="group"
            aria-labelledby="outage-window-label"
          >
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }} id="outage-window-label">
              Outage Window
            </Typography>
            
            {/* Outage Start DateTimePicker */}
            <DateTimePicker
              label="Outage Start *"
              value={outageStartDateTime}
              onChange={onOutageStartDateTimeChange}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                },
                field: {
                  'aria-label': 'Outage start date and time',
                  'aria-describedby': 'outage-start-help'
                }
              }}
            />
            <span id="outage-start-help" className="sr-only">
              Select the date and time when the outage will start.
            </span>
            
            {/* Outage End DateTimePicker */}
            <DateTimePicker
              label="Outage End *"
              value={outageEndDateTime}
              onChange={onOutageEndDateTimeChange}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                },
                field: {
                  'aria-label': 'Outage end date and time',
                  'aria-describedby': 'outage-end-help'
                }
              }}
            />
            <span id="outage-end-help" className="sr-only">
              Select the date and time when the outage will end. Must be later than outage start.
            </span>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const OutageSection = React.memo(OutageSectionComponent);
