/**
 * Tests for useResetConfirmation hook
 * 
 * Requirements: 1.9, 1.10, 1.11
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResetConfirmation } from './useResetConfirmation';

describe('useResetConfirmation', () => {
  it('should initialize with dialog closed', () => {
    const mockOnConfirm = vi.fn();
    const { result } = renderHook(() => 
      useResetConfirmation('test-form-id', mockOnConfirm)
    );

    expect(result.current.isOpen).toBe(false);
  });

  it('should open dialog when initiateReset is called (Requirement 1.9)', () => {
    const mockOnConfirm = vi.fn();
    const { result } = renderHook(() => 
      useResetConfirmation('test-form-id', mockOnConfirm)
    );

    act(() => {
      result.current.initiateReset();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should call onConfirm and close dialog when confirmReset is called (Requirement 1.10)', () => {
    const mockOnConfirm = vi.fn();
    const { result } = renderHook(() => 
      useResetConfirmation('test-form-id', mockOnConfirm)
    );

    // First open the dialog
    act(() => {
      result.current.initiateReset();
    });

    expect(result.current.isOpen).toBe(true);

    // Then confirm reset
    act(() => {
      result.current.confirmReset();
    });

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);
  });

  it('should close dialog without calling onConfirm when cancelReset is called (Requirement 1.11)', () => {
    const mockOnConfirm = vi.fn();
    const { result } = renderHook(() => 
      useResetConfirmation('test-form-id', mockOnConfirm)
    );

    // First open the dialog
    act(() => {
      result.current.initiateReset();
    });

    expect(result.current.isOpen).toBe(true);

    // Then cancel reset
    act(() => {
      result.current.cancelReset();
    });

    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });

  it('should maintain stable function references across re-renders', () => {
    const mockOnConfirm = vi.fn();
    const { result, rerender } = renderHook(() => 
      useResetConfirmation('test-form-id', mockOnConfirm)
    );

    const firstInitiateReset = result.current.initiateReset;
    const firstCancelReset = result.current.cancelReset;

    rerender();

    // Function references should be the same (useCallback working)
    expect(result.current.initiateReset).toBe(firstInitiateReset);
    expect(result.current.cancelReset).toBe(firstCancelReset);
  });

  it('should handle multiple open/cancel cycles correctly', () => {
    const mockOnConfirm = vi.fn();
    const { result } = renderHook(() => 
      useResetConfirmation('test-form-id', mockOnConfirm)
    );

    // First cycle: open and cancel
    act(() => {
      result.current.initiateReset();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.cancelReset();
    });
    expect(result.current.isOpen).toBe(false);

    // Second cycle: open and confirm
    act(() => {
      result.current.initiateReset();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.confirmReset();
    });
    expect(result.current.isOpen).toBe(false);
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should work with different form IDs', () => {
    const mockOnConfirm1 = vi.fn();
    const mockOnConfirm2 = vi.fn();

    const { result: result1 } = renderHook(() => 
      useResetConfirmation('form-1', mockOnConfirm1)
    );

    const { result: result2 } = renderHook(() => 
      useResetConfirmation('form-2', mockOnConfirm2)
    );

    // Open and confirm first form
    act(() => {
      result1.current.initiateReset();
    });
    act(() => {
      result1.current.confirmReset();
    });

    // Open and cancel second form
    act(() => {
      result2.current.initiateReset();
    });
    act(() => {
      result2.current.cancelReset();
    });

    expect(mockOnConfirm1).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm2).not.toHaveBeenCalled();
  });
});
