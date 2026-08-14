/**
 * DeploymentForm Component
 * 
 * Composes all form sections for a single deployment:
 * - ApplicationSelector
 * - DeploymentInfoSection
 * - DeploymentTitleDisplay
 * - ScheduleSection
 * - OutageSection
 * - ChangeItemsSection
 * - ImpactSection
 * - ContactSection
 * 
 * Includes form-level actions:
 * - Reset button (with confirmation)
 * - Remove button (disabled when single form)
 * 
 * Always expanded (no collapse functionality)
 * 
 * Requirements: 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, RestartAlt as ResetIcon } from '@mui/icons-material';
import type { DeploymentFormData, ValidationError } from '../types/models';
import { useResetConfirmation } from '../hooks/useResetConfirmation';
import { ApplicationSelector } from './ApplicationSelector';
import { DeploymentInfoSection } from './DeploymentInfoSection';
import { DeploymentTitleDisplay } from './DeploymentTitleDisplay';
import { ScheduleSection } from './ScheduleSection';
import { OutageSection } from './OutageSection';
import { ChangeItemsSection } from './ChangeItemsSection';
import { ImpactSection } from './ImpactSection';
import { ContactSection } from './ContactSection';
import { ValidationErrorSummary } from './ValidationErrorSummary';

export interface DeploymentFormProps {
  /** The deployment form data */
  formData: DeploymentFormData;
  /** Form number for display (1-indexed) */
  formNumber: number;
  /** Callback when form data is updated */
  onUpdate: (updates: Partial<DeploymentFormData>) => void;
  /** Callback when form reset is confirmed */
  onReset: () => void;
  /** Callback when form is removed */
  onRemove: () => void;
  /** Whether the remove button should be enabled */
  canRemove: boolean;
  /** Validation errors for this form */
  validationErrors?: ValidationError[];
  /** Callback to clear validation error for a specific field */
  onClearFieldError?: (field: string) => void;
}

/**
 * DeploymentForm component representing a single deployment form instance
 * 
 * Always displayed in expanded state with no collapse functionality (Requirement 1.5)
 * Includes Reset button with confirmation (Requirements 1.9, 1.10, 1.11)
 * Includes Remove button (disabled when single form) (Requirements 1.6, 1.8)
 * 
 * Displays validation errors:
 * - Summary alert at top of form listing all errors
 * - Individual field errors passed to child components
 * - Highlighted border when form has errors
 * - Clears field errors when user corrects inputs
 */
