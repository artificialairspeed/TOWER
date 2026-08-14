/**
 * OutageSection Component
 * 
 * Section for capturing outage indicator and optional outage date/time details.
 * 
 * Requirements:
 * - 5.1: Yes/No outage indicator
 * - 5.2: Default outage indicator to No
 * - 5.3: Conditionally render date/time pickers when Yes selected (4 pickers total)
 * - 5.4: Hide pickers when No selected
 * - 5.5: Clear outage values when switching from Yes to No
 * - 5.6: Show validation error when outage end <= outage start
 */

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
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export interface OutageSectionProps {
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

/**
 * OutageSection component
 * 
 * Displays a Yes/No radio button for outage indicator.
 * When Yes is selected, displays 4 date/time pickers for outage start and end.
 * Automatically clears outage values when switching from Yes to No.
 */
export function OutageSection({
  hasOutage,
  outageStartDate,
  outageStartTime,
  outageEndDate,
  outageEndTime,
  onHasOutageChange,
  onOutageStartDateChange,
  onOutageStartTimeChange,
  onOutageEndDateChange,
  onOutageEndTimeChange,
  error
}: OutageSectionProps) {
  
  // Requirement 5.5: Clear outage values when switching from Yes to No
  const handleOutageIndicatorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHasOutage = event.target.value === 'yes';
    
    if (!newHasOutage) {
      // Clear all outage values when switching to No
      onOutageStartDateChange(null);
      onOutageStartTimeChange(null);
      onOutageEndDateChange(null);
      onOutageEndTimeChange(null);
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
            
            {/* Outage Start Date and Time */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
                <DatePicker
                  label="Outage Start Date *"
                  value={outageStartDate}
                  onChange={onOutageStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    },
                    field: {
                      'aria-label': 'Outage start date',
                      'aria-describedby': 'outage-start-date-help'
                    }
                  }}
                />
                <span id="outage-start-date-help" className="sr-only">
                  Select the date when the outage will start. Use the date picker to choose a date.
                </span>
              </Box>
              <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
                <TimePicker
                  label="Outage Start Time *"
                  value={outageStartTime}
                  onChange={onOutageStartTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    },
                    field: {
                      'aria-label': 'Outage start time',
                      'aria-describedby': 'outage-start-time-help'
                    }
                  }}
                />
                <span id="outage-start-time-help" className="sr-only">
                  Select the time when the outage will start. Use the time picker to choose a time.
                </span>
              </Box>
            </Box>
            
            {/* Outage End Date and Time */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
                <DatePicker
                  label="Outage End Date *"
                  value={outageEndDate}
                  onChange={onOutageEndDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    },
                    field: {
                      'aria-label': 'Outage end date',
                      'aria-describedby': 'outage-end-date-help'
                    }
                  }}
                />
                <span id="outage-end-date-help" className="sr-only">
                  Select the date when the outage will end. Use the date picker to choose a date.
                </span>
              </Box>
              <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
                <TimePicker
                  label="Outage End Time *"
                  value={outageEndTime}
                  onChange={onOutageEndTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    },
                    field: {
                      'aria-label': 'Outage end time',
                      'aria-describedby': 'outage-end-time-help'
                    }
                  }}
                />
                <span id="outage-end-time-help" className="sr-only">
                  Select the time when the outage will end. Must be later than outage start. Use the time picker to choose a time.
                </span>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}
