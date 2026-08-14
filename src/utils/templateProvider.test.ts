/**
 * Tests for TemplateProvider
 * Task 7.1 - Load and parse HTML templates
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateProvider, Theme } from './templateProvider';

describe('TemplateProvider', () => {
  let provider: TemplateProvider;

  beforeEach(() => {
    provider = new TemplateProvider();
  });

  describe('setTemplate and getTemplate', () => {
    it('should store and retrieve a light mode template', () => {
      const mockTemplate = '<html><body>Light Mode</body></html>';
      provider.setTemplate('light', mockTemplate);
      
      const result = provider.getTemplate('light');
      expect(result).toBe(mockTemplate);
    });

    it('should store and retrieve a dark mode template', () => {
      const mockTemplate = '<html><body>Dark Mode</body></html>';
      provider.setTemplate('dark', mockTemplate);
      
      const result = provider.getTemplate('dark');
      expect(result).toBe(mockTemplate);
    });

    it('should cache templates after loading', () => {
      const lightTemplate = '<html><body>Light</body></html>';
      const darkTemplate = '<html><body>Dark</body></html>';
      
      provider.setTemplate('light', lightTemplate);
      provider.setTemplate('dark', darkTemplate);
      
      // Get templates multiple times
      expect(provider.getTemplate('light')).toBe(lightTemplate);
      expect(provider.getTemplate('light')).toBe(lightTemplate);
      expect(provider.getTemplate('dark')).toBe(darkTemplate);
      expect(provider.getTemplate('dark')).toBe(darkTemplate);
    });

    it('should handle both themes independently', () => {
      const lightTemplate = '<html><body>Light</body></html>';
      const darkTemplate = '<html><body>Dark</body></html>';
      
      provider.setTemplate('light', lightTemplate);
      provider.setTemplate('dark', darkTemplate);
      
      expect(provider.getTemplate('light')).toBe(lightTemplate);
      expect(provider.getTemplate('dark')).toBe(darkTemplate);
      expect(provider.getTemplate('light')).not.toBe(darkTemplate);
    });
  });

  describe('error handling', () => {
    it('should throw error when template not found', () => {
      expect(() => {
        provider.getTemplate('light' as Theme);
      }).toThrow();
    });
  });

  describe('template structure validation', () => {
    it('should contain expected token placeholders in light mode', () => {
      const template = `
        <html>
          <body>
            {{NOTIFICATION_HEADER}}
            {{DEPLOYMENT_TITLE}}
            {{DEPLOYMENT_ID}}
            {{DEPLOYMENT_SCHEDULE}}
            {{OUTAGE_WINDOW}}
            {{CHANGE_ITEMS}}
            {{IMPACT_ITEMS}}
            {{CONTACT_NAME}}
            {{CONTACT_EMAIL}}
            {{CONTACT_PHONE}}
          </body>
        </html>
      `;
      
      provider.setTemplate('light', template);
      const result = provider.getTemplate('light');
      
      expect(result).toContain('{{NOTIFICATION_HEADER}}');
      expect(result).toContain('{{DEPLOYMENT_TITLE}}');
      expect(result).toContain('{{DEPLOYMENT_ID}}');
      expect(result).toContain('{{DEPLOYMENT_SCHEDULE}}');
      expect(result).toContain('{{OUTAGE_WINDOW}}');
      expect(result).toContain('{{CHANGE_ITEMS}}');
      expect(result).toContain('{{IMPACT_ITEMS}}');
      expect(result).toContain('{{CONTACT_NAME}}');
      expect(result).toContain('{{CONTACT_EMAIL}}');
      expect(result).toContain('{{CONTACT_PHONE}}');
    });
  });
});
