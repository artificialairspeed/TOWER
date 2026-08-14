/**
 * useValidationErrors Hook
 * 
 * Manages validation errors for deployment forms.
 * 
 * Features:
 * - Store validation errors by form ID and field
 * - Set batch validation errors from validateBatch result
 * - Get errors for specific form and field
 * - Clear errors when user corrects inputs
 * - Get all errors for a form (for summary display)
 * 
 * Requirements: 2.3, 3.5, 4.7, 5.6, 6.3, 6.6, 7.3, 7.4, 8.4, 8.5, 10.2, 10.3
 */

import { useState, useCallback } from 'react';
import type { ValidationError } from '../types/models';

interface ValidationErrorMap {
  [formId: string]: {
    [field: string]: string;
  };
}

export interface UseValidationErrorsReturn {
  /** Set all validation errors from a batch validation result */
  setErrors: (errors: ValidationError[]) => void;
  /** Set a single field error (for onBlur validation) */
  setFieldError: (formId: string, field: string, message: string) => void;
  /** Clear all validation errors */
  clearAllErrors: () => void;
  /** Clear errors for a specific form */
  clearFormErrors: (formId: string) => void;
  /** Clear error for a specific field in a form */
  clearFieldError: (formId: string, field: string) => void;
  /** Get error message for a specific field (undefined if no error) */
  getFieldError: (formId: string, field: string) => string | undefined;
  /** Get all errors for a specific form */
  getFormErrors: (formId: string) => ValidationError[];
  /** Check if a form has any validation errors */
  hasFormErrors: (formId: string) => boolean;
  /** Get all validation errors */
  getAllErrors: () => ValidationError[];
}

/**
 * Hook for managing validation errors across all deployment forms
 * 
 * Usage:
 * ```tsx
 * const { setErrors, getFieldError, clearFieldError } = useValidationErrors();
 * 
 * // After validation
 * const result = validateBatch(forms, theme, catalogEmpty);
 * if (!result.isValid) {
 *   setErrors(result.errors);
 * }
 * 
 * // In a form component
 * const emailError = getFieldError(formId, 'contactEmail');
 * 
 * // When user edits a field
 * clearFieldError(formId, 'contactEmail');
 * ```
 */
export function useValidationErrors(): UseValidationErrorsReturn {
  const [errorMap, setErrorMap] = useState<ValidationErrorMap>({});

  /**
   * Set all validation errors from an array of ValidationError objects
   * Requirements: 10.2, 10.3
   */
  const setErrors = useCallback((errors: ValidationError[]) => {
    const newErrorMap: ValidationErrorMap = {};
    
    errors.forEach(error => {
      if (!newErrorMap[error.formId]) {
        newErrorMap[error.formId] = {};
      }
      // TypeScript assertion: we just created this object, so it exists
      const formErrors = newErrorMap[error.formId];
      if (formErrors) {
        formErrors[error.field] = error.message;
      }
    });
    
    setErrorMap(newErrorMap);
  }, []);

  /**
   * Set a single field error (used for onBlur validation)
   */
  const setFieldError = useCallback((formId: string, field: string, message: string) => {
    setErrorMap(prev => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        [field]: message
      }
    }));
  }, []);

  /**
   * Clear all validation errors
   */
  const clearAllErrors = useCallback(() => {
    setErrorMap({});
  }, []);

  /**
   * Clear all errors for a specific form
   */
  const clearFormErrors = useCallback((formId: string) => {
    setErrorMap(prev => {
      const newMap = { ...prev };
      delete newMap[formId];
      return newMap;
    });
  }, []);

  /**
   * Clear error for a specific field in a form
   * Requirements: Clear errors when user corrects inputs
   */
  const clearFieldError = useCallback((formId: string, field: string) => {
    setErrorMap(prev => {
      const formErrors = prev[formId];
      if (!formErrors) return prev;
      
      const newFormErrors = { ...formErrors };
      delete newFormErrors[field];
      
      // If no errors left for this form, remove the form entry
      if (Object.keys(newFormErrors).length === 0) {
        const newMap = { ...prev };
        delete newMap[formId];
        return newMap;
      }
      
      return {
        ...prev,
        [formId]: newFormErrors
      };
    });
  }, []);

  /**
   * Get error message for a specific field
   * Returns undefined if no error exists for that field
   */
  const getFieldError = useCallback((formId: string, field: string): string | undefined => {
    return errorMap[formId]?.[field];
  }, [errorMap]);

  /**
   * Get all errors for a specific form as an array of ValidationError objects
   * Requirements: Display per-form summary errors
   */
  const getFormErrors = useCallback((formId: string): ValidationError[] => {
    const formErrors = errorMap[formId];
    if (!formErrors) return [];
    
    return Object.entries(formErrors).map(([field, message]) => ({
      formId,
      field,
      message
    }));
  }, [errorMap]);

  /**
   * Check if a form has any validation errors
   * Requirements: Highlight forms with validation errors
   */
  const hasFormErrors = useCallback((formId: string): boolean => {
    const formErrors = errorMap[formId];
    return formErrors ? Object.keys(formErrors).length > 0 : false;
  }, [errorMap]);

  /**
   * Get all validation errors as an array
   */
  const getAllErrors = useCallback((): ValidationError[] => {
    const allErrors: ValidationError[] = [];
    
    Object.entries(errorMap).forEach(([formId, fields]) => {
      Object.entries(fields).forEach(([field, message]) => {
        allErrors.push({ formId, field, message });
      });
    });
    
    return allErrors;
  }, [errorMap]);

  return {
    setErrors,
    setFieldError,
    clearAllErrors,
    clearFormErrors,
    clearFieldError,
    getFieldError,
    getFormErrors,
    hasFormErrors,
    getAllErrors
  };
}
