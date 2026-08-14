# React Hooks

This module provides custom React hooks for the Deployment Notification Generator Portal.

## `useTheme()`

A React hook for managing theme selection state in the portal.

### Purpose

Manages the visual theme (Light Mode or Dark Mode) for generated notification artifacts. The theme selection affects which HTML template is used when generating output files.

### Requirements

This hook implements:
- **Requirement 9.1**: Provides exactly two mutually exclusive theme options (Light Mode and Dark Mode)
- **Requirement 9.2**: Defaults to Dark Mode when the portal loads
- **Requirement 9.3**: Ensures exactly one theme is active at all times during the session

### Usage

```tsx
import { useTheme } from './utils/hooks';

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset>
      <legend>Select Theme</legend>
      
      <label>
        <input
          type="radio"
          name="theme"
          value="Light Mode"
          checked={theme === 'Light Mode'}
          onChange={() => setTheme('Light Mode')}
        />
        Light Mode
      </label>
      
      <label>
        <input
          type="radio"
          name="theme"
          value="Dark Mode"
          checked={theme === 'Dark Mode'}
          onChange={() => setTheme('Dark Mode')}
        />
        Dark Mode
      </label>
    </fieldset>
  );
}
```

### Return Value

The hook returns an object with two properties:

- `theme`: The current theme value (either `'Light Mode'` or `'Dark Mode'`)
- `setTheme`: A function to update the theme

### Type Definition

```typescript
type Theme = 'Light Mode' | 'Dark Mode';

function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
```

### Behavior

1. **Initialization**: The hook always initializes with `'Dark Mode'` as the default value
2. **State Management**: Uses React's `useState` to maintain the theme value
3. **Persistence**: Theme state is session-level - it persists for the lifetime of the portal in the browser tab but is not saved between sessions
4. **Thread Safety**: As a React hook, it's safe to use in multiple components within the same component tree (when combined with Context)

### Integration with Output Generation

When generating artifacts, pass the current theme to the output generator:

```tsx
function OutputGenerator() {
  const { theme } = useTheme();
  const forms = useFormManager();

  const handleGenerate = async () => {
    // Use the theme to select the correct template
    await generateArtifacts(forms, theme);
  };

  return (
    <button onClick={handleGenerate}>
      Generate Outputs (Using {theme})
    </button>
  );
}
```

### Session-Level State

The theme is session-level state that applies to ALL deployment forms in the portal. When a coordinator changes the theme:
- **All NEW artifacts** generated after the change will use the newly selected theme
- **Previously generated artifacts** remain unchanged (Requirement 9.8)

### Testing

The hook is fully tested in `hooks.test.ts` with coverage for:
- Default initialization to Dark Mode
- Theme updates (Light Mode ↔ Dark Mode)
- Mutual exclusivity (exactly one theme at all times)
- Multiple toggle operations
- Type safety

Run tests:
```bash
npm test -- hooks.test.ts
```

### Design Notes

This is a simple hook that could be extended to use React Context for global state management. For the current implementation, the hook should be called at the App level and the theme values passed down as props or via Context to child components that need theme information.

### Future Enhancements

Potential future improvements (out of current scope):
- Persist theme preference to localStorage
- Add theme preview functionality
- Support custom themes beyond Light/Dark
- Add theme-based CSS class toggling for the portal UI itself
