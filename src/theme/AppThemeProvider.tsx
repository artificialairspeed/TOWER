/**
 * AppThemeProvider
 *
 * Provides the Material-UI theme for the portal UI.
 *
 * The portal is dark-mode only (both the app UI and the generated outputs use
 * dark mode). The `theme` prop is retained for API compatibility, but the portal
 * always renders the dark palette regardless of its value.
 *
 * Colors follow the Southwest Airlines "Jetstream" (V5+) design system: a deep
 * navy "steel" surface scale and SWA blue as the primary accent for buttons,
 * links, and focus rings. SWA amber-yellow is reserved exclusively for the
 * single "Generate Flight Plan" call-to-action button.
 *
 * Font: Open Sans is the exclusive font family used throughout the entire application.
 * No other fonts are permitted anywhere in the UI.
 */

import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Theme } from '../types/models';

interface AppThemeProviderProps {
  /** Retained for API compatibility. The portal always renders dark mode. */
  theme?: Theme;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens (single source of truth for the dark palette)
//
// Values come directly from the SWA Jetstream (V5+) color system.
// ---------------------------------------------------------------------------
export const darkTokens = {
  // Core / surfaces — steel navy scale
  bg: 'rgb(21, 39, 63)', // steel100 — darkest navy, app background
  paper: 'rgb(33, 51, 70)', // steel200 — surface level 1 (cards, app bar)
  paperElevated: 'rgb(43, 61, 79)', // steel300 — surface level 2 (raised / inputs)
  surfaceHover: 'rgb(52, 73, 94)', // steel400 — surface level 3 (hover / borders)
  divider: 'rgb(71, 99, 128)', // steel500 — subtle divider / border

  // Brand primary accent — SWA blue (primary buttons, accents, focus rings)
  primary: 'rgb(25, 130, 230)', // blue500 (main)
  primaryDark: 'rgb(20, 104, 184)', // blue400 (dark / hover)
  primaryLight: 'rgb(71, 155, 235)', // blue600 (light)
  primaryContrast: 'rgb(255, 255, 255)', // white text on blue

  // SWA amber-yellow — reserved exclusively for the Generate Flight Plan CTA.
  // No longer wired into palette.primary; kept as tokens for that one button.
  swaYellow: 'rgb(255, 191, 0)', // swaYellow500 (main)
  swaYellowDark: 'rgb(255, 174, 0)', // swaYellow400 (dark / hover)
  swaYellowLight: 'rgb(255, 204, 51)', // swaYellow600 (light)
  swaYellowContrast: 'rgb(21, 39, 63)', // dark navy text on yellow

  // Secondary accent — blue (secondary / outlined controls, links, focus rings)
  secondary: 'rgb(25, 130, 230)', // blue500 (main)
  secondaryDark: 'rgb(20, 104, 184)', // blue400 (dark)
  secondaryLight: 'rgb(71, 155, 235)', // blue600 (light)

  // SWA blue "accent" — same blue500/blue600 values as primary/secondary above,
  // kept as a distinct semantic alias for parity with the generated flight-plan
  // template (public/templates/flight-plan.html --accent / --accent-hover),
  // which uses this blue specifically for labels, links, and Jira numbers.
  accent: 'rgb(25, 130, 230)', // blue500 — labels, links, Jira numbers
  accentHover: 'rgb(71, 155, 235)', // blue600 — link hover

  // Text
  textPrimary: 'rgb(255, 255, 255)', // white
  textSecondary: 'rgb(207, 217, 219)', // gray3 — muted
  textDisabled: 'rgb(123, 139, 144)', // gray5

  // Interaction states (derived from the blue accent)
  actionHover: 'rgba(25, 130, 230, 0.08)',
  actionSelected: 'rgba(25, 130, 230, 0.16)',
  focusRing: 'rgb(71, 155, 235)', // blue600 (light)
} as const;

// ---------------------------------------------------------------------------
// Open Sans Font Configuration
// ---------------------------------------------------------------------------
// Open Sans is the exclusive font family for the entire application.
// Fallback stack ensures Open Sans is used on all platforms.
const OPEN_SANS_FONT_FAMILY = "'Open Sans', 'open-sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/**
 * AppThemeProvider component
 *
 * Wraps the application with a Material-UI ThemeProvider using the dark palette
 * and enforcing Open Sans font exclusively across all typography.
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
          contrastText: darkTokens.primaryContrast,
        },
        secondary: {
          main: darkTokens.secondary,
          light: darkTokens.secondaryLight,
          dark: darkTokens.secondaryDark,
          contrastText: darkTokens.textPrimary,
        },
        error: {
          main: 'rgb(240, 117, 117)',
          dark: 'rgb(138, 15, 15)',
          light: 'rgb(250, 209, 209)',
          contrastText: darkTokens.primaryContrast,
        },
        warning: {
          main: 'rgb(250, 193, 107)',
          dark: 'rgb(148, 91, 5)',
          light: 'rgb(250, 193, 107)',
          contrastText: darkTokens.primaryContrast,
        },
        success: {
          main: 'rgb(140, 217, 145)',
          dark: 'rgb(26, 76, 28)',
          light: 'rgb(102, 204, 108)',
          contrastText: darkTokens.primaryContrast,
        },
        // Informational blue — deliberately independent of the brand accent.
        // These are raw literals on purpose: they must NOT be sourced from
        // darkTokens.primary* / accent*. `light` currently happens to equal
        // blue600, but that coincidence must not be collapsed into a token —
        // the informational scale is free to diverge from the brand blue.
        info: {
          main: 'rgb(131, 187, 241)',
          dark: 'rgb(10, 52, 92)',
          light: 'rgb(71, 155, 235)',
          contrastText: darkTokens.primaryContrast,
        },
        text: {
          primary: darkTokens.textPrimary,
          secondary: darkTokens.textSecondary,
          disabled: darkTokens.textDisabled,
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
        fontFamily: OPEN_SANS_FONT_FAMILY,
        fontSize: 16,
        fontWeightRegular: 400,
        body1: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
          fontSize: '1rem',
          lineHeight: '24px',
          fontWeight: 400,
        },
        body2: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        // Override all typography variants to ensure Open Sans font
        h1: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        h2: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        h3: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        h4: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        h5: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        h6: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        subtitle1: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        subtitle2: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        button: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        caption: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
        overline: {
          fontFamily: OPEN_SANS_FONT_FAMILY,
        },
      },
      components: {
        // Global baseline: consistent focus-visible ring for keyboard users
        // (WCAG 2.4.7) and a themed scrollbar.
        MuiCssBaseline: {
          styleOverrides: {
            // Ensure Open Sans font + 16px / 24px body baseline on all elements
            html: {
              fontFamily: OPEN_SANS_FONT_FAMILY,
            },
            body: {
              fontFamily: OPEN_SANS_FONT_FAMILY,
              fontSize: '16px',
              lineHeight: '24px',
              fontWeight: 400,
              backgroundColor: darkTokens.bg,
              color: darkTokens.textPrimary,
            },
            // Universal selector to guarantee no other fonts slip through
            '*': {
              fontFamily: `${OPEN_SANS_FONT_FAMILY} !important`,
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
              fontFamily: OPEN_SANS_FONT_FAMILY,
              transition: 'background-color 0.3s ease-in-out',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: darkTokens.paper,
              backgroundImage: 'none',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              fontFamily: OPEN_SANS_FONT_FAMILY,
              backgroundColor: darkTokens.paper,
              backgroundImage: 'none', // Remove MUI default elevation gradient
              transition:
                'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              fontFamily: OPEN_SANS_FONT_FAMILY,
              '& .MuiOutlinedInput-root': {
                fontFamily: OPEN_SANS_FONT_FAMILY,
                backgroundColor: darkTokens.paperElevated,
                color: darkTokens.textPrimary,
                '& fieldset': {
                  borderColor: darkTokens.divider,
                },
                '&:hover fieldset': {
                  borderColor: darkTokens.surfaceHover,
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkTokens.secondary,
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
                fontFamily: OPEN_SANS_FONT_FAMILY,
                color: darkTokens.textSecondary,
                '&.Mui-focused': {
                  color: darkTokens.secondary,
                },
              },
              '& .MuiInputBase-input': {
                fontFamily: OPEN_SANS_FONT_FAMILY,
                color: darkTokens.textPrimary,
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              fontFamily: OPEN_SANS_FONT_FAMILY,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 6,
              '&.MuiButton-contained': {
                boxShadow: 'none',
                '&:hover': {
                  // Shadow tint composed from the brand blue token so the
                  // accent colour stays single-sourced from darkTokens.
                  boxShadow: `0 4px 12px ${alpha(darkTokens.primary, 0.25)}`,
                },
              },
            },
            // Secondary / outlined controls use the blue accent on a
            // transparent fill (SWA Jetstream secondary buttons).
            outlined: {
              borderColor: darkTokens.secondaryLight,
              color: darkTokens.secondaryLight,
              '&:hover': {
                borderColor: darkTokens.secondary,
                backgroundColor: darkTokens.actionHover,
              },
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              fontFamily: OPEN_SANS_FONT_FAMILY,
            },
          },
        },
        MuiAlertTitle: {
          styleOverrides: {
            root: {
              fontFamily: OPEN_SANS_FONT_FAMILY,
            },
          },
        },
        MuiTypography: {
          styleOverrides: {
            root: {
              fontFamily: OPEN_SANS_FONT_FAMILY,
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
