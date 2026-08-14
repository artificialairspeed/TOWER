/**
 * Example usage of useResetConfirmation with useFormManager
 * 
 * This file demonstrates how the reset confirmation logic integrates
 * with the form manager to provide a complete reset workflow.
 */

import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Typography,
} from '@mui/material';
import { useFormManager } from './useFormManager';
import { useResetConfirmation } from './useResetConfirmation';
import type { DeploymentFormData } from '../types/models';

/**
 * Example component showing a single deployment form with reset functionality
 */
function DeploymentFormCard({ form }: { form: DeploymentFormData }) {
  const { resetForm } = useFormManager();
  
  // Hook manages the confirmation dialog state
  // Requirements: 1.9, 1.10, 1.11
  const { isOpen, initiateReset, confirmReset, cancelReset } = useResetConfirmation(
    form.formId,
    () => resetForm(form.formId) // Reset form on confirm
  );

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">
          Deployment Form: {form.formId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Application: {form.application?.name || 'Not selected'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Change Number: {form.changeNumber || 'Not entered'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Environment: {form.environment || 'Not selected'}
        </Typography>
      </CardContent>
      
      <CardActions>
        {/* Requirement 1.9: Display confirmation prompt before clearing values */}
        <Button onClick={initiateReset} color="warning">
          Reset Form
        </Button>
      </CardActions>
      
      {/* Confirmation Dialog */}
      <Dialog open={isOpen} onClose={cancelReset}>
        <DialogTitle>Reset Deployment Form?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset this deployment form? 
            All entered values will be cleared and restored to their default values.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* Requirement 1.11: On cancel, close dialog and preserve all values */}
          <Button onClick={cancelReset}>
            Cancel
          </Button>
          {/* Requirement 1.10: On confirm, call onConfirm and restore default values */}
          <Button onClick={confirmReset} color="warning" variant="contained">
            Reset Form
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

/**
 * Example component showing the complete form manager with reset functionality
 */
export function DeploymentFormsExample() {
  const { forms, addForm, canAddForm } = useFormManager();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Deployment Forms
      </Typography>
      
      {forms.map(form => (
        <DeploymentFormCard key={form.formId} form={form} />
      ))}
      
      <Button
        onClick={addForm}
        disabled={!canAddForm}
        variant="contained"
        sx={{ mt: 2 }}
      >
        Add Form
      </Button>
    </div>
  );
}
