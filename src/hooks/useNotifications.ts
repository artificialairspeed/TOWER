/**
 * Notifications Hook
 * 
 * This hook manages user feedback notifications for artifact generation results.
 * Provides methods to display success messages, popup blocks, and artifact failures.
 * 
 * Task: 17.3
 * Requirements: 10.8, 11.4, 13.3, 13.4
 */

import { useState, useCallback } from 'react';
import type { DeliveryResult } from '../types/models';

/**
 * Notification severity levels
 */
export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

/**
 * Notification message structure
 */
export interface Notification {
  /** Unique identifier for this notification */
  id: string;
  /** Severity level of the notification */
  severity: NotificationSeverity;
  /** Primary message text */
  message: string;
  /** Optional detailed messages (for multi-line notifications) */
  details?: string[];
}

/**
 * Hook return type
 */
export interface UseNotificationsReturn {
  /** Current notification (null if no notification) */
  notification: Notification | null;
  /** Show a success notification */
  showSuccess: (message: string, details?: string[]) => void;
  /** Show an info notification */
  showInfo: (message: string, details?: string[]) => void;
  /** Show a warning notification */
  showWarning: (message: string, details?: string[]) => void;
  /** Show an error notification */
  showError: (message: string, details?: string[]) => void;
  /** Show generation result notification based on DeliveryResult */
  showGenerationResult: (result: DeliveryResult, totalForms: number) => void;
  /** Clear the current notification */
  clearNotification: () => void;
}

/**
 * Custom hook for managing generation result notifications
 * 
 * Provides a simple API for displaying notifications about artifact generation
 * results, including success messages, popup blocked warnings, and failure details.
 * 
 * Requirements:
 * - 10.8: Display error messages for generation failures
 * - 11.4: Display messages for artifact delivery failures
 * - 13.3: Display popup blocked message
 * - 13.4: Display artifact failure messages
 * 
 * @returns Notification state and methods
 * 
 * @example
 * ```typescript
 * const { notification, showGenerationResult, clearNotification } = useNotifications();
 * 
 * // After generation completes:
 * showGenerationResult(deliveryResult, forms.length);
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const [notification, setNotification] = useState<Notification | null>(null);

  /**
   * Generate unique notification ID
   */
  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  /**
   * Show a success notification
   */
  const showSuccess = useCallback((message: string, details?: string[]) => {
    setNotification({
      id: generateId(),
      severity: 'success',
      message,
      details
    });
  }, [generateId]);

  /**
   * Show an info notification
   */
  const showInfo = useCallback((message: string, details?: string[]) => {
    setNotification({
      id: generateId(),
      severity: 'info',
      message,
      details
    });
  }, [generateId]);

  /**
   * Show a warning notification
   */
  const showWarning = useCallback((message: string, details?: string[]) => {
    setNotification({
      id: generateId(),
      severity: 'warning',
      message,
      details
    });
  }, [generateId]);

  /**
   * Show an error notification
   */
  const showError = useCallback((message: string, details?: string[]) => {
    setNotification({
      id: generateId(),
      severity: 'error',
      message,
      details
    });
  }, [generateId]);

  /**
   * Show generation result notification based on DeliveryResult
   * 
   * Analyzes the delivery result and displays appropriate notification:
   * - Success: All artifacts generated successfully
   * - Warning: Some artifacts failed (with details)
   * - Error: All artifacts failed
   * - Info: Popup blocked notice
   * 
   * Requirements:
   * - 10.8, 11.4: Display artifact failure messages
   * - 13.3: Display popup blocked message
   * - 13.4: Display per-artifact failure details
   * 
   * @param result - Delivery result from artifact generation
   * @param totalForms - Total number of forms that were processed
   */
  const showGenerationResult = useCallback((result: DeliveryResult, totalForms: number) => {
    const { total, successful, failed, errors, popupBlocked } = result;

    // Requirement 17.3: Success message
    if (failed === 0) {
      showSuccess(
        `Generated ${totalForms}×3 artifacts successfully`,
        [`All ${total} artifacts (HTML, PDF, PNG) were delivered successfully.`]
      );
      return;
    }

    // Build error details
    const details: string[] = [];

    // Requirement 13.3: Popup blocked message
    if (popupBlocked) {
      details.push('Please allow pop-ups to view HTML notifications');
    }

    // Requirement 13.4: Artifact failure messages
    if (errors.length > 0) {
      // Group errors by form
      const errorsByForm = new Map<string, { html?: string; pdf?: string; png?: string }>();
      
      errors.forEach(error => {
        if (!errorsByForm.has(error.formId)) {
          errorsByForm.set(error.formId, {});
        }
        const formErrors = errorsByForm.get(error.formId)!;
        
        if (error.artifactType === 'HTML') {
          formErrors.html = error.message;
        } else if (error.artifactType === 'PDF') {
          formErrors.pdf = error.message;
        } else if (error.artifactType === 'PNG') {
          formErrors.png = error.message;
        }
      });

      // Format error messages
      errorsByForm.forEach((formErrors, formId) => {
        const failedTypes: string[] = [];
        if (formErrors.html) failedTypes.push('HTML');
        if (formErrors.pdf) failedTypes.push('PDF');
        if (formErrors.png) failedTypes.push('PNG');
        
        if (failedTypes.length > 0) {
          details.push(`Form ${formId}: Failed to generate ${failedTypes.join(', ')}`);
        }
      });
    }

    // Determine severity and message
    if (successful === 0) {
      // All failed
      showError(
        'Generation failed for all artifacts',
        details.length > 0 ? details : ['All artifacts failed to generate. Please try again.']
      );
    } else {
      // Partial success
      showWarning(
        `Generated ${successful} of ${total} artifacts (${failed} failed)`,
        details
      );
    }
  }, [showSuccess, showWarning, showError]);

  /**
   * Clear the current notification
   */
  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showSuccess,
    showInfo,
    showWarning,
    showError,
    showGenerationResult,
    clearNotification
  };
}
