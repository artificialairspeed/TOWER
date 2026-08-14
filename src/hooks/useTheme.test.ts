/**
 * Tests for useTheme Hook
 * 
 * Requirements: 9.1, 9.2, 9.3
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  describe('Initial state', () => {
    it('should initialize with Dark Mode as default (Requirement 9.2)', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('Dark Mode');
    });
    
    it('should always have exactly one theme selected (Requirement 9.3)', () => {
      const { result } = renderHook(() => useTheme());
      
      // Theme should never be null or undefined
      expect(result.current.theme).toBeDefined();
      expect(result.current.theme).toBeTruthy();
    });
  });
  
  describe('setTheme', () => {
    it('should update theme to Light Mode when set (Requirement 9.1)', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('Light Mode');
      });
      
      expect(result.current.theme).toBe('Light Mode');
    });
    
    it('should update theme to Dark Mode when set (Requirement 9.1)', () => {
      const { result } = renderHook(() => useTheme());
      
      // First set to Light Mode
      act(() => {
        result.current.setTheme('Light Mode');
      });
      
      expect(result.current.theme).toBe('Light Mode');
      
      // Then back to Dark Mode
      act(() => {
        result.current.setTheme('Dark Mode');
      });
      
      expect(result.current.theme).toBe('Dark Mode');
    });
    
    it('should maintain exactly one active theme after changes (Requirement 9.3)', () => {
      const { result } = renderHook(() => useTheme());
      
      // Change theme multiple times
      act(() => {
        result.current.setTheme('Light Mode');
      });
      expect(result.current.theme).toBe('Light Mode');
      
      act(() => {
        result.current.setTheme('Dark Mode');
      });
      expect(result.current.theme).toBe('Dark Mode');
      
      act(() => {
        result.current.setTheme('Light Mode');
      });
      expect(result.current.theme).toBe('Light Mode');
      
      // Theme should always be defined
      expect(result.current.theme).toBeDefined();
      expect(result.current.theme).toBeTruthy();
    });
  });
  
  describe('Theme persistence during session', () => {
    it('should persist theme value across multiple state changes', () => {
      const { result } = renderHook(() => useTheme());
      
      // Set to Light Mode
      act(() => {
        result.current.setTheme('Light Mode');
      });
      
      // Theme should remain Light Mode until explicitly changed
      expect(result.current.theme).toBe('Light Mode');
      
      // Simulate time passing (no automatic reset)
      expect(result.current.theme).toBe('Light Mode');
      
      // Change to Dark Mode
      act(() => {
        result.current.setTheme('Dark Mode');
      });
      
      expect(result.current.theme).toBe('Dark Mode');
    });
  });
  
  describe('Mutual exclusivity', () => {
    it('should only allow Light Mode or Dark Mode, never both (Requirement 9.1)', () => {
      const { result } = renderHook(() => useTheme());
      
      // Verify type is either 'Light Mode' or 'Dark Mode'
      expect(['Light Mode', 'Dark Mode']).toContain(result.current.theme);
      
      // Change theme
      act(() => {
        result.current.setTheme('Light Mode');
      });
      
      // Still only one of the two valid values
      expect(['Light Mode', 'Dark Mode']).toContain(result.current.theme);
      expect(result.current.theme).toBe('Light Mode');
      
      // Change back
      act(() => {
        result.current.setTheme('Dark Mode');
      });
      
      expect(['Light Mode', 'Dark Mode']).toContain(result.current.theme);
      expect(result.current.theme).toBe('Dark Mode');
    });
  });
  
  describe('Workflow scenarios', () => {
    it('should handle rapid theme changes correctly', () => {
      const { result } = renderHook(() => useTheme());
      
      // Rapidly change theme multiple times
      act(() => {
        result.current.setTheme('Light Mode');
        result.current.setTheme('Dark Mode');
        result.current.setTheme('Light Mode');
        result.current.setTheme('Light Mode'); // Setting same value
        result.current.setTheme('Dark Mode');
      });
      
      // Final theme should be Dark Mode
      expect(result.current.theme).toBe('Dark Mode');
    });
    
    it('should allow setting the same theme multiple times without issue', () => {
      const { result } = renderHook(() => useTheme());
      
      // Set to Light Mode multiple times
      act(() => {
        result.current.setTheme('Light Mode');
      });
      expect(result.current.theme).toBe('Light Mode');
      
      act(() => {
        result.current.setTheme('Light Mode');
      });
      expect(result.current.theme).toBe('Light Mode');
      
      act(() => {
        result.current.setTheme('Light Mode');
      });
      expect(result.current.theme).toBe('Light Mode');
    });
  });
});
