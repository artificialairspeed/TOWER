/**
 * Tests for openHTMLTab function
 * 
 * Task: 15.4
 * Requirements: 10.5, 13.3
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { openHTMLTab } from './artifactGeneration';

describe('openHTMLTab', () => {
  let originalWindowOpen: typeof window.open;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;
  let mockUrl: string;
  
  beforeEach(() => {
    // Save original functions
    originalWindowOpen = window.open;
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    
    // Mock URL
    mockUrl = 'blob:mock-url-123';
    
    // Mock URL.createObjectURL
    URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
    
    // Mock URL.revokeObjectURL
    URL.revokeObjectURL = vi.fn();
  });
  
  afterEach(() => {
    // Restore original functions
    window.open = originalWindowOpen;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    
    // Clear all timers
    vi.clearAllTimers();
  });
  
  test('returns true and opens tab when window.open succeeds', () => {
    // Mock window.open to return a mock window
    const mockWindow = {
      closed: false
    };
    window.open = vi.fn().mockReturnValue(mockWindow);
    
    const htmlString = '<html><body>Test Content</body></html>';
    const result = openHTMLTab(htmlString);
    
    expect(result).toBe(true);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank');
    
    // Verify Blob was created with correct content
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/html');
  });
  
  test('returns false when window.open returns null (popup blocked)', () => {
    // Mock window.open to return null (popup blocked)
    window.open = vi.fn().mockReturnValue(null);
    
    const htmlString = '<html><body>Test Content</body></html>';
    const result = openHTMLTab(htmlString);
    
    expect(result).toBe(false);
    expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank');
    
    // Verify cleanup happened immediately
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });
  
  test('returns false when window.open throws an error', () => {
    // Mock window.open to throw an error
    window.open = vi.fn().mockImplementation(() => {
      throw new Error('Security restriction');
    });
    
    // Spy on console.error to verify error logging
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const htmlString = '<html><body>Test Content</body></html>';
    const result = openHTMLTab(htmlString);
    
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to open HTML tab:',
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });
  
  test('creates Blob with correct content type', () => {
    const mockWindow = { closed: false };
    window.open = vi.fn().mockReturnValue(mockWindow);
    
    const complexHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Deployment Notification</title>
      </head>
      <body>
        <h1>Test Deployment</h1>
      </body>
      </html>
    `;
    
    openHTMLTab(complexHtml);
    
    // Verify Blob was created with the HTML content
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/html');
  });
  
  test('cleans up URL after successful open', () => {
    vi.useFakeTimers();
    
    const mockWindow = { closed: false };
    window.open = vi.fn().mockReturnValue(mockWindow);
    
    openHTMLTab('<html><body>Test</body></html>');
    
    // URL should not be revoked immediately
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    
    // Fast-forward time by 1000ms
    vi.advanceTimersByTime(1000);
    
    // URL should now be revoked
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    
    vi.useRealTimers();
  });
  
  test('handles empty HTML string', () => {
    const mockWindow = { closed: false };
    window.open = vi.fn().mockReturnValue(mockWindow);
    
    const result = openHTMLTab('');
    
    expect(result).toBe(true);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
  
  test('returns false if window is closed immediately', () => {
    // Mock window.open to return a closed window
    const mockWindow = { closed: true };
    window.open = vi.fn().mockReturnValue(mockWindow);
    
    const result = openHTMLTab('<html><body>Test</body></html>');
    
    expect(result).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });
  
  test('returns false if window.closed is undefined (popup blocked)', () => {
    // Mock window.open to return window with undefined closed property
    const mockWindow = { closed: undefined };
    window.open = vi.fn().mockReturnValue(mockWindow);
    
    const result = openHTMLTab('<html><body>Test</body></html>');
    
    expect(result).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });
});
