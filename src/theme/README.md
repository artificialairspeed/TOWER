# Theme Directory

This directory contains theming infrastructure for the Deployment Notification Generator Portal.

## Overview

The portal supports Light and Dark modes for both:
1. **Portal UI** - The application interface itself
2. **Generated Artifacts** - HTML/PDF/PNG output files

## Files

### `AppThemeProvider.tsx`
Main theme provider component that wraps the application with Material-UI theming.

**Usage:**
```tsx
import { AppThemeProvider } from './theme/AppThemeProvider';

function App() {
  const { theme } = useTheme(); // 'Light Mode' or 'Dark Mode'
  
  return (
    <AppThemeProvider theme={theme}>
      {/* Your app components */}
    </AppThemeProvider>
  );
}
```

**Features:**
- Automatic Material-UI component theming
- Smooth color transitions (0.3s)
- CssBaseline for consistent styling
- Responsive to theme prop changes

### `AppThemeProvider.test.tsx`
Comprehensive unit tests for the theme provider.

**Coverage:**
- Light mode theme configuration
- Dark mode theme configuration
- Child component rendering
- Theme updates on prop changes

## Theme Colors

### Light Mode
```
Background: #f5f7fa (light gray-blue)
Paper:      #ffffff (white)
Primary:    #304cb2 (brand blue)
Text:       Default dark colors
```

### Dark Mode
```
Background: #0a0e1a (very dark blue)
Paper:      #131827 (dark gray-blue)
Primary:    #9ec5ff (light blue)
Text:       #e5eefc (light)
Secondary:  #9daab8 (muted light)
```

## How It Works

1. **Theme Selection** - User selects Light/Dark via ThemeSelector component
2. **State Management** - `useTheme()` hook manages theme state
3. **UI Theming** - `AppThemeProvider` applies MUI theme to portal
4. **Artifact Theming** - Template system applies theme to outputs

## Integration Points

### Portal UI (This Module)
```
useTheme() → AppThemeProvider → MUI ThemeProvider → All UI Components
```

### Generated Artifacts (Separate)
```
useTheme() → generateHTML() → templateProvider.getTemplate() → Themed HTML
```

## Customization

To modify theme colors, edit `AppThemeProvider.tsx`:

```tsx
const muiTheme = createTheme({
  palette: {
    mode,
    ...(mode === 'dark' && {
      background: {
        default: '#YOUR_COLOR',  // Change this
        paper: '#YOUR_COLOR',    // And this
      },
      // ... more customization
    }),
  },
});
```

## Testing

Run theme tests:
```bash
npm test src/theme/AppThemeProvider.test.tsx
```

All tests should pass (5/5).

## Dependencies

- `@mui/material` - Material-UI components and theming
- `react` - React hooks for memoization

## Related Files

- `/src/hooks/useTheme.ts` - Theme state management
- `/src/components/ThemeSelector.tsx` - Theme selection UI
- `/src/utils/templateProvider.ts` - Artifact template loading
- `/public/templates/*.html` - Artifact theme templates

## Accessibility

Both themes maintain WCAG AA contrast ratios for all text elements.

## Performance

Theme object is memoized with `useMemo()` and only recreates when the theme prop changes, ensuring optimal performance.
