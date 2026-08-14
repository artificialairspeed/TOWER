/**
 * Integration tests for useResetConfirmation with useFormManager
 * 
 * Tests the complete reset workflow including confirmation dialog
 * Requirements: 1.9, 1.10, 1.11
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResetConfirmation } from './useResetConfirmation';
import { useFormManager } from './useFormManager';

describe('useResetConfirmation Integration', () => {
  it('should integrate with useFormManager to reset form after confirmation (Requirements 1.9, 1.10)', () => {
    // Set up form manager
    const { result: formManager } = renderHook(() => useFormManager());
    
    // Get the initial form
    const formId = formManager.current.forms[0].formId;
    
    // Modify the form data
    act(() => {
      formManager.current.updateForm(formId, {
        changeNumber: 'CHG12345',
        releaseVersion: 'v1.2.3',
        environment: 'PROD'
      });
    });
    
    // Verify data was updated
    expect(formManager.current.forms[0].changeNumber).toBe('CHG12345');
    expect(formManager.current.forms[0].releaseVersion).toBe('v1.2.3');
    expect(formManager.current.forms[0].environment).toBe('PROD');
    
    // Set up reset confirmation hook
    const { result: resetConfirmation } = renderHook(() =>
      useResetConfirmation(formId, () => formManager.current.resetForm(formId))
    );
    
    // Requirement 1.9: Initiate reset shows confirmation dialog
    act(() => {
      resetConfirmation.current.initiateReset();
    });
    expect(resetConfirmation.current.isOpen).toBe(true);
    
    // Requirement 1.10: Confirm reset clears values and restores defaults
    act(() => {
      resetConfirmation.current.confirmReset();
    });
    
    // Dialog should close
    expect(resetConfirmation.current.isOpen).toBe(false);
    
    // Form data should be reset to defaults
    const resetForm = formManager.current.forms[0];
    expect(resetForm.changeNumber).toBe('');
    expect(resetForm.releaseVersion).toBe('');
    expect(resetForm.environment).toBeNull();
    expect(resetForm.formId).toBe(formId); // Form ID preserved
  });

  it('should preserve form data when reset is cancelled (Requirement 1.11)', () => {
    // Set up form manager
    const { result: formManager } = renderHook(() => useFormManager());
    
    // Get the initial form
    const formId = formManager.current.forms[0].formId;
    
    // Modify the form data
    act(() => {
      formManager.current.updateForm(formId, {
        changeNumber: 'CHG99999',
        releaseVersion: 'v9.9.9',
        environment: 'QA'
      });
    });
    
    // Store original values for comparison
    const originalChangeNumber = formManager.current.forms[0].changeNumber;
    const originalReleaseVersion = formManager.current.forms[0].releaseVersion;
    const originalEnvironment = formManager.current.forms[0].environment;
    
    // Set up reset confirmation hook
    const { result: resetConfirmation } = renderHook(() =>
      useResetConfirmation(formId, () => formManager.current.resetForm(formId))
    );
    
    // Initiate reset
    act(() => {
      resetConfirmation.current.initiateReset();
    });
    expect(resetConfirmation.current.isOpen).toBe(true);
    
    // Requirement 1.11: Cancel reset preserves all values
    act(() => {
      resetConfirmation.current.cancelReset();
    });
    
    // Dialog should close
    expect(resetConfirmation.current.isOpen).toBe(false);
    
    // Form data should be unchanged
    const form = formManager.current.forms[0];
    expect(form.changeNumber).toBe(originalChangeNumber);
    expect(form.releaseVersion).toBe(originalReleaseVersion);
    expect(form.environment).toBe(originalEnvironment);
  });

  it('should not affect other forms when resetting one form', () => {
    // Set up form manager with multiple forms
    const { result: formManager } = renderHook(() => useFormManager());
    
    // Add a second form
    act(() => {
      formManager.current.addForm();
    });
    
    const form1Id = formManager.current.forms[0].formId;
    const form2Id = formManager.current.forms[1].formId;
    
    // Modify both forms
    act(() => {
      formManager.current.updateForm(form1Id, {
        changeNumber: 'CHG11111',
        releaseVersion: 'v1.0.0',
        environment: 'PROD'
      });
      formManager.current.updateForm(form2Id, {
        changeNumber: 'CHG22222',
        releaseVersion: 'v2.0.0',
        environment: 'QA'
      });
    });
    
    // Set up reset confirmation for first form only
    const { result: resetConfirmation } = renderHook(() =>
      useResetConfirmation(form1Id, () => formManager.current.resetForm(form1Id))
    );
    
    // Confirm reset of first form
    act(() => {
      resetConfirmation.current.initiateReset();
    });
    act(() => {
      resetConfirmation.current.confirmReset();
    });
    
    // First form should be reset
    const form1 = formManager.current.forms[0];
    expect(form1.changeNumber).toBe('');
    expect(form1.releaseVersion).toBe('');
    expect(form1.environment).toBeNull();
    
    // Second form should be unchanged
    const form2 = formManager.current.forms[1];
    expect(form2.changeNumber).toBe('CHG22222');
    expect(form2.releaseVersion).toBe('v2.0.0');
    expect(form2.environment).toBe('QA');
  });

  it('should handle multiple reset cycles on the same form', () => {
    // Set up form manager
    const { result: formManager } = renderHook(() => useFormManager());
    const formId = formManager.current.forms[0].formId;
    
    // Set up reset confirmation hook
    const { result: resetConfirmation } = renderHook(() =>
      useResetConfirmation(formId, () => formManager.current.resetForm(formId))
    );
    
    // First cycle: modify, reset, confirm
    act(() => {
      formManager.current.updateForm(formId, { changeNumber: 'CHG11111' });
    });
    expect(formManager.current.forms[0].changeNumber).toBe('CHG11111');
    
    act(() => {
      resetConfirmation.current.initiateReset();
      resetConfirmation.current.confirmReset();
    });
    expect(formManager.current.forms[0].changeNumber).toBe('');
    
    // Second cycle: modify, reset, cancel
    act(() => {
      formManager.current.updateForm(formId, { changeNumber: 'CHG22222' });
    });
    expect(formManager.current.forms[0].changeNumber).toBe('CHG22222');
    
    act(() => {
      resetConfirmation.current.initiateReset();
      resetConfirmation.current.cancelReset();
    });
    expect(formManager.current.forms[0].changeNumber).toBe('CHG22222');
    
    // Third cycle: modify, reset, confirm
    act(() => {
      formManager.current.updateForm(formId, { changeNumber: 'CHG33333' });
    });
    expect(formManager.current.forms[0].changeNumber).toBe('CHG33333');
    
    act(() => {
      resetConfirmation.current.initiateReset();
      resetConfirmation.current.confirmReset();
    });
    expect(formManager.current.forms[0].changeNumber).toBe('');
  });

  it('should work correctly when reset callback is called directly without confirmation', () => {
    // This tests that the resetForm method works on its own
    // (for cases where confirmation has already been handled elsewhere)
    const { result: formManager } = renderHook(() => useFormManager());
    const formId = formManager.current.forms[0].formId;
    
    // Modify form
    act(() => {
      formManager.current.updateForm(formId, {
        changeNumber: 'CHG12345',
        releaseVersion: 'v1.0.0'
      });
    });
    
    expect(formManager.current.forms[0].changeNumber).toBe('CHG12345');
    
    // Call resetForm directly (confirmation already handled)
    act(() => {
      formManager.current.resetForm(formId);
    });
    
    expect(formManager.current.forms[0].changeNumber).toBe('');
    expect(formManager.current.forms[0].releaseVersion).toBe('');
  });
});
