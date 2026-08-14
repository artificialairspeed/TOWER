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
 * 
 * Performance optimization:
 * - Wrapped with React.memo to prevent re-renders when parent changes (22.2)
 */
function ValidationErrorSummaryComponent({
  errors,
  formNumber
}: ValidationErrorSummaryProps) {
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
      // Parse the field to extract item index and sub-field
      const match = field.match(/(\w+)\[(\d+)\]\.(\w+)/);
      if (match) {
        const [, arrayName, , subField] = match;
        
        // Map array field names to user-friendly labels
        const arrayLabels: Record<string, string> = {
          changeItems: 'Change Item',
          impactItems: 'Impact Item'
        };
        
        // Map sub-field names to labels
        const subFieldLabels: Record<string, string> = {
          jiraNumber: 'Jira Number',
          description: 'Title/Description',
          text: 'Text'
        };
        
        const arrayLabel = arrayName ? (arrayLabels[arrayName] || arrayName) : 'Item';
        const subFieldLabel = subField ? (subFieldLabels[subField] || subField) : 'Field';
        
        return `${arrayLabel}: ${subFieldLabel}`;
      }
      return field; // Return as-is if parsing fails
    }

    // Map field names to user-friendly labels
    const fieldLabels: Record<string, string> = {
      application: 'Application',
      changeNumber: 'Change Number',
      releaseVersion: 'Release Version',
      environment: 'Environment',
      startDateTime: 'Deployment Start',
      endDateTime: 'Deployment End',
      changeItems: 'Change Items',
      impactItems: 'Impact Items',
      contactName: 'Contact Name',
      contactEmail: 'Email',
      contactPhone: 'Phone'
    };

    return fieldLabels[field] || field;
  };

  /**
   * Format error message to be more user-friendly
   */
  const formatErrorMessage = (message: string): string => {
    // Remove '#' symbols from message
    const cleanMessage = message.replace(/#/g, '');
    
    // Handle "is required" or "Please select" messages
    if (cleanMessage.includes('is required') || cleanMessage.includes('Please select')) {
      return 'This field is required';
    }
    
    // Return cleaned message as-is if it doesn't match known patterns
    return cleanMessage;
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
        <List disablePadding sx={{ listStyleType: 'disc', ml: 2 }}>
          {errors.map((error, index) => (
            <ListItem 
              key={`${error.field}-${index}`}
              disablePadding
              sx={{ display: 'list-item', py: 0.75 }}
            >
              <Typography variant="body2">
                <strong>{getFieldLabel(error.field)}:</strong> {formatErrorMessage(error.message)}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Box>
    </Alert>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const ValidationErrorSummary = React.memo(ValidationErrorSummaryComponent);
