/**
 * DeploymentForm Component
 * 
 * Composes all form sections for a single deployment:
 * - ApplicationSelector
 * - DeploymentInfoSection
 * - ScheduleSection (includes outage indicator Yes/No radio button on the right)
 * - ChangeItemsSection
 * - ImpactSection
 * - ContactSection
 * 
 * Always expanded (no collapse functionality)
 * 
 * Requirements: 1.5
 */

import React from 'react';
import {
  Box,
  Stack,
  Divider,
  Typography
} from '@mui/material';
import type { DeploymentFormData, ValidationError } from '../types/models';
import { ApplicationSelector } from './ApplicationSelector';
import { DeploymentInfoSection } from './DeploymentInfoSection';
import { ScheduleSection } from './ScheduleSection';
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
  /** Validation errors for this form */
  validationErrors?: ValidationError[];
  /** Callback to clear validation error for a specific field */
  onClearFieldError?: (field: string) => void;
  /** Callback for onBlur field validation (field, value) */
  onBlurValidate?: (field: string, value: string) => void;
}

/**
 * DeploymentForm component representing a single deployment form instance
 * 
 * Always displayed in expanded state with no collapse functionality (Requirement 1.5)
 * 
 * Displays validation errors:
 * - Summary alert at top of form listing all errors
 * - Individual field errors passed to child components
 * - Highlighted border when form has errors
 * - Clears field errors when user corrects inputs
 */
function DeploymentFormComponent({
  formData,
  formNumber,
  onUpdate,
  validationErrors = [],
  onClearFieldError,
  onBlurValidate
}: DeploymentFormProps) {
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
          border: 1,
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
      {/* Reset and Remove buttons removed per user request */}

      <Divider sx={{ mb: 3 }} />

      {/* Validation Error Summary - Display per-form summary errors */}
      {hasErrors && (
        <Box id={`form-${formData.formId}-errors`}>
          <ValidationErrorSummary errors={validationErrors} formNumber={formNumber} />
        </Box>
      )}

      {/* Form Sections */}
      <Stack spacing={3}>
        {/* Deployment Information Header */}
        <Box component="section" aria-labelledby="deployment-info-heading">
          <Typography variant="h6" gutterBottom id="deployment-info-heading">
            Deployment Information
          </Typography>

          {/* All 4 fields on same row */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'flex-start' }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 25%' } }}>
              <ApplicationSelector
                value={formData.application}
                onChange={(app) => handleFieldUpdate({ application: app }, 'application')}
                error={getFieldError('application')}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 25%' } }}>
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
                onBlurValidate={onBlurValidate}
                environmentOnly={true}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 25%' } }}>
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
                onBlurValidate={onBlurValidate}
                changeNumberOnly={true}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 25%' } }}>
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
                onBlurValidate={onBlurValidate}
                releaseVersionOnly={true}
              />
            </Box>
          </Box>
        </Box>

        {/* Schedule Section */}
        <ScheduleSection
          startDateTime={formData.startDateTime}
          endDateTime={formData.endDateTime}
          onStartDateTimeChange={(value) => {
            const newStartDate = value ?? new Date();
            // When start date changes, sync only the date part of end date while preserving end time
            const syncedEndDate = new Date(formData.endDateTime);
            syncedEndDate.setFullYear(newStartDate.getFullYear());
            syncedEndDate.setMonth(newStartDate.getMonth());
            syncedEndDate.setDate(newStartDate.getDate());
            handleFieldUpdate({ 
              startDateTime: newStartDate,
              endDateTime: syncedEndDate
            }, 'startDateTime');
          }}
          onEndDateTimeChange={(value) => handleFieldUpdate({ endDateTime: value ?? new Date() }, 'endDateTime')}
          startDateTimeError={getFieldError('startDateTime')}
          endDateTimeError={getFieldError('endDateTime')}
          hasOutage={formData.hasOutage}
          onHasOutageChange={(value) => handleFieldUpdate({ hasOutage: value }, 'hasOutage')}
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
          onBlurValidate={onBlurValidate}
        />
      </Stack>
    </Box>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const DeploymentForm = React.memo(DeploymentFormComponent);
