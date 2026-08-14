/**
 * AppThemeProvider
 *
 * Provides the Material-UI theme for the portal UI.
 *
 * The portal is dark-mode only (both the app UI and the generated outputs use
 * dark mode). The `theme` prop is retained for API compatibility, but the portal
 * always renders the dark palette regardless of its value.
 *
 * Font: Inter is the exclusive font family used throughout the entire application.
 * No other fonts are permitted anywhere in the UI.
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

// ---------------------------------------------------------------------------
// Inter Font Configuration
// ---------------------------------------------------------------------------
// Inter is the exclusive font family for the entire application.
// Fallback stack ensures Inter is used on all platforms.
const INTER_FONT_FAMILY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/**
 * AppThemeProvider component
 *
 * Wraps the application with a Material-UI ThemeProvider using the dark palette
 * and enforcing Inter font exclusively across all typography.
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
      typography: {
        fontFamily: INTER_FONT_FAMILY,
        // Override all typography variants to ensure Inter font
        h1: {
          fontFamily: INTER_FONT_FAMILY,
        },
        h2: {
          fontFamily: INTER_FONT_FAMILY,
        },
        h3: {
          fontFamily: INTER_FONT_FAMILY,
        },
        h4: {
          fontFamily: INTER_FONT_FAMILY,
        },
        h5: {
          fontFamily: INTER_FONT_FAMILY,
        },
        h6: {
          fontFamily: INTER_FONT_FAMILY,
        },
        body1: {
          fontFamily: INTER_FONT_FAMILY,
        },
        body2: {
          fontFamily: INTER_FONT_FAMILY,
        },
        subtitle1: {
          fontFamily: INTER_FONT_FAMILY,
        },
        subtitle2: {
          fontFamily: INTER_FONT_FAMILY,
        },
        button: {
          fontFamily: INTER_FONT_FAMILY,
        },
        caption: {
          fontFamily: INTER_FONT_FAMILY,
        },
        overline: {
          fontFamily: INTER_FONT_FAMILY,
        },
      },
      components: {
        // Global baseline: consistent focus-visible ring for keyboard users
        // (WCAG 2.4.7) and a themed scrollbar.
        MuiCssBaseline: {
          styleOverrides: {
            // Ensure Inter font on all elements
            html: {
              fontFamily: INTER_FONT_FAMILY,
            },
            body: {
              fontFamily: INTER_FONT_FAMILY,
            },
            // Universal selector to guarantee no other fonts slip through
            '*': {
              fontFamily: `${INTER_FONT_FAMILY} !important`,
            },
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
              fontFamily: INTER_FONT_FAMILY,
              transition: 'background-color 0.3s ease-in-out',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              fontFamily: INTER_FONT_FAMILY,
              backgroundImage: 'none', // Remove MUI default elevation gradient
              transition:
                'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              fontFamily: INTER_FONT_FAMILY,
              '& .MuiOutlinedInput-root': {
                fontFamily: INTER_FONT_FAMILY,
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
                '&.Mui-error fieldset': {
                  borderColor: 'currentColor', // Uses error color from FormControl
                  borderWidth: 2,
                },
                '&.Mui-error:hover fieldset': {
                  borderColor: 'currentColor',
                },
              },
              '& .MuiInputLabel-root': {
                fontFamily: INTER_FONT_FAMILY,
                color: darkTokens.textSecondary,
              },
              '& .MuiInputBase-input': {
                fontFamily: INTER_FONT_FAMILY,
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              fontFamily: INTER_FONT_FAMILY,
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
        MuiAlert: {
          styleOverrides: {
            root: {
              fontFamily: INTER_FONT_FAMILY,
            },
          },
        },
        MuiAlertTitle: {
          styleOverrides: {
            root: {
              fontFamily: INTER_FONT_FAMILY,
            },
          },
        },
        MuiTypography: {
          styleOverrides: {
            root: {
              fontFamily: INTER_FONT_FAMILY,
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
