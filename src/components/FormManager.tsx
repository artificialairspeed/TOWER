/**
 * FormManager Component
 *
 * Manages the presentation of deployment form instances as an expandable queue:
 * - Displays every form as a collapsible DeploymentQueueRow
 * - Add Form control (disabled at 5 forms)
 * - Generate Outputs control
 * - Auto-expands the newest form for immediate editing
 *
 * Form state can be provided by a parent (preferred, so a single source of
 * truth drives both editing and output generation). When no state is provided,
 * the component falls back to its own internal `useFormManager` instance, which
 * keeps it usable in isolation (e.g. unit tests / storybook).
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useFormManager } from '../hooks/useFormManager';
import { DeploymentQueueRow } from './DeploymentQueueRow';
import type { DeploymentFormData, ValidationError } from '../types/models';

export interface FormManagerProps {
  /** Maximum number of forms allowed (default: 5) */
  maxForms?: number;

  // ----- Lifted form state (all optional; falls back to internal hook) -----
  /** All deployment forms */
  forms?: DeploymentFormData[];
  /** ID of the newest form, used to auto-expand it */
  lastAddedFormId?: string | null;
  /** Add a new form */
  onAddForm?: () => void;
  /** Remove a form by id */
  onRemoveForm?: (formId: string) => void;
  /** Update a form by id */
  onUpdateForm?: (formId: string, updates: Partial<DeploymentFormData>) => void;
  /** Whether adding a form is allowed */
  canAddForm?: boolean;
  /** Whether removing a form is allowed */
  canRemoveForm?: boolean;

  // ----- Validation -----
  /** Validation errors for all forms */
  validationErrors?: ValidationError[];
  /** Callback to clear a validation error for a specific form and field */
  onClearFieldError?: (formId: string, field: string) => void;
  /** Callback for onBlur field validation (formId, field, value) */
  onBlurValidate?: (formId: string, field: string, value: string) => void;

  // ----- Output generation -----
  /** Whether output generation is in progress (drives the progress indicator) */
  isGenerating?: boolean;
  /** Progress information for multi-form generation */
  progress?: { current: number; total: number } | null;
}

const DEFAULT_MAX_FORMS = 5;

/**
 * FormManager component
 * 
 * Performance optimization:
 * - Wrapped with React.memo to prevent re-renders when parent changes (22.2)
 */
function FormManagerComponent({
  maxForms = DEFAULT_MAX_FORMS,
  forms: formsProp,
  lastAddedFormId: lastAddedFormIdProp,
  onAddForm,
  onRemoveForm,
  onUpdateForm,
  canAddForm: canAddFormProp,
  canRemoveForm: canRemoveFormProp,
  validationErrors = [],
  onClearFieldError,
  onBlurValidate,
  isGenerating = false,
  progress,
}: FormManagerProps) {
  // Internal fallback state for standalone usage. When the parent lifts state
  // and passes it via props, these internal values are simply overridden below.
  const internal = useFormManager();

  const forms = formsProp ?? internal.forms;
  const lastAddedFormId = lastAddedFormIdProp ?? internal.lastAddedFormId;
  const addForm = onAddForm ?? internal.addForm;
  const removeForm = onRemoveForm ?? internal.removeForm;
  const updateForm = onUpdateForm ?? internal.updateForm;
  const canAddForm = canAddFormProp ?? internal.canAddForm;
  const canRemoveForm = canRemoveFormProp ?? internal.canRemoveForm;

  const getFormErrors = (formId: string): ValidationError[] =>
    validationErrors.filter((error) => error.formId === formId);

  return (
    <Box sx={{ width: '100%' }} component="section" aria-labelledby="deployment-forms-heading">
      {/* ARIA live region announcing form add/remove actions */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {forms.length} deployment {forms.length === 1 ? 'form' : 'forms'} currently active
      </div>

      {/* Queue Header */}
      <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, bgcolor: 'background.paper' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography id="deployment-forms-heading" variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Deployment Forms
            </Typography>
            <Chip
              label={`${forms.length} of ${maxForms}`}
              size="small"
              color="primary"
              variant="outlined"
              aria-hidden="true"
            />
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
              justifyContent: { xs: 'flex-end', sm: 'flex-start' },
            }}
          >
            {/* Add Form - Requirements: 1.2, 1.4 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addForm}
                disabled={!canAddForm}
                aria-label={canAddForm ? 'Add new deployment form' : 'Maximum of 5 forms reached'}
                data-testid="add-form-button"
              >
                Add Form
              </Button>
              {!canAddForm && (
                <Typography variant="caption" color="text.secondary" role="status">
                  Maximum of {maxForms} forms
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Progress indicator for multi-form generation */}
        {isGenerating && progress && progress.total > 3 && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Generating artifacts...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress.current} / {progress.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(progress.current / progress.total) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
      </Paper>

      {/* Deployment forms as queue rows */}
      <Stack spacing={2}>
        {forms.map((formData, index) => (
          <DeploymentQueueRow
            key={formData.formId}
            formData={formData}
            position={index + 1}
            defaultExpanded={formData.formId === lastAddedFormId}
            onUpdate={(updates) => updateForm(formData.formId, updates)}
            onRemove={() => removeForm(formData.formId)}
            canRemove={canRemoveForm}
            validationErrors={getFormErrors(formData.formId)}
            onClearFieldError={
              onClearFieldError ? (field) => onClearFieldError(formData.formId, field) : undefined
            }
            onBlurValidate={
              onBlurValidate ? (field, value) => onBlurValidate(formData.formId, field, value) : undefined
            }
          />
        ))}
      </Stack>
    </Box>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const FormManager = React.memo(FormManagerComponent);
