/**
 * useTheme Hook
 * 
 * Manages the theme selection state for generated artifacts:
 * - Initial value: Dark Mode
 * - Exactly one theme active at all times
 * - Two mutually exclusive options: Light Mode and Dark Mode
 * 
 * Requirements: 9.1, 9.2, 9.3
 */

import { useState, useCallback } from 'react';
import type { Theme } from '../types/models';

/**
 * Return type for useTheme hook
 */
export interface ThemeState {
  /** Currently selected theme (Light Mode or Dark Mode) */
  theme: Theme;
  
  /** Set the active theme */
  setTheme: (theme: Theme) => void;
}

/**
 * Default theme selection
 * Requirement: 9.2 - Portal defaults to Dark Mode
 */
const DEFAULT_THEME: Theme = 'Dark Mode';

/**
 * Custom hook for managing theme selection state
 * 
 * Initial state: Dark Mode (Requirement 9.2)
 * 
 * The theme selector provides exactly two mutually exclusive options:
 * Light Mode and Dark Mode (Requirement 9.1). The state always maintains
 * exactly one active theme during the session (Requirement 9.3).
 * 
 * The selected theme is applied to all artifacts generated after the
 * theme change (Requirement 9.7). Artifacts generated before a theme
 * change remain unchanged (Requirement 9.8).
 * 
 * @returns ThemeState with current theme and setter method
 */
export function useTheme(): ThemeState {
  // Initialize with Dark Mode (Requirement 9.2)
  const [theme, setThemeInternal] = useState<Theme>(DEFAULT_THEME);
  
  /**
   * Set the active theme
   * Requirements: 9.1, 9.3
   * 
   * - Updates the theme to the specified value
   * - Ensures exactly one theme is active at all times (9.3)
   * - Theme is either 'Light Mode' or 'Dark Mode' (9.1)
   */
  const setTheme = useCallback((newTheme: Theme) => {
    // Update to the new theme
    // The type system ensures only valid Theme values can be passed
    setThemeInternal(newTheme);
  }, []);
  
  return {
    theme,
    setTheme
  };
}
