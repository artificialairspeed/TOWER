import { describe, test, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  trimInput,
  isNonEmpty,
  isWithinLength,
} from './validators';

describe('validators', () => {
  describe('isValidEmail', () => {
    test('validates correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
      expect(isValidEmail('first+last@subdomain.example.org')).toBe(true);
      expect(isValidEmail('user123@test-domain.com')).toBe(true);
      expect(isValidEmail('a@b.c')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user name@example.com')).toBe(false);
      expect(isValidEmail('user@@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@example .com')).toBe(false);
    });

    test('handles edge cases', () => {
      expect(isValidEmail('a@b.co')).toBe(true);
      expect(isValidEmail('test_user@example-domain.com')).toBe(true);
      expect(isValidEmail('user..name@example.com')).toBe(true); // Pragmatic - allows double dots
    });
  });

  describe('isValidPhone', () => {
    test('validates correct phone format (###) ###-####', () => {
      expect(isValidPhone('(555) 123-4567')).toBe(true);
      expect(isValidPhone('(000) 000-0000')).toBe(true);
      expect(isValidPhone('(999) 999-9999')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
    });

    test('rejects invalid phone formats', () => {
      // Missing parentheses
      expect(isValidPhone('555 123-4567')).toBe(false);
      expect(isValidPhone('555) 123-4567')).toBe(false);
      expect(isValidPhone('(555 123-4567')).toBe(false);
      
      // Wrong separators
      expect(isValidPhone('(555)-123-4567')).toBe(false);
      expect(isValidPhone('(555) 123 4567')).toBe(false);
      expect(isValidPhone('555-123-4567')).toBe(false);
      
      // Wrong number of digits
      expect(isValidPhone('(55) 123-4567')).toBe(false);
      expect(isValidPhone('(5555) 123-4567')).toBe(false);
      expect(isValidPhone('(555) 12-4567')).toBe(false);
      expect(isValidPhone('(555) 1234-4567')).toBe(false);
      expect(isValidPhone('(555) 123-456')).toBe(false);
      expect(isValidPhone('(555) 123-45678')).toBe(false);
      
      // Non-digits
      expect(isValidPhone('(abc) def-ghij')).toBe(false);
      expect(isValidPhone('(5a5) 123-4567')).toBe(false);
      
      // Empty or whitespace
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('   ')).toBe(false);
      
      // Extra characters
      expect(isValidPhone(' (555) 123-4567')).toBe(false);
      expect(isValidPhone('(555) 123-4567 ')).toBe(false);
      expect(isValidPhone('1(555) 123-4567')).toBe(false);
    });
  });

  describe('trimInput', () => {
    test('removes leading whitespace', () => {
      expect(trimInput('  text')).toBe('text');
      expect(trimInput('\ttext')).toBe('text');
      expect(trimInput('\ntext')).toBe('text');
      expect(trimInput('   text')).toBe('text');
    });

    test('removes trailing whitespace', () => {
      expect(trimInput('text  ')).toBe('text');
      expect(trimInput('text\t')).toBe('text');
      expect(trimInput('text\n')).toBe('text');
      expect(trimInput('text   ')).toBe('text');
    });

    test('removes both leading and trailing whitespace', () => {
      expect(trimInput('  text  ')).toBe('text');
      expect(trimInput('\t\ntext\n\t')).toBe('text');
      expect(trimInput('   text   ')).toBe('text');
    });

    test('preserves embedded whitespace', () => {
      expect(trimInput('  hello world  ')).toBe('hello world');
      expect(trimInput('  first  second  ')).toBe('first  second');
      expect(trimInput('\tword1\tword2\t')).toBe('word1\tword2');
    });

    test('handles strings with no whitespace', () => {
      expect(trimInput('text')).toBe('text');
      expect(trimInput('hello')).toBe('hello');
    });

    test('handles empty and whitespace-only strings', () => {
      expect(trimInput('')).toBe('');
      expect(trimInput('   ')).toBe('');
      expect(trimInput('\t\n')).toBe('');
    });
  });

  describe('isNonEmpty', () => {
    test('returns true for non-empty strings', () => {
      expect(isNonEmpty('text')).toBe(true);
      expect(isNonEmpty('a')).toBe(true);
      expect(isNonEmpty('hello world')).toBe(true);
    });

    test('returns true for strings with content after trimming', () => {
      expect(isNonEmpty('  text  ')).toBe(true);
      expect(isNonEmpty('\ttext\n')).toBe(true);
      expect(isNonEmpty('   a   ')).toBe(true);
    });

    test('returns false for empty strings', () => {
      expect(isNonEmpty('')).toBe(false);
    });

    test('returns false for whitespace-only strings', () => {
      expect(isNonEmpty('   ')).toBe(false);
      expect(isNonEmpty('\t')).toBe(false);
      expect(isNonEmpty('\n')).toBe(false);
      expect(isNonEmpty('  \t\n  ')).toBe(false);
    });
  });

  describe('isWithinLength', () => {
    test('returns true when string length is within max', () => {
      expect(isWithinLength('text', 10)).toBe(true);
      expect(isWithinLength('hello', 5)).toBe(true);
      expect(isWithinLength('a', 1)).toBe(true);
      expect(isWithinLength('', 0)).toBe(true);
      expect(isWithinLength('test', 100)).toBe(true);
    });

    test('returns true when string length equals max', () => {
      expect(isWithinLength('hello', 5)).toBe(true);
      expect(isWithinLength('test', 4)).toBe(true);
      expect(isWithinLength('a', 1)).toBe(true);
    });

    test('returns false when string length exceeds max', () => {
      expect(isWithinLength('hello', 4)).toBe(false);
      expect(isWithinLength('test', 3)).toBe(false);
      expect(isWithinLength('ab', 1)).toBe(false);
      expect(isWithinLength('text', 0)).toBe(false);
    });

    test('trims whitespace before checking length', () => {
      expect(isWithinLength('  text  ', 4)).toBe(true);
      expect(isWithinLength('  hello  ', 5)).toBe(true);
      expect(isWithinLength('  hello  ', 4)).toBe(false);
      expect(isWithinLength('   ', 0)).toBe(true); // trims to empty string
    });

    test('handles various max length bounds', () => {
      const text20 = 'a'.repeat(20);
      const text50 = 'a'.repeat(50);
      const text255 = 'a'.repeat(255);
      const text500 = 'a'.repeat(500);

      // Test at exact bounds
      expect(isWithinLength(text20, 20)).toBe(true);
      expect(isWithinLength(text50, 50)).toBe(true);
      expect(isWithinLength(text255, 255)).toBe(true);
      expect(isWithinLength(text500, 500)).toBe(true);

      // Test just over bounds
      expect(isWithinLength(text20 + 'x', 20)).toBe(false);
      expect(isWithinLength(text50 + 'x', 50)).toBe(false);
      expect(isWithinLength(text255 + 'x', 255)).toBe(false);
      expect(isWithinLength(text500 + 'x', 500)).toBe(false);

      // Test just under bounds
      expect(isWithinLength(text20.slice(0, 19), 20)).toBe(true);
      expect(isWithinLength(text50.slice(0, 49), 50)).toBe(true);
      expect(isWithinLength(text255.slice(0, 254), 255)).toBe(true);
      expect(isWithinLength(text500.slice(0, 499), 500)).toBe(true);
    });
  });
});
