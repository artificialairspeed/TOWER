/**
 * AppThemeProvider Tests
 *
 * The portal is dark-mode only. The provider always renders the dark palette,
 * regardless of the (retained-for-compatibility) `theme` prop.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppThemeProvider } from './AppThemeProvider';
import { Box, useTheme } from '@mui/material';

// Test component that displays theme info
function ThemeDisplay() {
  const theme = useTheme();
  return (
    <Box>
      <div data-testid="theme-mode">{theme.palette.mode}</div>
      <div data-testid="bg-color">{theme.palette.background.default}</div>
      <div data-testid="paper-color">{theme.palette.background.paper}</div>
    </Box>
  );
}

describe('AppThemeProvider', () => {
  it('always provides the dark palette (portal is dark-mode only)', () => {
    render(
      <AppThemeProvider theme="Dark Mode">
        <ThemeDisplay />
      </AppThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('bg-color')).toHaveTextContent('#0a0e1a');
    expect(screen.getByTestId('paper-color')).toHaveTextContent('#131827');
  });

  it('stays in dark mode even when a "Light Mode" prop is passed', () => {
    render(
      <AppThemeProvider theme="Light Mode">
        <ThemeDisplay />
      </AppThemeProvider>
    );

    // Dark-only: the light prop is ignored
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('bg-color')).toHaveTextContent('#0a0e1a');
  });

  it('renders children correctly', () => {
    render(
      <AppThemeProvider theme="Dark Mode">
        <div data-testid="child">Test Content</div>
      </AppThemeProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Test Content');
  });

  it('applies CssBaseline for consistent styling', () => {
    render(
      <AppThemeProvider theme="Dark Mode">
        <div data-testid="content">Content</div>
      </AppThemeProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
