/**
 * Tests for useNotifications hook
 * 
 * Task: 17.3
 * Requirements: 10.8, 11.4, 13.3, 13.4
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import type { DeliveryResult } from '../types/models';

describe('useNotifications', () => {
  describe('Basic notification operations', () => {
    it('should initialize with no notification', () => {
      const { result } = renderHook(() => useNotifications());
      
      expect(result.current.notification).toBeNull();
    });

    it('should show success notification', () => {
      const { result } = renderHook(() => useNotifications());
      
      act(() => {
        result.current.showSuccess('Operation successful');
      });
      
      expect(result.current.notification).not.toBeNull();
      expect(result.current.notification?.severity).toBe('success');
      expect(result.current.notification?.message).toBe('Operation successful');
    });

    it('should show success notification with details', () => {
      const { result } = renderHook(() => useNotifications());
      
      act(() => {
        result.current.showSuccess('Operation successful', ['Detail 1', 'Detail 2']);
      });
      
      expect(result.current.notification?.details).toEqual(['Detail 1', 'Detail 2']);
    });

    it('should show info notification', () => {
      const { result } = renderHook(() => useNotifications());
      
      act(() => {
        result.current.showInfo('Information message');
      });
      
      expect(result.current.notification?.severity).toBe('info');
      expect(result.current.notification?.message).toBe('Information message');
    });

    it('should show warning notification', () => {
      const { result } = renderHook(() => useNotifications());
      
      act(() => {
        result.current.showWarning('Warning message');
      });
      
      expect(result.current.notification?.severity).toBe('warning');
      expect(result.current.notification?.message).toBe('Warning message');
    });

    it('should show error notification', () => {
      const { result } = renderHook(() => useNotifications());
      
      act(() => {
        result.current.showError('Error message');
      });
      
      expect(result.current.notification?.severity).toBe('error');
      expect(result.current.notification?.message).toBe('Error message');
    });

    it('should clear notification', () => {
      const { result } = renderHook(() => useNotifications());
      
      act(() => {
        result.current.showSuccess('Test message');
      });
      
      expect(result.current.notification).not.toBeNull();
      
      act(() => {
        result.current.clearNotification();
      });
      
      expect(result.current.notification).toBeNull();
    });

    it('should generate unique notification IDs', () => {
      const { result } = renderHook(() => useNotifications());
      
      act(() => {
        result.current.showSuccess('Message 1');
      });
      const id1 = result.current.notification?.id;
      
      act(() => {
        result.current.showSuccess('Message 2');
      });
      const id2 = result.current.notification?.id;
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('Generation result notifications', () => {
    // Requirement 17.3: Success message for complete success
    it('should show success notification when all artifacts generated successfully', () => {
      const { result } = renderHook(() => useNotifications());
      
      const deliveryResult: DeliveryResult = {
        total: 9, // 3 forms × 3 artifacts
        successful: 9,
        failed: 0,
        errors: [],
        popupBlocked: false
      };
      
      act(() => {
        result.current.showGenerationResult(deliveryResult, 3);
      });
      
      expect(result.current.notification?.severity).toBe('success');
      expect(result.current.notification?.message).toBe('Generated 3×3 artifacts successfully');
      expect(result.current.notification?.details).toContain('All 9 artifacts (HTML, PDF, PNG) were delivered successfully.');
    });

    // Requirement 13.3: Popup blocked message
    it('should show warning notification when popups are blocked', () => {
      const { result } = renderHook(() => useNotifications());
      
      const deliveryResult: DeliveryResult = {
        total: 3,
        successful: 2,
        failed: 1,
        errors: [
          {
            formId: 'form-1',
            artifactType: 'HTML',
            message: 'Popup blocked'
          }
        ],
        popupBlocked: true
      };
      
      act(() => {
        result.current.showGenerationResult(deliveryResult, 1);
      });
      
      expect(result.current.notification?.severity).toBe('warning');
      expect(result.current.notification?.details).toContain('Please allow pop-ups to view HTML notifications');
    });

    // Requirement 13.4: Artifact failure messages
    it('should show warning notification with artifact failure details for partial success', () => {
      const { result } = renderHook(() => useNotifications());
      
      const deliveryResult: DeliveryResult = {
        total: 9,
        successful: 7,
        failed: 2,
        errors: [
          {
            formId: 'form-1',
            artifactType: 'PDF',
            message: 'PDF generation failed'
          },
          {
            formId: 'form-2',
            artifactType: 'PNG',
            message: 'PNG generation failed'
          }
        ],
        popupBlocked: false
      };
      
      act(() => {
        result.current.showGenerationResult(deliveryResult, 3);
      });
      
      expect(result.current.notification?.severity).toBe('warning');
      expect(result.current.notification?.message).toBe('Generated 7 of 9 artifacts (2 failed)');
      expect(result.current.notification?.details).toContain('Form form-1: Failed to generate PDF');
      expect(result.current.notification?.details).toContain('Form form-2: Failed to generate PNG');
    });

    // Requirement 10.8, 11.4: Display error for complete failure
    it('should show error notification when all artifacts fail', () => {
      const { result } = renderHook(() => useNotifications());
      
      const deliveryResult: DeliveryResult = {
        total: 3,
        successful: 0,
        failed: 3,
        errors: [
          {
            formId: 'form-1',
            artifactType: 'HTML',
            message: 'HTML generation failed'
          },
          {
            formId: 'form-1',
            artifactType: 'PDF',
            message: 'PDF generation failed'
          },
          {
            formId: 'form-1',
            artifactType: 'PNG',
            message: 'PNG generation failed'
          }
        ],
        popupBlocked: false
      };
      
      act(() => {
        result.current.showGenerationResult(deliveryResult, 1);
      });
      
      expect(result.current.notification?.severity).toBe('error');
      expect(result.current.notification?.message).toBe('Generation failed for all artifacts');
    });

    // Test multiple failures per form
    it('should group multiple failures by form', () => {
      const { result } = renderHook(() => useNotifications());
      
      const deliveryResult: DeliveryResult = {
        total: 6,
        successful: 3,
        failed: 3,
        errors: [
          {
            formId: 'form-1',
            artifactType: 'PDF',
            message: 'PDF failed'
          },
          {
            formId: 'form-1',
            artifactType: 'PNG',
            message: 'PNG failed'
          },
          {
            formId: 'form-2',
            artifactType: 'HTML',
            message: 'HTML failed'
          }
        ],
        popupBlocked: false
      };
      
      act(() => {
        result.current.showGenerationResult(deliveryResult, 2);
      });
      
      expect(result.current.notification?.severity).toBe('warning');
      expect(result.current.notification?.details).toContain('Form form-1: Failed to generate PDF, PNG');
      expect(result.current.notification?.details).toContain('Form form-2: Failed to generate HTML');
    });

    // Test complete failure with no specific errors
    it('should show generic error message when all fail with no error details', () => {
      const { result } = renderHook(() => useNotifications());
      
      const deliveryResult: DeliveryResult = {
        total: 3,
        successful: 0,
        failed: 3,
        errors: [],
        popupBlocked: false
      };
      
      act(() => {
        result.current.showGenerationResult(deliveryResult, 1);
      });
      
      expect(result.current.notification?.severity).toBe('error');
      expect(result.current.notification?.details).toContain('All artifacts failed to generate. Please try again.');
    });

    // Test combining popup blocked with other failures
    it('should show both popup blocked and artifact failures', () => {
      const { result } = renderHook(() => useNotifications());
      
      const deliveryResult: DeliveryResult = {
        total: 6,
        successful: 4,
        failed: 2,
        errors: [
          {
            formId: 'form-1',
            artifactType: 'HTML',
            message: 'Popup blocked'
          },
          {
            formId: 'form-2',
            artifactType: 'PDF',
            message: 'PDF generation failed'
          }
        ],
        popupBlocked: true
      };
      
      act(() => {
        result.current.showGenerationResult(deliveryResult, 2);
      });
      
      expect(result.current.notification?.severity).toBe('warning');
      expect(result.current.notification?.details).toContain('Please allow pop-ups to view HTML notifications');
      expect(result.current.notification?.details).toContain('Form form-1: Failed to generate HTML');
      expect(result.current.notification?.details).toContain('Form form-2: Failed to generate PDF');
    });
  });
});
