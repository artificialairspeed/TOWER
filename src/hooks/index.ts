/**
 * Hooks exports
 * 
 * Central export point for custom React hooks
 */

export { useFormManager } from './useFormManager';
export type { FormManagerState } from './useFormManager';

export { useResetConfirmation } from './useResetConfirmation';

export { useTheme } from './useTheme';
export type { ThemeState } from './useTheme';

export { useValidationErrors } from './useValidationErrors';
export type { UseValidationErrorsReturn } from './useValidationErrors';

export { useOutputGenerator } from './useOutputGenerator';
export type { OutputGeneratorState, GenerationState } from './useOutputGenerator';

export { useNotifications } from './useNotifications';
export type { UseNotificationsReturn, Notification, NotificationSeverity } from './useNotifications';
