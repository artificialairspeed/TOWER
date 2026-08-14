/**
 * useFormManager Hook
 * 
 * Manages the lifecycle of deployment form instances:
 * - Adding new forms (max 5)
 * - Removing forms (min 1)
 * - Updating form data
 * - Resetting forms with confirmation
 * 
 * Requirements: 1.1-1.11
 */

import { useState, useCallback } from 'react';
import type { DeploymentFormData } from '../types/models';
import { createDefaultForm } from '../data/formFactory';

/**
 * Return type for useFormManager hook
 */
export interface FormManagerState {
  /** Array of all deployment forms */
  forms: DeploymentFormData[];

  /**
   * ID of the most recently added (or initial) form. Used by the UI to
   * auto-expand the newest row so the user can edit it immediately.
   */
  lastAddedFormId: string | null;

  /** Add a new form (max 5 forms) */
  addForm: () => void;
  
  /** Remove a form by ID (min 1 form must remain) */
  removeForm: (formId: string) => void;
  
  /** Update a form with partial updates */
  updateForm: (formId: string, updates: Partial<DeploymentFormData>) => void;
  
  /** Reset a form to default values (requires confirmation from caller) */
  resetForm: (formId: string) => void;
  
  /** Whether adding a new form is allowed (false when at max 5) */
  canAddForm: boolean;
  
  /** Whether removing a form is allowed (false when at min 1) */
  canRemoveForm: boolean;
}

/**
 * Maximum number of deployment forms allowed
 * Requirement: 1.4
 */
const MAX_FORMS = 5;

/**
 * Minimum number of deployment forms required
 * Requirement: 1.8
 */
const MIN_FORMS = 1;

/**
 * Custom hook for managing deployment form instances
 * 
 * Initial state: one default form (Requirement 1.1)
 * 
 * Methods:
 * - addForm(): Creates new form (max 5) - Requirements 1.2, 1.3, 1.4
 * - removeForm(formId): Removes form (min 1) - Requirements 1.6, 1.7, 1.8
 * - updateForm(formId, updates): Updates form data preserving other fields
 * - resetForm(formId): Resets form to defaults - Requirements 1.9, 1.10
 * 
 * All operations preserve other forms' values during add/remove operations
 * (Requirements 1.3, 1.7)
 * 
 * @returns FormManagerState with forms array and control methods
 */
export function useFormManager(): FormManagerState {
  // Initialize with one default form (Requirement 1.1)
  const [forms, setForms] = useState<DeploymentFormData[]>(() => [createDefaultForm()]);

  // Track the newest form so the UI can auto-expand it. Starts null so that on
  // initial load / refresh every form renders collapsed; only forms the user
  // adds during the session are auto-expanded.
  const [lastAddedFormId, setLastAddedFormId] = useState<string | null>(null);
  
  /**
   * Add a new deployment form
   * Requirements: 1.2, 1.3, 1.4
   * 
   * - Creates new form when fewer than 5 forms exist (1.2)
   * - Displays new form alongside existing forms without modifying existing values (1.3)
   * - Rejects addition when 5 forms already exist (1.4)
   */
  const addForm = useCallback(() => {
    setForms((currentForms) => {
      // Reject if at maximum capacity (Requirement 1.4)
      if (currentForms.length >= MAX_FORMS) {
        console.warn(`Cannot add form: maximum of ${MAX_FORMS} forms reached`);
        return currentForms;
      }
      
      // Create new form and add to array (Requirements 1.2, 1.3)
      // Existing forms remain unchanged, preserving all entered values
      const newForm = createDefaultForm();
      // Mark this form as the newest so the UI auto-expands it
      setLastAddedFormId(newForm.formId);
      return [...currentForms, newForm];
    });
  }, []);
  
  /**
   * Remove a deployment form by ID
   * Requirements: 1.6, 1.7, 1.8
   * 
   * - Removes the specified form and all its data (1.7)
   * - Retains all values in remaining forms (1.7)
   * - Rejects removal when only 1 form exists (1.8)
   */
  const removeForm = useCallback((formId: string) => {
    setForms((currentForms) => {
      // Reject if at minimum capacity (Requirement 1.8)
      if (currentForms.length <= MIN_FORMS) {
        console.warn(`Cannot remove form: minimum of ${MIN_FORMS} form required`);
        return currentForms;
      }
      
      // Remove the specified form (Requirement 1.7)
      // All other forms remain unchanged, preserving their entered values
      return currentForms.filter(form => form.formId !== formId);
    });
  }, []);
  
  /**
   * Update a deployment form with partial updates
   * 
   * Allows updating specific fields of a form without affecting other fields
   * or other forms. This preserves data integrity during field updates.
   */
  const updateForm = useCallback((formId: string, updates: Partial<DeploymentFormData>) => {
    setForms((currentForms) => {
      return currentForms.map(form => {
        if (form.formId === formId) {
          // Apply updates while preserving all other fields
          return { ...form, ...updates };
        }
        // Other forms remain completely unchanged
        return form;
      });
    });
  }, []);
  
  /**
   * Reset a deployment form to default values
   * Requirements: 1.9, 1.10
   * 
   * - Clears all entered values (1.10)
   * - Restores each field to the same default value it held when first created (1.10)
   * 
   * Note: Confirmation prompt should be handled by the caller before calling this method
   * (Requirement 1.9). If caller receives cancellation, they should not call resetForm.
   */
  const resetForm = useCallback((formId: string) => {
    setForms((currentForms) => {
      return currentForms.map(form => {
        if (form.formId === formId) {
          // Create a fresh form with default values, preserving only the formId
          const defaultForm = createDefaultForm();
          // Keep the original form ID to maintain form identity
          return { ...defaultForm, formId: form.formId };
        }
        // Other forms remain completely unchanged
        return form;
      });
    });
  }, []);
  
  // Calculate derived state
  const canAddForm = forms.length < MAX_FORMS; // Requirement 1.2, 1.4
  const canRemoveForm = forms.length > MIN_FORMS; // Requirement 1.6, 1.8
  
  return {
    forms,
    lastAddedFormId,
    addForm,
    removeForm,
    updateForm,
    resetForm,
    canAddForm,
    canRemoveForm
  };
}