export const DeploymentForm: React.FC<DeploymentFormProps> = ({
  formData,
  formNumber,
  onUpdate,
  onReset,
  onRemove,
  canRemove,
  validationErrors = [],
  onClearFieldError
}) => {
  // Reset confirmation hook - Requirements: 1.9, 1.10, 1.11
  const {
    isOpen: isResetDialogOpen,
    initiateReset,
    confirmReset,
    cancelReset
  } = useResetConfirmation(formData.formId, onReset);

  // Check if form has errors (for highlighting)
  const hasErrors = validationErrors.length > 0;

  /**
   * Get error message for a specific field
   */
  const getFieldError = (field: string): string | undefined => {
    const error = validationErrors.find(err => err.field === field);
    return error?.message;
  };

  /**
   * Handle field update and clear its error
   */
  const handleFieldUpdate = (updates: Partial<DeploymentFormData>, field: string) => {
    onUpdate(updates);
    if (onClearFieldError) {
      onClearFieldError(field);
    }
  };

  return (
    <Box
      sx={{ 
        // Highlight form with errors using red border
        ...(hasErrors && {
          border: 2,
          borderColor: 'error.main',
          borderRadius: 1,
          p: 2
        })
      }}
      component="section"
      aria-labelledby={`form-${formData.formId}-heading`}
      aria-describedby={hasErrors ? `form-${formData.formId}-errors` : undefined}
    >
      {/* Form Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          id={`form-${formData.formId}-heading`}
          sx={hasErrors ? { color: 'error.main' } : undefined}
        >
          Deployment Form {formNumber}
          {hasErrors && ' - Validation Errors'}
        </Typography>

        <Stack direction="row" spacing={1}>
          {/* Reset Button - Requirements: 1.9, 1.10, 1.11 */}
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={initiateReset}
            size="small"
            aria-label="Reset form to default values"
          >
            Reset
          </Button>

          {/* Remove Button - Requirements: 1.6, 1.7, 1.8 */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onRemove}
            disabled={!canRemove}
            size="small"
            aria-label={canRemove ? 'Remove this form' : 'Cannot remove the only form'}
          >
            Remove
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Validation Error Summary - Display per-form summary errors */}
      {hasErrors && (
        <Box id={`form-${formData.formId}-errors`}>
          <ValidationErrorSummary errors={validationErrors} formNumber={formNumber} />
        </Box>
      )}

      {/* Form Sections */}
      <Stack spacing={3}>
        {/* Application Selection */}
        <ApplicationSelector
          value={formData.application}
          onChange={(app) => handleFieldUpdate({ application: app }, 'application')}
        />

        {/* Deployment Information */}
        <DeploymentInfoSection
          changeNumber={formData.changeNumber}
          releaseVersion={formData.releaseVersion}
          environment={formData.environment}
          onChangeNumberChange={(value) => handleFieldUpdate({ changeNumber: value }, 'changeNumber')}
          onReleaseVersionChange={(value) => handleFieldUpdate({ releaseVersion: value }, 'releaseVersion')}
          onEnvironmentChange={(value) => handleFieldUpdate({ environment: value }, 'environment')}
          changeNumberError={getFieldError('changeNumber')}
          releaseVersionError={getFieldError('releaseVersion')}
          environmentError={getFieldError('environment')}
        />

        {/* Deployment Title Display (read-only, computed) */}
        <DeploymentTitleDisplay data={formData} />

        {/* Schedule Section */}
        <ScheduleSection
          deploymentDate={formData.deploymentDate}
          startTime={formData.startTime}
          endTime={formData.endTime}
          onDeploymentDateChange={(value) => handleFieldUpdate({ deploymentDate: value ?? new Date() }, 'deploymentDate')}
          onStartTimeChange={(value) => handleFieldUpdate({ startTime: value ?? new Date() }, 'startTime')}
          onEndTimeChange={(value) => handleFieldUpdate({ endTime: value ?? new Date() }, 'endTime')}
          deploymentDateError={getFieldError('deploymentDate')}
          startTimeError={getFieldError('startTime')}
          endTimeError={getFieldError('endTime')}
          timeOrderError={getFieldError('endTime')?.includes('later than Start Time') ? getFieldError('endTime') : undefined}
        />

        {/* Outage Section */}
        <OutageSection
          hasOutage={formData.hasOutage}
          outageStartDate={formData.outageStartDate}
          outageStartTime={formData.outageStartTime}
          outageEndDate={formData.outageEndDate}
          outageEndTime={formData.outageEndTime}
          onHasOutageChange={(value) => handleFieldUpdate({ hasOutage: value }, 'hasOutage')}
          onOutageStartDateChange={(value) => handleFieldUpdate({ outageStartDate: value }, 'outageStartDate')}
          onOutageStartTimeChange={(value) => handleFieldUpdate({ outageStartTime: value }, 'outageStartTime')}
          onOutageEndDateChange={(value) => handleFieldUpdate({ outageEndDate: value }, 'outageEndDate')}
          onOutageEndTimeChange={(value) => handleFieldUpdate({ outageEndTime: value }, 'outageEndTime')}
        />

        {/* Change Items Section */}
        <ChangeItemsSection
          changeItems={formData.changeItems}
          onChange={(value) => handleFieldUpdate({ changeItems: value }, 'changeItems')}
        />

        {/* Impact Section */}
        <ImpactSection
          impactItems={formData.impactItems}
          onImpactItemsChange={(value) => handleFieldUpdate({ impactItems: value }, 'impactItems')}
        />

        {/* Contact Section */}
        <ContactSection
          contactName={formData.contactName}
          contactEmail={formData.contactEmail}
          contactPhone={formData.contactPhone}
          onContactNameChange={(value) => handleFieldUpdate({ contactName: value }, 'contactName')}
          onContactEmailChange={(value) => handleFieldUpdate({ contactEmail: value }, 'contactEmail')}
          onContactPhoneChange={(value) => handleFieldUpdate({ contactPhone: value }, 'contactPhone')}
          contactNameError={getFieldError('contactName')}
          contactEmailError={getFieldError('contactEmail')}
          contactPhoneError={getFieldError('contactPhone')}
        />
      </Stack>

      {/* Reset Confirmation Dialog - Requirements: 1.9, 1.10, 1.11 */}
      <Dialog
        open={isResetDialogOpen}
        onClose={cancelReset}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <DialogTitle id="reset-dialog-title">
          Reset Deployment Form {formNumber}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            This will clear all entered values and restore the form to its default state.
            This action cannot be undone. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* Cancel button - Requirement 1.11: preserve all values */}
          <Button onClick={cancelReset} color="primary">
            Cancel
          </Button>
          {/* Confirm button - Requirement 1.10: clear all values and restore defaults */}
          <Button onClick={confirmReset} color="error" variant="contained">
            Reset Form
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
