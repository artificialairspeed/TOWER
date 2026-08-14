/**
 * OutageSection Example Usage
 * 
 * This file demonstrates how to use the OutageSection component
 * with validation logic for outage date/time ordering.
 */

import { useState } from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { OutageSection } from './OutageSection';

export function OutageSectionExample() {
  // Outage state
  const [hasOutage, setHasOutage] = useState(false);
  const [outageStartDateTime, setOutageStartDateTime] = useState<Date | null>(null);
  const [outageEndDateTime, setOutageEndDateTime] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');

  // Validation function
  const validateOutage = () => {
    if (!hasOutage) {
      setError('');
      return true;
    }

    // Check all fields are filled
    if (!outageStartDateTime || !outageEndDateTime) {
      setError('All outage fields are required when outage is indicated');
      return false;
    }

    // Check that end is after start
    if (outageEndDateTime <= outageStartDateTime) {
      setError('Outage end time must be later than outage start time');
      return false;
    }

    setError('');
    return true;
  };

  // Handler to validate on change
  const handleValidationOnChange = () => {
    // Delay validation to allow state to update
    setTimeout(() => validateOutage(), 0);
  };

  const handleSubmit = () => {
    if (validateOutage()) {
      alert('Validation passed! Outage information is valid.');
      console.log({
        hasOutage,
        outageStartDateTime,
        outageEndDateTime
      });
    }
  };

  const handleReset = () => {
    setHasOutage(false);
    setOutageStartDateTime(null);
    setOutageEndDateTime(null);
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        OutageSection Component Example
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Usage with Validation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Try selecting "Yes" and entering outage details. The validation will
          ensure that the outage end time is later than the start time.
        </Typography>
        
        <OutageSection
          hasOutage={hasOutage}
          outageStartDateTime={outageStartDateTime}
          outageEndDateTime={outageEndDateTime}
          onHasOutageChange={(value) => {
            setHasOutage(value);
            handleValidationOnChange();
          }}
          onOutageStartDateTimeChange={(dateTime) => {
            setOutageStartDateTime(dateTime);
            handleValidationOnChange();
          }}
          onOutageEndDateTimeChange={(dateTime) => {
            setOutageEndDateTime(dateTime);
            handleValidationOnChange();
          }}
          error={error}
        />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleSubmit}>
            Validate & Submit
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current State
        </Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          <pre>
            {JSON.stringify(
              {
                hasOutage,
                outageStartDateTime: outageStartDateTime?.toISOString() || null,
                outageEndDateTime: outageEndDateTime?.toISOString() || null,
                error: error || null
              },
              null,
              2
            )}
          </pre>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Expected Behavior
        </Typography>
        <ul>
          <li>
            <strong>Default:</strong> Radio button "No" is selected, date/time pickers are hidden
          </li>
          <li>
            <strong>Select "Yes":</strong> Two DateTimePickers appear (Outage Start, Outage End)
          </li>
          <li>
            <strong>Select "No":</strong> All outage values are cleared and pickers are hidden
          </li>
          <li>
            <strong>Validation:</strong> When outage end is before or equal to start, an error is displayed
          </li>
          <li>
            <strong>Required Fields:</strong> Both date/time fields are marked as required when outage is indicated
          </li>
        </ul>
      </Paper>
    </Container>
  );
}
