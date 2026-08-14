# Testing Infrastructure

This directory contains the test configuration and utilities for the Deployment Notification Generator Portal.

## Test Setup

### Configuration Files

- **`setup.ts`**: Global test setup file that:
  - Extends Vitest's expect with jest-dom matchers
  - Configures automatic cleanup after each test
  - Runs before all test files

- **`test-utils.tsx`**: Custom testing utilities that:
  - Provides a custom `render` function with MUI providers
  - Wraps components with `LocalizationProvider` for date picker support
  - Re-exports all React Testing Library utilities

### Vitest Configuration

The test runner is configured in `vite.config.ts`:
- **Environment**: jsdom (browser simulation)
- **Globals**: Enabled (no need to import describe, it, expect)
- **Setup File**: `./src/test/setup.ts`

## Running Tests

### Available Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage (requires @vitest/coverage-v8)
npm run coverage
```

### Running Specific Tests

```bash
# Run tests in a specific file
npm test -- validators.test.ts

# Run tests matching a pattern
npm test -- --grep "validation"

# Run tests with verbose output
npm test -- --reporter=verbose
```

## Writing Tests

### Basic Unit Test

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Component Test

Use the custom render from `test-utils.tsx` to automatically wrap components with necessary providers:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Integration Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { MyForm } from './MyForm';

describe('MyForm Integration', () => {
  it('should handle form submission', async () => {
    render(<MyForm />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John' }
    });
    
    // Submit
    fireEvent.click(screen.getByText('Submit'));
    
    // Assert
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

## Testing Best Practices

1. **Use the custom render**: Always import `render` from `test-utils.tsx` for component tests
2. **Query priorities**: Use `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
3. **Async operations**: Use `waitFor` or `findBy*` queries for async assertions
4. **User interactions**: Use `@testing-library/user-event` for realistic user interactions
5. **Isolation**: Each test should be independent and not rely on test order

## Available Matchers (jest-dom)

Common matchers available through jest-dom:

- `toBeInTheDocument()` - Element is present in the DOM
- `toHaveTextContent(text)` - Element contains text
- `toHaveValue(value)` - Input has specific value
- `toBeDisabled()` / `toBeEnabled()` - Element disabled state
- `toHaveClass(className)` - Element has CSS class
- `toBeVisible()` - Element is visible to users

See [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) for full list.

## Troubleshooting

### Tests not running
- Check that test file names end with `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx`
- Verify the file is not in an excluded directory (node_modules, etc.)

### Import errors
- Make sure to import from `'../test/test-utils'` for component tests
- Use relative paths based on your file location

### Date picker tests failing
- Ensure you're using the custom render from `test-utils.tsx`
- This provides the required `LocalizationProvider` context

### jsdom limitations
- jsdom doesn't support all browser APIs
- Some operations (file downloads, canvas) may need mocking
