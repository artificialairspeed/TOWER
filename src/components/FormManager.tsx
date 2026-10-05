/**
 * FormManager Component
 *
 * Presents the single deployment form. The application supports exactly one
 * form, so this component simply renders a header and the form itself.
 *
 * Form state is owned by the parent (App) so a single source of truth drives
 * both editing and output generation.
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DeploymentForm } from './DeploymentForm';
import { darkTokens } from '../theme/AppThemeProvider';
import type { DeploymentFormData, ValidationError } from '../types/models';

export interface FormManagerProps {
  /** The deployment form */
  form: DeploymentFormData;
  /** Update the form */
  onUpdateForm: (updates: Partial<DeploymentFormData>) => void;

  // ----- Validation -----
  /** Validation errors for the form */
  validationErrors?: ValidationError[];
  /** Callback to clear a validation error for a specific form and field */
  onClearFieldError?: (formId: string, field: string) => void;
  /** Callback for onBlur field validation (formId, field, value) */
  onBlurValidate?: (formId: string, field: string, value: string) => void;
}

/**
 * FormManager component
 *
 * Performance optimization:
 * - Wrapped with React.memo to prevent re-renders when parent changes (22.2)
 */
function FormManagerComponent({
  form,
  onUpdateForm,
  validationErrors = [],
  onClearFieldError,
  onBlurValidate,
}: FormManagerProps) {
  const formErrors = validationErrors.filter((error) => error.formId === form.formId);

  return (
    <Box sx={{ width: '100%' }} component="section" aria-labelledby="deployment-form-heading">
      {/* Header */}
      <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, bgcolor: 'background.paper' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography
            id="deployment-form-heading"
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600, color: darkTokens.accent }}
          >
            Flight Planner
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
            Takeoff Notifications for Technology Deployments
          </Typography>
        </Box>
      </Paper>

      {/* The deployment form */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}>
        <DeploymentForm
          formData={form}
          onUpdate={onUpdateForm}
          validationErrors={formErrors}
          onClearFieldError={
            onClearFieldError ? (field) => onClearFieldError(form.formId, field) : undefined
          }
          onBlurValidate={
            onBlurValidate ? (field, value) => onBlurValidate(form.formId, field, value) : undefined
          }
        />
      </Paper>
    </Box>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const FormManager = React.memo(FormManagerComponent);
