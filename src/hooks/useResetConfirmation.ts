/**
 * Reset Confirmation Hook
 * 
 * Manages confirmation dialog state for resetting deployment forms.
 * Requirements: 1.9, 1.10, 1.11
 */

import { useState, useCallback } from 'react';

/**
 * Hook for managing reset confirmation dialog
 * 
 * Requirements:
 * - 1.9: Display confirmation prompt before clearing any entered values
 * - 1.10: On confirm, call onConfirm callback and restore default values
 * - 1.11: On cancel, close dialog and preserve all values
 * 
 * @param _formId - ID of the form to be reset (for future use)
 * @param onConfirm - Callback function to execute when reset is confirmed
 * @returns Object containing dialog state and control functions
 * 
 * @example
 * const { isOpen, initiateReset, confirmReset, cancelReset } = useResetConfirmation(
 *   formId,
 *   () => resetFormData(formId)
 * );
 */
export function useResetConfirmation(
  _formId: string,
  onConfirm: () => void
) {
  // Track whether the confirmation dialog is open
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Initiates the reset process by showing the confirmation dialog
   * Requirement 1.9: Display confirmation prompt before clearing values
   */
  const initiateReset = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Confirms the reset, executes the onConfirm callback, and closes the dialog
   * Requirement 1.10: On confirm, call onConfirm and restore default values
   */
  const confirmReset = useCallback(() => {
    setIsOpen(false);
    onConfirm();
  }, [onConfirm]);

  /**
   * Cancels the reset and closes the dialog without making any changes
   * Requirement 1.11: On cancel, close dialog and preserve all values
   */
  const cancelReset = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    /** Whether the confirmation dialog is currently open */
    isOpen,
    /** Function to initiate reset (shows confirmation dialog) */
    initiateReset,
    /** Function to confirm reset (executes onConfirm and closes dialog) */
    confirmReset,
    /** Function to cancel reset (closes dialog without changes) */
    cancelReset
  };
}
