/**
 * Tests for React Hooks
 * 
 * Tests theme selection hook functionality.
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme } from './hooks';
import { Theme } from '../types/models';

describe('useTheme', () => {
  describe('initialization', () => {
    test('initializes with Dark Mode as default', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('Dark Mode');
    });

    test('returns theme and setTheme function', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('setTheme');
      expect(typeof result.current.setTheme).toBe('function');
    });
  });

  describe('theme updates', () => {
    test('updates theme to Light Mode', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('Light Mode');
      });
      
      expect(result.current.theme).toBe('Light Mode');
    });

    test('updates theme to Dark Mode', () => {
      const { result } = renderHook(() => useTheme());
      
      // First switch to Light Mode
      act(() => {
        result.current.setTheme('Light Mode');
      });
      
      // Then switch back to Dark Mode
      act(() => {
        result.current.setTheme('Dark Mode');
      });
      
      expect(result.current.theme).toBe('Dark Mode');
    });

    test('maintains exactly one theme at all times', () => {
      const { result } = renderHook(() => useTheme());
      
      // Initial state
      expect(result.current.theme).toBeTruthy();
      expect(result.current.theme).toBe('Dark Mode');
      
      // After switching to Light Mode
      act(() => {
        result.current.setTheme('Light Mode');
      });
      expect(result.current.theme).toBeTruthy();
      expect(result.current.theme).toBe('Light Mode');
      
      // After switching back to Dark Mode
      act(() => {
        result.current.setTheme('Dark Mode');
      });
      expect(result.current.theme).toBeTruthy();
      expect(result.current.theme).toBe('Dark Mode');
    });

    test('allows toggling between Light Mode and Dark Mode multiple times', () => {
      const { result } = renderHook(() => useTheme());
      
      // Toggle to Light Mode
      act(() => {
        result.current.setTheme('Light Mode');
      });
      expect(result.current.theme).toBe('Light Mode');
      
      // Toggle to Dark Mode
      act(() => {
        result.current.setTheme('Dark Mode');
      });
      expect(result.current.theme).toBe('Dark Mode');
      
      // Toggle to Light Mode again
      act(() => {
        result.current.setTheme('Light Mode');
      });
      expect(result.current.theme).toBe('Light Mode');
      
      // Toggle to Dark Mode again
      act(() => {
        result.current.setTheme('Dark Mode');
      });
      expect(result.current.theme).toBe('Dark Mode');
    });
  });

  describe('type safety', () => {
    test('theme value is a valid Theme type', () => {
      const { result } = renderHook(() => useTheme());
      
      const validThemes: Theme[] = ['Light Mode', 'Dark Mode'];
      expect(validThemes).toContain(result.current.theme);
      
      act(() => {
        result.current.setTheme('Light Mode');
      });
      expect(validThemes).toContain(result.current.theme);
    });
  });
});
