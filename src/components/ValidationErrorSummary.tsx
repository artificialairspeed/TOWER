/**
 * ValidationErrorSummary Component
 * 
 * Displays a summary of validation errors for a deployment form.
 * 
 * Shows all validation errors in an alert box at the top of the form.
 * Only displayed when the form has validation errors.
 * 
 * Requirements: Display per-form summary errors
 */

import React from 'react';
import { Alert, AlertTitle, Box, List, ListItem, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import type { ValidationError } from '../types/models';

export interface ValidationErrorSummaryProps {
  /** Array of validation errors for this form */
  errors: ValidationError[];
  /** Form number for display (1-indexed) */
  formNumber: number;
}

/**
 * ValidationErrorSummary component for displaying form-level error summary
 * 
 * Displays all validation errors in a prominent alert box.
 * Groups errors by section for better readability.
 */
export const ValidationErrorSummary: React.FC<ValidationErrorSummaryProps> = ({
  errors,
  formNumber
}) => {
  // Don't render if no errors
  if (errors.length === 0) {
    return null;
  }

  /**
   * Get a user-friendly field label for display
   */
  const getFieldLabel = (field: string): string => {
    // Handle array fields (e.g., "changeItems[0].jiraNumber")
    if (field.includes('[')) {
      return field; // Already formatted in validation message
    }

    // Map field names to user-friendly labels
    const fieldLabels: Record<string, string> = {
      application: 'Application',
      changeNumber: 'Change Number',
      releaseVersion: 'Release Version',
      environment: 'Environment',
      deploymentDate: 'Deployment Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      outageStartDate: 'Outage Start Date',
      outageStartTime: 'Outage Start Time',
      outageEndDate: 'Outage End Date',
      outageEndTime: 'Outage End Time',
      changeItems: 'Change Items',
      impactItems: 'Impact Items',
      contactName: 'Contact Name',
      contactEmail: 'Email',
      contactPhone: 'Phone'
    };

    return fieldLabels[field] || field;
  };

  return (
    <Alert 
      severity="error" 
      icon={<ErrorIcon />}
      sx={{ mb: 3 }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <AlertTitle sx={{ fontWeight: 'bold' }}>
        Validation Errors in Deployment Form {formNumber}
      </AlertTitle>
      
      <Typography variant="body2" sx={{ mb: 1 }}>
        Please correct the following {errors.length} {errors.length === 1 ? 'error' : 'errors'} before generating outputs:
      </Typography>

      <Box sx={{ pl: 2 }}>
        <List dense disablePadding>
          {errors.map((error, index) => (
            <ListItem 
              key={`${error.field}-${index}`}
              disablePadding
              sx={{ display: 'list-item', listStyleType: 'disc', ml: 2 }}
            >
              <Typography variant="body2">
                <strong>{getFieldLabel(error.field)}:</strong> {error.message}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Box>
    </Alert>
  );
};
