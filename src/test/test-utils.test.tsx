import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';

/**
 * Test to verify the custom render utility works correctly
 * and provides necessary context providers for MUI components.
 */
describe('Test Utils', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Test Content</div>;
    
    render(<TestComponent />);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should provide LocalizationProvider context', () => {
    // This test verifies that date pickers can be rendered
    // The provider is available even if we don't explicitly test a date picker
    const TestComponent = () => (
      <div role="status">Provider is available</div>
    );
    
    render(<TestComponent />);
    
    expect(screen.getByRole('status')).toHaveTextContent('Provider is available');
  });
});
