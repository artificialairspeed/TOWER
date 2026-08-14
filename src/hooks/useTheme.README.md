# useTheme Hook

## Overview

The `useTheme` hook manages the theme selection state for generated artifacts. It provides a simple interface for selecting between Light Mode and Dark Mode themes.

## Requirements

- **9.1**: Provides exactly two mutually exclusive options: Light Mode and Dark Mode
- **9.2**: Defaults to Dark Mode on initialization
- **9.3**: Maintains exactly one active theme at all times during the session

## Usage

```typescript
import { useTheme } from './hooks';

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current Theme: {theme}</p>
      
      <button 
        onClick={() => setTheme('Light Mode')}
        disabled={theme === 'Light Mode'}
      >
        Light Mode
      </button>
      
      <button 
        onClick={() => setTheme('Dark Mode')}
        disabled={theme === 'Dark Mode'}
      >
        Dark Mode
      </button>
    </div>
  );
}
```

## API

### Return Value

The hook returns an object with the following properties:

#### `theme: Theme`

The currently selected theme. Will be either `'Light Mode'` or `'Dark Mode'`.

- **Type**: `Theme` (string literal union)
- **Default**: `'Dark Mode'`
- **Never**: `null` or `undefined` (always has a value)

#### `setTheme: (theme: Theme) => void`

Function to update the active theme.

- **Parameters**: 
  - `theme`: Must be either `'Light Mode'` or `'Dark Mode'`
- **Effect**: Updates the active theme immediately

## Behavior

### Initial State
- The hook initializes with `'Dark Mode'` as the default theme (Requirement 9.2)
- The theme value is never `null` or `undefined` (Requirement 9.3)

### Theme Changes
- Calling `setTheme()` immediately updates the theme value
- The new theme is applied to all artifacts generated after the change (Requirement 9.7)
- Previously generated artifacts remain unchanged (Requirement 9.8)

### Mutual Exclusivity
- Only one theme can be active at any time (Requirement 9.3)
- Setting a theme automatically deselects the other option
- The two options are mutually exclusive (Requirement 9.1)

## Examples

### Basic Theme Toggle

```typescript
const { theme, setTheme } = useTheme();

const toggleTheme = () => {
  setTheme(theme === 'Light Mode' ? 'Dark Mode' : 'Light Mode');
};

<button onClick={toggleTheme}>
  Switch to {theme === 'Light Mode' ? 'Dark' : 'Light'} Mode
</button>
```

### Radio Button Group

```typescript
const { theme, setTheme } = useTheme();

<div role="radiogroup" aria-label="Theme Selection">
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
</div>
```

### Using Theme in Generation

```typescript
const { theme, setTheme } = useTheme();
const { forms } = useFormManager();

const generateArtifacts = async () => {
  // The current theme value is passed to the output generator
  await generateOutputs(forms, theme);
};

<div>
  <ThemeSelector theme={theme} onThemeChange={setTheme} />
  <button onClick={generateArtifacts}>
    Generate Outputs
  </button>
</div>
```

## Type Definitions

```typescript
export type Theme = 'Light Mode' | 'Dark Mode';

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
```

## Testing

The hook includes comprehensive tests covering:
- Default initialization to Dark Mode
- Theme switching functionality
- Mutual exclusivity enforcement
- State persistence across changes
- Rapid theme change handling

Run tests with:
```bash
npm test -- useTheme.test.ts
```

## Related Components

- **ThemeSelector Component**: UI component that uses this hook (Task 12.2)
- **OutputGenerator**: Consumes the theme value for artifact generation (Task 17.1)
- **Template Provider**: Uses theme to select Light/Dark Mode templates (Task 7.1)
