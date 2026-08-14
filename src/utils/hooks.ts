/**
 * React Hooks for Deployment Notification Generator Portal
 * 
 * This file contains custom React hooks for managing application state.
 */

import { useState } from 'react';
import { Theme } from '../types/models';

/**
 * Hook for managing theme selection state
 * 
 * Provides theme state management with the following guarantees:
 * - Initial value is always "Dark Mode" (Requirement 9.2)
 * - Exactly one theme is active at all times (Requirement 9.3)
 * - Theme can be toggled between "Light Mode" and "Dark Mode" (Requirement 9.1)
 * 
 * Requirements: 9.1, 9.2, 9.3
 * 
 * @returns An object containing the current theme and a function to update it
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme } = useTheme();
 *   
 *   return (
 *     <div>
 *       <p>Current theme: {theme}</p>
 *       <button onClick={() => setTheme('Light Mode')}>Light</button>
 *       <button onClick={() => setTheme('Dark Mode')}>Dark</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme() {
  // Initialize with Dark Mode as per Requirement 9.2
  const [theme, setTheme] = useState<Theme>('Dark Mode');

  return {
    theme,
    setTheme
  };
}
