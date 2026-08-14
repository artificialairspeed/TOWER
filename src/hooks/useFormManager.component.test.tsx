/**
 * Component tests for form lifecycle using useFormManager and useResetConfirmation
 * 
 * Tests the complete form lifecycle from a component perspective:
 * - Initial state: one form present
 * - Add form: creates new form, preserves existing values, disabled at 5 forms
 * - Remove form: deletes form, preserves others, disabled at 1 form
 * - Reset flow: shows confirmation, clears on confirm, preserves on cancel
 * 
 * Requirements: 1.1-1.11
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useFormManager } from './useFormManager';
import { useResetConfirmation } from './useResetConfirmation';
import type { DeploymentFormData } from '../types/models';

/**
 * Test component that mimics the form lifecycle behavior
 * Uses both useFormManager and useResetConfirmation hooks
 */
function TestFormManager() {
  const {
    forms,
    addForm,
    removeForm,
    updateForm,
    resetForm,
    canAddForm,
    canRemoveForm
  } = useFormManager();

  // Track which form's reset confirmation is open
  const [resetFormId, setResetFormId] = useState<string | null>(null);

  // Create reset confirmation hook for the selected form
  const { isOpen, initiateReset, confirmReset, cancelReset } = useResetConfirmation(
    resetFormId || '',
    () => {
      if (resetFormId) {
        resetForm(resetFormId);
        setResetFormId(null);
      }
    }
  );

  const handleInitiateReset = (formId: string) => {
    setResetFormId(formId);
    initiateReset();
  };

  return (
    <div>
      <Typography variant="h5">Form Manager Test Component</Typography>
      
      {/* Form count indicator */}
      <Typography data-testid="form-count">
        Forms: {forms.length}
      </Typography>
      
      {/* Add Form button */}
      <Button
        data-testid="add-form-button"
        onClick={addForm}
        disabled={!canAddForm}
      >
        Add Form {canAddForm ? '' : '(Disabled)'}
      </Button>
      
      {/* Render all forms */}
      {forms.map((form: DeploymentFormData, index: number) => (
        <div key={form.formId} data-testid={`form-${index}`}>
          <Typography variant="h6">Form {index + 1}</Typography>
          
          {/* Change Number field */}
          <TextField
            label="Change Number"
            value={form.changeNumber}
            onChange={(e) => updateForm(form.formId, { changeNumber: e.target.value })}
            slotProps={{
              input: {
                'data-testid': `change-number-${index}`,
              } as any
            }}
          />
          
          {/* Release Version field */}
          <TextField
            label="Release Version"
            value={form.releaseVersion}
            onChange={(e) => updateForm(form.formId, { releaseVersion: e.target.value })}
            slotProps={{
              input: {
                'data-testid': `release-version-${index}`,
              } as any
            }}
          />
          
          {/* Remove button */}
          <Button
            data-testid={`remove-form-${index}`}
            onClick={() => removeForm(form.formId)}
            disabled={!canRemoveForm}
          >
            Remove {canRemoveForm ? '' : '(Disabled)'}
          </Button>
          
          {/* Reset button */}
          <Button
            data-testid={`reset-form-${index}`}
            onClick={() => handleInitiateReset(form.formId)}
          >
            Reset
          </Button>
        </div>
      ))}
      
      {/* Reset confirmation dialog */}
      {isOpen && (
        <div data-testid="reset-dialog" role="dialog">
          <Typography>Are you sure you want to reset this form?</Typography>
          <Button
            data-testid="confirm-reset"
            onClick={confirmReset}
          >
            Confirm
          </Button>
          <Button
            data-testid="cancel-reset"
            onClick={cancelReset}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

describe('Form Lifecycle Component Tests', () => {
  describe('Initial state (Requirement 1.1)', () => {
    it('should display exactly one form on initial render', () => {
      render(<TestFormManager />);
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 1');
      expect(screen.getByTestId('form-0')).toBeInTheDocument();
      expect(screen.queryByTestId('form-1')).not.toBeInTheDocument();
    });

    it('should have Add Form button enabled initially', () => {
      render(<TestFormManager />);
      
      const addButton = screen.getByTestId('add-form-button');
      expect(addButton).toBeEnabled();
      expect(addButton).not.toHaveTextContent('(Disabled)');
    });

    it('should have Remove button disabled initially (only 1 form)', () => {
      render(<TestFormManager />);
      
      const removeButton = screen.getByTestId('remove-form-0');
      expect(removeButton).toBeDisabled();
      expect(removeButton).toHaveTextContent('(Disabled)');
    });
  });

  describe('Add form (Requirements 1.2, 1.3, 1.4)', () => {
    it('should create a new form when Add Form is clicked', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 1');
      
      await user.click(screen.getByTestId('add-form-button'));
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 2');
      expect(screen.getByTestId('form-0')).toBeInTheDocument();
      expect(screen.getByTestId('form-1')).toBeInTheDocument();
    });

    it('should preserve existing form values when adding new form (Requirement 1.3)', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Fill first form with data
      const changeNumberInput = screen.getByTestId('change-number-0');
      const releaseVersionInput = screen.getByTestId('release-version-0');
      
      await user.type(changeNumberInput, 'CHG12345');
      await user.type(releaseVersionInput, 'v1.0.0');
      
      expect(changeNumberInput).toHaveValue('CHG12345');
      expect(releaseVersionInput).toHaveValue('v1.0.0');
      
      // Add a second form
      await user.click(screen.getByTestId('add-form-button'));
      
      // First form values should be preserved
      expect(screen.getByTestId('change-number-0')).toHaveValue('CHG12345');
      expect(screen.getByTestId('release-version-0')).toHaveValue('v1.0.0');
      
      // Second form should have empty values
      expect(screen.getByTestId('change-number-1')).toHaveValue('');
      expect(screen.getByTestId('release-version-1')).toHaveValue('');
    });

    it('should enable Remove button when more than one form exists', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Initially disabled
      expect(screen.getByTestId('remove-form-0')).toBeDisabled();
      
      // Add second form
      await user.click(screen.getByTestId('add-form-button'));
      
      // Remove buttons should now be enabled
      expect(screen.getByTestId('remove-form-0')).toBeEnabled();
      expect(screen.getByTestId('remove-form-1')).toBeEnabled();
    });

    it('should allow adding up to 5 forms', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      const addButton = screen.getByTestId('add-form-button');
      
      // Add 4 more forms (already have 1)
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 5');
      expect(screen.getByTestId('form-0')).toBeInTheDocument();
      expect(screen.getByTestId('form-1')).toBeInTheDocument();
      expect(screen.getByTestId('form-2')).toBeInTheDocument();
      expect(screen.getByTestId('form-3')).toBeInTheDocument();
      expect(screen.getByTestId('form-4')).toBeInTheDocument();
    });

    it('should disable Add Form button when 5 forms exist (Requirement 1.4)', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      const addButton = screen.getByTestId('add-form-button');
      expect(addButton).toBeEnabled();
      
      // Add 4 more forms to reach maximum of 5
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      
      // Add button should now be disabled
      expect(addButton).toBeDisabled();
      expect(addButton).toHaveTextContent('(Disabled)');
    });

    it('should reject further additions when 5 forms exist', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      const addButton = screen.getByTestId('add-form-button');
      
      // Add 4 more forms to reach maximum
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 5');
      
      // Attempt to add 6th form (button is disabled, but test the behavior)
      // The click won't do anything because button is disabled
      expect(addButton).toBeDisabled();
      
      // Form count should remain 5
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 5');
    });
  });

  describe('Remove form (Requirements 1.6, 1.7, 1.8)', () => {
    it('should delete a form when Remove is clicked', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Add a second form
      await user.click(screen.getByTestId('add-form-button'));
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 2');
      
      // Remove the second form
      await user.click(screen.getByTestId('remove-form-1'));
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 1');
      expect(screen.getByTestId('form-0')).toBeInTheDocument();
      expect(screen.queryByTestId('form-1')).not.toBeInTheDocument();
    });

    it('should preserve other forms\' values when removing a form (Requirement 1.7)', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Add two more forms
      await user.click(screen.getByTestId('add-form-button'));
      await user.click(screen.getByTestId('add-form-button'));
      
      // Fill all three forms with distinct data
      await user.type(screen.getByTestId('change-number-0'), 'CHG001');
      await user.type(screen.getByTestId('change-number-1'), 'CHG002');
      await user.type(screen.getByTestId('change-number-2'), 'CHG003');
      
      await user.type(screen.getByTestId('release-version-0'), 'v1.0.0');
      await user.type(screen.getByTestId('release-version-1'), 'v2.0.0');
      await user.type(screen.getByTestId('release-version-2'), 'v3.0.0');
      
      // Remove the middle form
      await user.click(screen.getByTestId('remove-form-1'));
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 2');
      
      // First and third forms should retain their values
      expect(screen.getByTestId('change-number-0')).toHaveValue('CHG001');
      expect(screen.getByTestId('release-version-0')).toHaveValue('v1.0.0');
      
      expect(screen.getByTestId('change-number-1')).toHaveValue('CHG003');
      expect(screen.getByTestId('release-version-1')).toHaveValue('v3.0.0');
    });

    it('should disable Remove button when only 1 form remains (Requirement 1.8)', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Add a second form
      await user.click(screen.getByTestId('add-form-button'));
      expect(screen.getByTestId('remove-form-0')).toBeEnabled();
      
      // Remove the second form
      await user.click(screen.getByTestId('remove-form-1'));
      
      // Remove button should now be disabled
      expect(screen.getByTestId('remove-form-0')).toBeDisabled();
      expect(screen.getByTestId('remove-form-0')).toHaveTextContent('(Disabled)');
    });

    it('should reject removal when only 1 form exists (Requirement 1.8)', async () => {
      render(<TestFormManager />);
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 1');
      
      // Remove button should be disabled
      const removeButton = screen.getByTestId('remove-form-0');
      expect(removeButton).toBeDisabled();
      
      // Even if clicked (which shouldn't be possible due to disabled state),
      // the form should remain
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 1');
      expect(screen.getByTestId('form-0')).toBeInTheDocument();
    });

    it('should re-enable Add Form button after removing forms', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Add forms to maximum (5 forms)
      const addButton = screen.getByTestId('add-form-button');
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      
      expect(addButton).toBeDisabled();
      
      // Remove 2 forms
      await user.click(screen.getByTestId('remove-form-4'));
      await user.click(screen.getByTestId('remove-form-3'));
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 3');
      
      // Add button should be enabled again
      expect(addButton).toBeEnabled();
      expect(addButton).not.toHaveTextContent('(Disabled)');
    });
  });

  describe('Reset flow (Requirements 1.9, 1.10, 1.11)', () => {
    it('should show confirmation dialog when Reset is clicked (Requirement 1.9)', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Click Reset button
      await user.click(screen.getByTestId('reset-form-0'));
      
      // Confirmation dialog should appear
      expect(screen.getByTestId('reset-dialog')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to reset this form?')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-reset')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-reset')).toBeInTheDocument();
    });

    it('should clear form values when reset is confirmed (Requirement 1.10)', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Fill form with data
      await user.type(screen.getByTestId('change-number-0'), 'CHG12345');
      await user.type(screen.getByTestId('release-version-0'), 'v1.0.0');
      
      expect(screen.getByTestId('change-number-0')).toHaveValue('CHG12345');
      expect(screen.getByTestId('release-version-0')).toHaveValue('v1.0.0');
      
      // Initiate reset
      await user.click(screen.getByTestId('reset-form-0'));
      expect(screen.getByTestId('reset-dialog')).toBeInTheDocument();
      
      // Confirm reset
      await user.click(screen.getByTestId('confirm-reset'));
      
      // Dialog should close
      expect(screen.queryByTestId('reset-dialog')).not.toBeInTheDocument();
      
      // Form values should be cleared
      expect(screen.getByTestId('change-number-0')).toHaveValue('');
      expect(screen.getByTestId('release-version-0')).toHaveValue('');
    });

    it('should preserve form values when reset is cancelled (Requirement 1.11)', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Fill form with data
      await user.type(screen.getByTestId('change-number-0'), 'CHG99999');
      await user.type(screen.getByTestId('release-version-0'), 'v9.9.9');
      
      expect(screen.getByTestId('change-number-0')).toHaveValue('CHG99999');
      expect(screen.getByTestId('release-version-0')).toHaveValue('v9.9.9');
      
      // Initiate reset
      await user.click(screen.getByTestId('reset-form-0'));
      expect(screen.getByTestId('reset-dialog')).toBeInTheDocument();
      
      // Cancel reset
      await user.click(screen.getByTestId('cancel-reset'));
      
      // Dialog should close
      expect(screen.queryByTestId('reset-dialog')).not.toBeInTheDocument();
      
      // Form values should be preserved
      expect(screen.getByTestId('change-number-0')).toHaveValue('CHG99999');
      expect(screen.getByTestId('release-version-0')).toHaveValue('v9.9.9');
    });

    it('should not affect other forms when resetting one form', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Add a second form
      await user.click(screen.getByTestId('add-form-button'));
      
      // Fill both forms with data
      await user.type(screen.getByTestId('change-number-0'), 'CHG111');
      await user.type(screen.getByTestId('release-version-0'), 'v1.0.0');
      
      await user.type(screen.getByTestId('change-number-1'), 'CHG222');
      await user.type(screen.getByTestId('release-version-1'), 'v2.0.0');
      
      // Reset first form
      await user.click(screen.getByTestId('reset-form-0'));
      await user.click(screen.getByTestId('confirm-reset'));
      
      // First form should be cleared
      expect(screen.getByTestId('change-number-0')).toHaveValue('');
      expect(screen.getByTestId('release-version-0')).toHaveValue('');
      
      // Second form should retain its values
      expect(screen.getByTestId('change-number-1')).toHaveValue('CHG222');
      expect(screen.getByTestId('release-version-1')).toHaveValue('v2.0.0');
    });

    it('should handle multiple reset cycles', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // First cycle: fill, reset, confirm
      await user.type(screen.getByTestId('change-number-0'), 'CHG001');
      await user.click(screen.getByTestId('reset-form-0'));
      await user.click(screen.getByTestId('confirm-reset'));
      expect(screen.getByTestId('change-number-0')).toHaveValue('');
      
      // Second cycle: fill, reset, cancel
      await user.type(screen.getByTestId('change-number-0'), 'CHG002');
      await user.click(screen.getByTestId('reset-form-0'));
      await user.click(screen.getByTestId('cancel-reset'));
      expect(screen.getByTestId('change-number-0')).toHaveValue('CHG002');
      
      // Third cycle: fill, reset, confirm
      await user.clear(screen.getByTestId('change-number-0'));
      await user.type(screen.getByTestId('change-number-0'), 'CHG003');
      await user.click(screen.getByTestId('reset-form-0'));
      await user.click(screen.getByTestId('confirm-reset'));
      expect(screen.getByTestId('change-number-0')).toHaveValue('');
    });
  });

  describe('Complex workflows', () => {
    it('should handle add, fill, remove, add sequence', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Fill first form
      await user.type(screen.getByTestId('change-number-0'), 'CHG111');
      
      // Add second form
      await user.click(screen.getByTestId('add-form-button'));
      await user.type(screen.getByTestId('change-number-1'), 'CHG222');
      
      // Add third form
      await user.click(screen.getByTestId('add-form-button'));
      await user.type(screen.getByTestId('change-number-2'), 'CHG333');
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 3');
      
      // Remove middle form
      await user.click(screen.getByTestId('remove-form-1'));
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 2');
      expect(screen.getByTestId('change-number-0')).toHaveValue('CHG111');
      expect(screen.getByTestId('change-number-1')).toHaveValue('CHG333');
      
      // Add another form
      await user.click(screen.getByTestId('add-form-button'));
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 3');
      expect(screen.getByTestId('change-number-0')).toHaveValue('CHG111');
      expect(screen.getByTestId('change-number-1')).toHaveValue('CHG333');
      expect(screen.getByTestId('change-number-2')).toHaveValue('');
    });

    it('should maintain form state through add/remove/reset combinations', async () => {
      const user = userEvent.setup();
      render(<TestFormManager />);
      
      // Add forms to maximum
      await user.click(screen.getByTestId('add-form-button'));
      await user.click(screen.getByTestId('add-form-button'));
      await user.click(screen.getByTestId('add-form-button'));
      await user.click(screen.getByTestId('add-form-button'));
      
      // Fill forms with distinct values
      await user.type(screen.getByTestId('change-number-0'), 'A');
      await user.type(screen.getByTestId('change-number-1'), 'B');
      await user.type(screen.getByTestId('change-number-2'), 'C');
      await user.type(screen.getByTestId('change-number-3'), 'D');
      await user.type(screen.getByTestId('change-number-4'), 'E');
      
      // Remove form at index 2
      await user.click(screen.getByTestId('remove-form-2'));
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 4');
      expect(screen.getByTestId('change-number-0')).toHaveValue('A');
      expect(screen.getByTestId('change-number-1')).toHaveValue('B');
      expect(screen.getByTestId('change-number-2')).toHaveValue('D');
      expect(screen.getByTestId('change-number-3')).toHaveValue('E');
      
      // Reset form at index 1
      await user.click(screen.getByTestId('reset-form-1'));
      await user.click(screen.getByTestId('confirm-reset'));
      
      expect(screen.getByTestId('change-number-0')).toHaveValue('A');
      expect(screen.getByTestId('change-number-1')).toHaveValue('');
      expect(screen.getByTestId('change-number-2')).toHaveValue('D');
      expect(screen.getByTestId('change-number-3')).toHaveValue('E');
      
      // Add another form
      await user.click(screen.getByTestId('add-form-button'));
      
      expect(screen.getByTestId('form-count')).toHaveTextContent('Forms: 5');
      expect(screen.getByTestId('change-number-4')).toHaveValue('');
    });
  });
});
