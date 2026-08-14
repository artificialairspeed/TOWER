/**
 * E2E Test: Form Lifecycle Flow
 * Task 20.4
 * 
 * Tests the complete end-to-end form lifecycle workflow:
 * - Add form (verify 2 forms present)
 * - Remove second form (verify 1 form, Remove disabled)
 * - Add 5 forms (verify Add disabled at 5)
 * - Remove 4 forms (verify 1 remains)
 * - Fill form, reset with confirmation (verify defaults restored)
 * - Fill form, reset with cancel (verify data preserved)
 * 
 * Requirements: 1.1-1.11
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormManager } from './FormManager';

/**
 * Forms render collapsed on load. Expand every collapsed row so the tests can
 * reach the controls inside each form (Reset, Remove this form, fields, etc.).
 */
async function expandAllForms(user: ReturnType<typeof userEvent.setup>) {
  let expanders = screen.queryAllByRole('button', { name: /Expand deployment details/i });
  while (expanders.length > 0) {
    await user.click(expanders[0]);
    expanders = screen.queryAllByRole('button', { name: /Expand deployment details/i });
  }
}

describe('E2E: Form Lifecycle Flow (Task 20.4)', () => {
  it('should complete the full form lifecycle workflow', async () => {
    const user = userEvent.setup();
    render(<FormManager />);
    await expandAllForms(user);

    // Initial state: verify 1 form
    expect(screen.getByText(/Deployment Form 1/i)).toBeInTheDocument();
    expect(screen.getByText(/1 of 5/)).toBeInTheDocument();

    // Sub-task 1: Add form (verify 2 forms present)
    const addButton = screen.getByRole('button', { name: /add new deployment form/i });
    await user.click(addButton);
    
    expect(screen.getByText(/Deployment Form 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment Form 2/i)).toBeInTheDocument();
    expect(screen.getByText(/2 of 5/)).toBeInTheDocument();

    // Sub-task 2: Remove second form (verify 1 form, Remove disabled)
    const removeButtons = screen.getAllByRole('button', { name: /Remove this form/i });
    expect(removeButtons.length).toBe(2); // Both forms should have enabled remove buttons
    
    // Remove the second form
    await user.click(removeButtons[1]);
    
    // Verify only 1 form remains
    expect(screen.getByText(/Deployment Form 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Deployment Form 2/i)).not.toBeInTheDocument();
    expect(screen.getByText(/1 of 5/)).toBeInTheDocument();
    
    // Verify Remove button is now disabled
    const singleRemoveButton = screen.getByRole('button', { name: /Cannot remove the only form/i });
    expect(singleRemoveButton).toBeDisabled();

    // Sub-task 3: Add 5 forms (verify Add disabled at 5)
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);
    
    // Verify 5 forms present
    expect(screen.getByText(/Deployment Form 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment Form 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment Form 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment Form 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment Form 5/i)).toBeInTheDocument();
    expect(screen.getByText(/5 of 5/)).toBeInTheDocument();
    
    // Verify Add button is disabled
    expect(addButton).toBeDisabled();
    expect(screen.getByText(/Maximum of 5 forms/i)).toBeInTheDocument();

    // Sub-task 4: Remove 4 forms (verify 1 remains)
    const allRemoveButtons = screen.getAllByRole('button', { name: /Remove this form/i });
    expect(allRemoveButtons.length).toBe(5);
    
    // Remove forms 2, 3, 4, 5 (keep form 1)
    await user.click(allRemoveButtons[4]); // Remove form 5
    await user.click(allRemoveButtons[3]); // Remove form 4
    await user.click(allRemoveButtons[2]); // Remove form 3
    await user.click(allRemoveButtons[1]); // Remove form 2
    
    // Verify only 1 form remains
    expect(screen.getByText(/Deployment Form 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Deployment Form 2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Deployment Form 3/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Deployment Form 4/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Deployment Form 5/i)).not.toBeInTheDocument();
    expect(screen.getByText(/1 of 5/)).toBeInTheDocument();
    
    // Verify Remove button is disabled again
    const finalRemoveButton = screen.getByRole('button', { name: /Cannot remove the only form/i });
    expect(finalRemoveButton).toBeDisabled();

    // Sub-task 5: Fill form, reset with confirmation (verify defaults restored)
    // Fill the form with data
    const changeNumberInput = screen.getAllByLabelText(/Change Number/i)[0];
    const releaseVersionInput = screen.getAllByLabelText(/Release Version/i)[0];
    const environmentSelect = screen.getAllByLabelText(/Environment/i)[0];
    
    await user.type(changeNumberInput, 'CHG12345');
    await user.type(releaseVersionInput, 'v2.5.0');
    await user.click(environmentSelect);
    await user.click(screen.getByRole('option', { name: 'PROD' }));
    
    // Verify data is filled
    expect(changeNumberInput).toHaveValue('CHG12345');
    expect(releaseVersionInput).toHaveValue('v2.5.0');
    
    // Initiate reset
    const resetButton = screen.getByRole('button', { name: /Reset form to default values/i });
    await user.click(resetButton);
    
    // Verify confirmation dialog appears
    expect(screen.getByText(/This will clear all entered values/i)).toBeInTheDocument();
    
    // Confirm reset
    const confirmButton = screen.getByRole('button', { name: /Reset Form/i });
    await user.click(confirmButton);
    
    // Verify defaults are restored (empty strings for text inputs)
    expect(changeNumberInput).toHaveValue('');
    expect(releaseVersionInput).toHaveValue('');

    // Sub-task 6: Fill form, reset with cancel (verify data preserved)
    // Fill the form again with new data
    await user.type(changeNumberInput, 'CHG99999');
    await user.type(releaseVersionInput, 'v3.0.0');
    
    // Verify data is filled
    expect(changeNumberInput).toHaveValue('CHG99999');
    expect(releaseVersionInput).toHaveValue('v3.0.0');
    
    // Initiate reset
    await user.click(resetButton);
    
    // Verify confirmation dialog appears
    expect(screen.getByText(/This will clear all entered values/i)).toBeInTheDocument();
    
    // Cancel reset
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    // Verify data is preserved
    expect(changeNumberInput).toHaveValue('CHG99999');
    expect(releaseVersionInput).toHaveValue('v3.0.0');
  });

  it('should handle form lifecycle with data preservation across add/remove operations', async () => {
    const user = userEvent.setup();
    render(<FormManager />);

    // Fill initial form with data
    const changeNumberInput = screen.getAllByLabelText(/Change Number/i)[0];
    await user.type(changeNumberInput, 'CHG_ORIGINAL');
    expect(changeNumberInput).toHaveValue('CHG_ORIGINAL');

    // Add a second form
    const addButton = screen.getByRole('button', { name: /add new deployment form/i });
    await user.click(addButton);

    // Verify original form data is preserved
    const allChangeNumberInputs = screen.getAllByLabelText(/Change Number/i);
    expect(allChangeNumberInputs[0]).toHaveValue('CHG_ORIGINAL');
    expect(allChangeNumberInputs[1]).toHaveValue('');

    // Fill second form
    await user.type(allChangeNumberInputs[1], 'CHG_SECOND');
    expect(allChangeNumberInputs[1]).toHaveValue('CHG_SECOND');

    // Remove second form
    const removeButtons = screen.getAllByRole('button', { name: /Remove this form/i });
    await user.click(removeButtons[1]);

    // Verify original form data still preserved
    const remainingInput = screen.getAllByLabelText(/Change Number/i)[0];
    expect(remainingInput).toHaveValue('CHG_ORIGINAL');
  });

  it('should handle reset confirmation workflow multiple times', async () => {
    const user = userEvent.setup();
    render(<FormManager />);
    await expandAllForms(user);

    const changeNumberInput = screen.getAllByLabelText(/Change Number/i)[0];
    const resetButton = screen.getByRole('button', { name: /Reset form to default values/i });

    // First cycle: Fill, reset with confirm
    await user.type(changeNumberInput, 'CHG_FIRST');
    await user.click(resetButton);
    await user.click(screen.getByRole('button', { name: /Reset Form/i }));
    expect(changeNumberInput).toHaveValue('');

    // Second cycle: Fill, reset with cancel
    await user.type(changeNumberInput, 'CHG_SECOND');
    await user.click(resetButton);
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(changeNumberInput).toHaveValue('CHG_SECOND');

    // Third cycle: Fill, reset with confirm
    await user.clear(changeNumberInput);
    await user.type(changeNumberInput, 'CHG_THIRD');
    await user.click(resetButton);
    await user.click(screen.getByRole('button', { name: /Reset Form/i }));
    expect(changeNumberInput).toHaveValue('');
  });

  it('should maintain add/remove button states correctly throughout lifecycle', async () => {
    const user = userEvent.setup();
    render(<FormManager />);
    await expandAllForms(user);

    const addButton = screen.getByRole('button', { name: /add new deployment form/i });

    // Start: Add enabled, Remove disabled
    expect(addButton).toBeEnabled();
    expect(screen.getByRole('button', { name: /Cannot remove the only form/i })).toBeDisabled();

    // Add to 5 forms: Add disabled, Remove enabled
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(addButton).toBeDisabled();
    const removeButtonsAt5 = screen.getAllByRole('button', { name: /Remove this form/i });
    expect(removeButtonsAt5.length).toBe(5);
    removeButtonsAt5.forEach(btn => expect(btn).toBeEnabled());

    // Remove to 3 forms: Add enabled, Remove enabled
    await user.click(removeButtonsAt5[4]);
    await user.click(removeButtonsAt5[3]);

    expect(addButton).toBeEnabled();
    const removeButtonsAt3 = screen.getAllByRole('button', { name: /Remove this form/i });
    expect(removeButtonsAt3.length).toBe(3);
    removeButtonsAt3.forEach(btn => expect(btn).toBeEnabled());

    // Remove to 1 form: Add enabled, Remove disabled
    await user.click(removeButtonsAt3[2]);
    await user.click(removeButtonsAt3[1]);

    expect(addButton).toBeEnabled();
    expect(screen.getByRole('button', { name: /Cannot remove the only form/i })).toBeDisabled();
  });

  it('should complete rapid add/remove cycles without data corruption', async () => {
    const user = userEvent.setup();
    render(<FormManager />);
    await expandAllForms(user);

    const addButton = screen.getByRole('button', { name: /add new deployment form/i });

    // Rapid add cycle
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getByText(/4 of 5/)).toBeInTheDocument();

    // Fill all forms with distinct data
    const changeNumberInputs = screen.getAllByLabelText(/Change Number/i);
    await user.type(changeNumberInputs[0], 'A');
    await user.type(changeNumberInputs[1], 'B');
    await user.type(changeNumberInputs[2], 'C');
    await user.type(changeNumberInputs[3], 'D');

    // Rapid remove cycle (remove middle forms)
    const removeButtons = screen.getAllByRole('button', { name: /Remove this form/i });
    await user.click(removeButtons[2]); // Remove form 3
    await user.click(removeButtons[1]); // Remove form 2

    expect(screen.getByText(/2 of 5/)).toBeInTheDocument();

    // Verify data integrity of remaining forms
    const remainingInputs = screen.getAllByLabelText(/Change Number/i);
    expect(remainingInputs[0]).toHaveValue('A');
    expect(remainingInputs[1]).toHaveValue('D');
  });
});
