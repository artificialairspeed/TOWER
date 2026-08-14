/**
 * AppThemeProvider
 *
 * Provides the Material-UI theme for the portal UI.
 *
 * The portal is dark-mode only (both the app UI and the generated outputs use
 * dark mode). The `theme` prop is retained for API compatibility, but the portal
 * always renders the dark palette regardless of its value.
 */

import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import type { Theme } from '../types/models';

interface AppThemeProviderProps {
  /** Retained for API compatibility. The portal always renders dark mode. */
  theme?: Theme;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens (single source of truth for the dark palette)
// ---------------------------------------------------------------------------
export const darkTokens = {
  bg: '#0a0e1a', // Deep navy app background
  paper: '#131827', // Card / panel surface
  paperElevated: '#1a2233', // Slightly raised surface (hover, nested)
  primary: '#5b9dd9',
  primaryLight: '#7ab3e3',
  primaryDark: '#4a8bc7',
  secondary: '#6c8a9e',
  textPrimary: '#e8f0f7',
  textSecondary: '#a2b5c8',
  divider: '#263445',
  actionHover: 'rgba(91, 157, 217, 0.08)',
  actionSelected: 'rgba(91, 157, 217, 0.16)',
  focusRing: '#7ab3e3',
} as const;

/**
 * AppThemeProvider component
 *
 * Wraps the application with a Material-UI ThemeProvider using the dark palette.
 */
export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const muiTheme = React.useMemo(() => {
    return createTheme({
      palette: {
        mode: 'dark',
        background: {
          default: darkTokens.bg,
          paper: darkTokens.paper,
        },
        primary: {
          main: darkTokens.primary,
          light: darkTokens.primaryLight,
          dark: darkTokens.primaryDark,
        },
        secondary: {
          main: darkTokens.secondary,
        },
        text: {
          primary: darkTokens.textPrimary,
          secondary: darkTokens.textSecondary,
        },
        divider: darkTokens.divider,
        action: {
          hover: darkTokens.actionHover,
          selected: darkTokens.actionSelected,
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        // Global baseline: consistent focus-visible ring for keyboard users
        // (WCAG 2.4.7) and a themed scrollbar.
        MuiCssBaseline: {
          styleOverrides: {
            'a, button, [role="button"], input, select, textarea, [tabindex]': {
              '&:focus-visible': {
                outline: `2px solid ${darkTokens.focusRing}`,
                outlineOffset: '2px',
              },
            },
            '*::-webkit-scrollbar': {
              width: '10px',
              height: '10px',
            },
            '*::-webkit-scrollbar-track': {
              background: darkTokens.bg,
            },
            '*::-webkit-scrollbar-thumb': {
              backgroundColor: darkTokens.divider,
              borderRadius: '8px',
            },
            '*::-webkit-scrollbar-thumb:hover': {
              backgroundColor: darkTokens.secondary,
            },
          },
        },
        MuiContainer: {
          styleOverrides: {
            root: {
              transition: 'background-color 0.3s ease-in-out',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none', // Remove MUI default elevation gradient
              transition:
                'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                backgroundColor: darkTokens.bg,
                '& fieldset': {
                  borderColor: darkTokens.divider,
                },
                '&:hover fieldset': {
                  borderColor: darkTokens.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkTokens.primary,
                },
              },
              '& .MuiInputLabel-root': {
                color: darkTokens.textSecondary,
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 6,
              '&.MuiButton-contained': {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(91, 157, 217, 0.25)',
                },
              },
            },
          },
        },
      },
    });
  }, []);

  return (
    <ThemeProvider theme={muiTheme}>
      {/* CssBaseline applies baseline styles and handles body background color */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
