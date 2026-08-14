import { describe, it, expect } from 'vitest';

/**
 * Smoke test to verify the test infrastructure is working correctly.
 * This test ensures that:
 * - Vitest is properly configured
 * - Test files are being discovered
 * - Basic assertions work
 */
describe('Test Infrastructure', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should support jest-dom matchers', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello World';
    document.body.appendChild(div);
    
    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('Hello World');
    
    document.body.removeChild(div);
  });
});
