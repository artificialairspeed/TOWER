/**
 * Tests for useValidationErrors hook
 * 
 * Tests validation error management functionality:
 * - Set and retrieve errors
 * - Clear errors by form and field
 * - Check if forms have errors
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useValidationErrors } from './useValidationErrors';
import type { ValidationError } from '../types/models';

describe('useValidationErrors', () => {
  it('should initialize with no errors', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    expect(result.current.getAllErrors()).toEqual([]);
    expect(result.current.hasFormErrors('form1')).toBe(false);
    expect(result.current.getFieldError('form1', 'field1')).toBeUndefined();
  });

  it('should set and retrieve validation errors', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' },
      { formId: 'form2', field: 'environment', message: 'Please select an environment' }
    ];
    
    act(() => {
      result.current.setErrors(errors);
    });
    
    expect(result.current.getFieldError('form1', 'changeNumber')).toBe('Change Number is required');
    expect(result.current.getFieldError('form1', 'contactEmail')).toBe('Invalid email format');
    expect(result.current.getFieldError('form2', 'environment')).toBe('Please select an environment');
  });

  it('should check if form has errors', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' }
    ];
    
    act(() => {
      result.current.setErrors(errors);
    });
    
    expect(result.current.hasFormErrors('form1')).toBe(true);
    expect(result.current.hasFormErrors('form2')).toBe(false);
  });

  it('should get all errors for a specific form', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' },
      { formId: 'form2', field: 'environment', message: 'Please select an environment' }
    ];
    
    act(() => {
      result.current.setErrors(errors);
    });
    
    const form1Errors = result.current.getFormErrors('form1');
    expect(form1Errors).toHaveLength(2);
    expect(form1Errors).toEqual([
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' }
    ]);
  });

  it('should clear field error when user corrects input', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' }
    ];
    
    act(() => {
      result.current.setErrors(errors);
    });
    
    expect(result.current.getFieldError('form1', 'changeNumber')).toBe('Change Number is required');
    
    // Clear the field error
    act(() => {
      result.current.clearFieldError('form1', 'changeNumber');
    });
    
    expect(result.current.getFieldError('form1', 'changeNumber')).toBeUndefined();
    expect(result.current.getFieldError('form1', 'contactEmail')).toBe('Invalid email format');
    expect(result.current.hasFormErrors('form1')).toBe(true); // Still has one error
  });

  it('should remove form from error map when last field error is cleared', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' }
    ];
    
    act(() => {
      result.current.setErrors(errors);
    });
    
    expect(result.current.hasFormErrors('form1')).toBe(true);
    
    // Clear the only error
    act(() => {
      result.current.clearFieldError('form1', 'changeNumber');
    });
    
    expect(result.current.hasFormErrors('form1')).toBe(false);
    expect(result.current.getFormErrors('form1')).toEqual([]);
  });

  it('should clear all errors for a specific form', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' },
      { formId: 'form2', field: 'environment', message: 'Please select an environment' }
    ];
    
    act(() => {
      result.current.setErrors(errors);
    });
    
    act(() => {
      result.current.clearFormErrors('form1');
    });
    
    expect(result.current.hasFormErrors('form1')).toBe(false);
    expect(result.current.hasFormErrors('form2')).toBe(true);
  });

  it('should clear all validation errors', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form2', field: 'environment', message: 'Please select an environment' }
    ];
    
    act(() => {
      result.current.setErrors(errors);
    });
    
    act(() => {
      result.current.clearAllErrors();
    });
    
    expect(result.current.getAllErrors()).toEqual([]);
    expect(result.current.hasFormErrors('form1')).toBe(false);
    expect(result.current.hasFormErrors('form2')).toBe(false);
  });

  it('should get all validation errors', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form2', field: 'environment', message: 'Please select an environment' }
    ];
    
    act(() => {
      result.current.setErrors(errors);
    });
    
    const allErrors = result.current.getAllErrors();
    expect(allErrors).toHaveLength(2);
    expect(allErrors).toEqual(expect.arrayContaining(errors));
  });

  it('should handle clearing non-existent errors gracefully', () => {
    const { result } = renderHook(() => useValidationErrors());
    
    // Should not throw when clearing errors that don't exist
    act(() => {
      result.current.clearFieldError('nonexistent', 'field');
      result.current.clearFormErrors('nonexistent');
    });
    
    expect(result.current.getAllErrors()).toEqual([]);
  });
});
