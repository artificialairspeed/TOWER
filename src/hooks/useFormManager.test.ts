/**
 * Tests for useFormManager Hook
 * 
 * Requirements: 1.1-1.11
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormManager } from './useFormManager';

describe('useFormManager', () => {
  describe('Initial state', () => {
    it('should initialize with exactly one default form (Requirement 1.1)', () => {
      const { result } = renderHook(() => useFormManager());
      
      expect(result.current.forms).toHaveLength(1);
      expect(result.current.forms[0]).toBeDefined();
      expect(result.current.forms[0]!.formId).toBeTruthy();
    });
    
    it('should initialize with default form values', () => {
      const { result } = renderHook(() => useFormManager());
      
      const form = result.current.forms[0]!;
      expect(form.application).toBeNull();
      expect(form.changeNumber).toBe('');
      expect(form.releaseVersion).toBe('');
      expect(form.environment).toBeNull();
      expect(form.hasOutage).toBe(false);
      expect(form.changeItems).toHaveLength(1);
      expect(form.impactItems).toHaveLength(1);
      expect(form.contactName).toBe('');
      expect(form.contactEmail).toBe('');
      expect(form.contactPhone).toBe('');
    });
    
    it('should initialize with canAddForm true and canRemoveForm false', () => {
      const { result } = renderHook(() => useFormManager());
      
      expect(result.current.canAddForm).toBe(true);
      expect(result.current.canRemoveForm).toBe(false);
    });
  });
  
  describe('addForm', () => {
    it('should add a new form when fewer than 5 forms exist (Requirements 1.2, 1.3)', () => {
      const { result } = renderHook(() => useFormManager());
      
      act(() => {
        result.current.addForm();
      });
      
      expect(result.current.forms).toHaveLength(2);
      expect(result.current.forms[0]!.formId).not.toBe(result.current.forms[1]!.formId);
    });
    
    it('should preserve existing form values when adding new form (Requirement 1.3)', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Update first form with test data
      const testChangeNumber = 'CHG12345';
      act(() => {
        result.current.updateForm(result.current.forms[0]!.formId, {
          changeNumber: testChangeNumber,
          releaseVersion: 'v1.0.0'
        });
      });
      
      // Add a second form
      act(() => {
        result.current.addForm();
      });
      
      // Verify first form data is unchanged
      expect(result.current.forms[0]!.changeNumber).toBe(testChangeNumber);
      expect(result.current.forms[0]!.releaseVersion).toBe('v1.0.0');
      
      // Verify second form has default values
      expect(result.current.forms[1]!.changeNumber).toBe('');
      expect(result.current.forms[1]!.releaseVersion).toBe('');
    });
    
    it('should allow adding up to 5 forms', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Add 4 more forms (already have 1)
      act(() => {
        result.current.addForm();
        result.current.addForm();
        result.current.addForm();
        result.current.addForm();
      });
      
      expect(result.current.forms).toHaveLength(5);
      expect(result.current.canAddForm).toBe(false);
    });
    
    it('should reject addition when 5 forms already exist (Requirement 1.4)', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Add forms up to maximum
      act(() => {
        result.current.addForm();
        result.current.addForm();
        result.current.addForm();
        result.current.addForm();
      });
      
      expect(result.current.forms).toHaveLength(5);
      
      // Attempt to add 6th form
      act(() => {
        result.current.addForm();
      });
      
      // Should still have only 5 forms
      expect(result.current.forms).toHaveLength(5);
    });
    
    it('should update canAddForm flag correctly', () => {
      const { result } = renderHook(() => useFormManager());
      
      expect(result.current.canAddForm).toBe(true);
      
      // Add forms to reach maximum
      act(() => {
        result.current.addForm();
        result.current.addForm();
        result.current.addForm();
        result.current.addForm();
      });
      
      expect(result.current.canAddForm).toBe(false);
    });
  });
  
  describe('removeForm', () => {
    it('should remove a form by ID (Requirement 1.7)', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Add a second form
      act(() => {
        result.current.addForm();
      });
      
      const secondFormId = result.current.forms[1]!.formId;
      expect(result.current.forms).toHaveLength(2);
      
      // Remove the second form
      act(() => {
        result.current.removeForm(secondFormId);
      });
      
      expect(result.current.forms).toHaveLength(1);
      expect(result.current.forms.find(f => f.formId === secondFormId)).toBeUndefined();
    });
    
    it('should preserve values in remaining forms when removing (Requirement 1.7)', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Add two more forms
      act(() => {
        result.current.addForm();
        result.current.addForm();
      });
      
      const firstFormId = result.current.forms[0]!.formId;
      const secondFormId = result.current.forms[1]!.formId;
      const thirdFormId = result.current.forms[2]!.formId;
      
      // Update all forms with distinct values
      act(() => {
        result.current.updateForm(firstFormId, { changeNumber: 'CHG001' });
        result.current.updateForm(secondFormId, { changeNumber: 'CHG002' });
        result.current.updateForm(thirdFormId, { changeNumber: 'CHG003' });
      });
      
      // Remove the middle form
      act(() => {
        result.current.removeForm(secondFormId);
      });
      
      expect(result.current.forms).toHaveLength(2);
      
      // Verify first and third forms retain their values
      const remainingFirst = result.current.forms.find(f => f.formId === firstFormId);
      const remainingThird = result.current.forms.find(f => f.formId === thirdFormId);
      
      expect(remainingFirst?.changeNumber).toBe('CHG001');
      expect(remainingThird?.changeNumber).toBe('CHG003');
    });
    
    it('should reject removal when only 1 form exists (Requirement 1.8)', () => {
      const { result } = renderHook(() => useFormManager());
      
      const onlyFormId = result.current.forms[0]!.formId;
      expect(result.current.forms).toHaveLength(1);
      
      // Attempt to remove the only form
      act(() => {
        result.current.removeForm(onlyFormId);
      });
      
      // Form should still exist
      expect(result.current.forms).toHaveLength(1);
      expect(result.current.forms[0]!.formId).toBe(onlyFormId);
    });
    
    it('should update canRemoveForm flag correctly', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Initially false (only 1 form)
      expect(result.current.canRemoveForm).toBe(false);
      
      // Add a second form
      act(() => {
        result.current.addForm();
      });
      
      // Now true (2 forms)
      expect(result.current.canRemoveForm).toBe(true);
      
      // Remove back to 1 form
      act(() => {
        result.current.removeForm(result.current.forms[1]!.formId);
      });
      
      // Back to false (1 form)
      expect(result.current.canRemoveForm).toBe(false);
    });
  });
  
  describe('updateForm', () => {
    it('should update specific fields without affecting other fields', () => {
      const { result } = renderHook(() => useFormManager());
      
      const formId = result.current.forms[0]!.formId;
      
      // Update change number
      act(() => {
        result.current.updateForm(formId, { changeNumber: 'CHG12345' });
      });
      
      expect(result.current.forms[0]!.changeNumber).toBe('CHG12345');
      expect(result.current.forms[0]!.releaseVersion).toBe(''); // Unchanged
      
      // Update release version
      act(() => {
        result.current.updateForm(formId, { releaseVersion: 'v2.0.0' });
      });
      
      expect(result.current.forms[0]!.changeNumber).toBe('CHG12345'); // Still set
      expect(result.current.forms[0]!.releaseVersion).toBe('v2.0.0');
    });
    
    it('should not affect other forms when updating one form', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Add second form
      act(() => {
        result.current.addForm();
      });
      
      const firstFormId = result.current.forms[0]!.formId;
      const secondFormId = result.current.forms[1]!.formId;
      
      // Update first form
      act(() => {
        result.current.updateForm(firstFormId, {
          changeNumber: 'CHG111',
          releaseVersion: 'v1.0.0'
        });
      });
      
      // Update second form
      act(() => {
        result.current.updateForm(secondFormId, {
          changeNumber: 'CHG222',
          releaseVersion: 'v2.0.0'
        });
      });
      
      // Verify both forms have their distinct values
      const first = result.current.forms.find(f => f.formId === firstFormId);
      const second = result.current.forms.find(f => f.formId === secondFormId);
      
      expect(first?.changeNumber).toBe('CHG111');
      expect(first?.releaseVersion).toBe('v1.0.0');
      expect(second?.changeNumber).toBe('CHG222');
      expect(second?.releaseVersion).toBe('v2.0.0');
    });
    
    it('should handle partial updates with complex objects', () => {
      const { result } = renderHook(() => useFormManager());
      
      const formId = result.current.forms[0]!.formId;
      
      // Update with application object
      act(() => {
        result.current.updateForm(formId, {
          application: {
            id: 'crew-portal',
            name: 'Crew Portal',
            notificationHeader: 'Crew Portal Deployment Notification'
          }
        });
      });
      
      expect(result.current.forms[0]!.application?.name).toBe('Crew Portal');
      expect(result.current.forms[0]!.changeNumber).toBe(''); // Other fields unchanged
    });
  });
  
  describe('resetForm', () => {
    it('should clear all entered values and restore defaults (Requirement 1.10)', () => {
      const { result } = renderHook(() => useFormManager());
      
      const formId = result.current.forms[0]!.formId;
      
      // Fill form with data
      act(() => {
        result.current.updateForm(formId, {
          changeNumber: 'CHG12345',
          releaseVersion: 'v1.0.0',
          environment: 'PROD',
          contactName: 'John Doe',
          contactEmail: 'john@example.com',
          contactPhone: '(555) 123-4567'
        });
      });
      
      // Verify data is set
      expect(result.current.forms[0]!.changeNumber).toBe('CHG12345');
      expect(result.current.forms[0]!.contactName).toBe('John Doe');
      
      // Reset the form
      act(() => {
        result.current.resetForm(formId);
      });
      
      // Verify all fields are back to defaults
      expect(result.current.forms[0]!.changeNumber).toBe('');
      expect(result.current.forms[0]!.releaseVersion).toBe('');
      expect(result.current.forms[0]!.environment).toBeNull();
      expect(result.current.forms[0]!.contactName).toBe('');
      expect(result.current.forms[0]!.contactEmail).toBe('');
      expect(result.current.forms[0]!.contactPhone).toBe('');
      expect(result.current.forms[0]!.hasOutage).toBe(false);
      expect(result.current.forms[0]!.changeItems).toHaveLength(1);
      expect(result.current.forms[0]!.impactItems).toHaveLength(1);
    });
    
    it('should preserve form ID after reset', () => {
      const { result } = renderHook(() => useFormManager());
      
      const originalFormId = result.current.forms[0]!.formId;
      
      // Update form
      act(() => {
        result.current.updateForm(originalFormId, { changeNumber: 'CHG999' });
      });
      
      // Reset form
      act(() => {
        result.current.resetForm(originalFormId);
      });
      
      // Form ID should remain the same
      expect(result.current.forms[0]!.formId).toBe(originalFormId);
    });
    
    it('should not affect other forms when resetting one form (Requirement 1.10)', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Add second form
      act(() => {
        result.current.addForm();
      });
      
      const firstFormId = result.current.forms[0]!.formId;
      const secondFormId = result.current.forms[1]!.formId;
      
      // Update both forms
      act(() => {
        result.current.updateForm(firstFormId, {
          changeNumber: 'CHG111',
          releaseVersion: 'v1.0.0'
        });
        result.current.updateForm(secondFormId, {
          changeNumber: 'CHG222',
          releaseVersion: 'v2.0.0'
        });
      });
      
      // Reset first form
      act(() => {
        result.current.resetForm(firstFormId);
      });
      
      // First form should be reset
      expect(result.current.forms[0]!.changeNumber).toBe('');
      expect(result.current.forms[0]!.releaseVersion).toBe('');
      
      // Second form should retain its values
      const second = result.current.forms.find(f => f.formId === secondFormId);
      expect(second?.changeNumber).toBe('CHG222');
      expect(second?.releaseVersion).toBe('v2.0.0');
    });
    
    it('should restore default schedule values after reset', () => {
      const { result } = renderHook(() => useFormManager());
      
      const formId = result.current.forms[0]!.formId;
      
      // Update schedule
      const newDate = new Date('2025-06-15');
      act(() => {
        result.current.updateForm(formId, {
          deploymentDate: newDate,
          startTime: new Date('2025-06-15T10:00:00'),
          endTime: new Date('2025-06-15T12:00:00')
        });
      });
      
      // Reset form
      act(() => {
        result.current.resetForm(formId);
      });
      
      // Should have new default date (today) and default times (20:00, 22:00)
      const resetForm = result.current.forms[0]!;
      expect(resetForm.startTime.getHours()).toBe(20);
      expect(resetForm.startTime.getMinutes()).toBe(0);
      expect(resetForm.endTime.getHours()).toBe(22);
      expect(resetForm.endTime.getMinutes()).toBe(0);
    });
  });
  
  describe('Complex workflows', () => {
    it('should handle add, update, remove sequence correctly', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Add 3 forms
      act(() => {
        result.current.addForm();
        result.current.addForm();
      });
      
      expect(result.current.forms).toHaveLength(3);
      
      // Update middle form
      const middleFormId = result.current.forms[1]!.formId;
      act(() => {
        result.current.updateForm(middleFormId, { changeNumber: 'CHG555' });
      });
      
      // Remove first form
      act(() => {
        result.current.removeForm(result.current.forms[0]!.formId);
      });
      
      expect(result.current.forms).toHaveLength(2);
      
      // Middle form (now first) should retain its data
      expect(result.current.forms[0]!.formId).toBe(middleFormId);
      expect(result.current.forms[0]!.changeNumber).toBe('CHG555');
    });
    
    it('should handle reaching max forms, removing some, and adding again', () => {
      const { result } = renderHook(() => useFormManager());
      
      // Add to maximum (5 forms)
      act(() => {
        result.current.addForm();
        result.current.addForm();
        result.current.addForm();
        result.current.addForm();
      });
      
      expect(result.current.forms).toHaveLength(5);
      expect(result.current.canAddForm).toBe(false);
      
      // Remove 2 forms
      act(() => {
        result.current.removeForm(result.current.forms[4]!.formId);
        result.current.removeForm(result.current.forms[3]!.formId);
      });
      
      expect(result.current.forms).toHaveLength(3);
      expect(result.current.canAddForm).toBe(true);
      
      // Should be able to add again
      act(() => {
        result.current.addForm();
      });
      
      expect(result.current.forms).toHaveLength(4);
    });
  });
});
