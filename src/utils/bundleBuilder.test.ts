/**
 * Unit tests for artifact bundle builder
 * 
 * Task: 16.1
 * Requirements: 10.4, 11.1, 11.2, 11.3, 12.4, 14.1, 14.3
 * 
 * Tests verify that the bundle builder:
 * - Generates HTML for each form
 * - Applies collision handling to file names
 * - Creates distinct bundles for each form
 * - Maintains data isolation between forms
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildArtifactBundles } from './bundleBuilder';
import type { DeploymentFormData, Application } from '../types/models';
import { templateProvider } from './templateProvider';

describe('buildArtifactBundles', () => {
  const mockApplication1: Application = {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  };

  const mockApplication2: Application = {
    id: 'ao-crew-training',
    name: 'AO Crew Training',
    notificationHeader: 'AO Crew Training Deployment Notification'
  };

  const createMockForm = (
    overrides: Partial<DeploymentFormData> = {}
  ): DeploymentFormData => ({
    formId: 'form-1',
    application: mockApplication1,
    changeNumber: 'CHG12345',
    releaseVersion: 'v5.4.1',
    environment: 'PROD',
    deploymentTitle: '[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]',
    deploymentDate: new Date('2025-03-05T12:00:00Z'), // Use noon to avoid timezone issues
    startTime: new Date('2025-03-05T20:00:00Z'),
    endTime: new Date('2025-03-05T22:00:00Z'),
    hasOutage: false,
    outageStartDate: null,
    outageStartTime: null,
    outageEndDate: null,
    outageEndTime: null,
    changeItems: [
      { id: '1', jiraNumber: 'JIRA-123', description: 'Fix login bug' }
    ],
    impactItems: [
      { id: '1', text: 'Users may experience brief downtime' }
    ],
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '(555) 123-4567',
    ...overrides
  });

  beforeEach(() => {
    // Set up mock templates with more complete structure including tokens
    templateProvider.setTemplate('light', '<html><body class="light">{{NOTIFICATION_HEADER}} {{DEPLOYMENT_ID}}</body></html>');
    templateProvider.setTemplate('dark', '<html><body class="dark">{{NOTIFICATION_HEADER}} {{DEPLOYMENT_ID}}</body></html>');
  });

  afterEach(() => {
    templateProvider.clear();
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should generate bundles for single form', () => {
      const forms = [createMockForm()];
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      expect(bundles).toHaveLength(1);
      expect(bundles[0].formId).toBe('form-1');
      expect(bundles[0].htmlContent).toBeDefined();
      expect(bundles[0].fileName).toBeDefined();
      expect(bundles[0].formData).toBe(forms[0]);
    });

    it('should generate bundles for multiple forms', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG67890' }),
        createMockForm({ formId: 'form-3', environment: 'QA' })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      expect(bundles).toHaveLength(3);
      expect(bundles[0].formId).toBe('form-1');
      expect(bundles[1].formId).toBe('form-2');
      expect(bundles[2].formId).toBe('form-3');
    });

    it('should generate HTML content for each bundle', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      bundles.forEach(bundle => {
        expect(bundle.htmlContent).toBeDefined();
        expect(typeof bundle.htmlContent).toBe('string');
        expect(bundle.htmlContent.length).toBeGreaterThan(0);
        expect(bundle.htmlContent).toContain('<html>');
      });
    });

    it('should use selected theme for HTML generation', () => {
      const forms = [createMockForm()];
      
      const darkBundles = buildArtifactBundles(forms, 'Dark Mode');
      expect(darkBundles[0].htmlContent).toContain('class="dark"');
      
      const lightBundles = buildArtifactBundles(forms, 'Light Mode');
      expect(lightBundles[0].htmlContent).toContain('class="light"');
    });

    it('should include form data reference in each bundle', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      expect(bundles[0].formData).toBe(forms[0]);
      expect(bundles[1].formData).toBe(forms[1]);
    });
  });

  describe('File Name Generation (Requirement 12.4)', () => {
    it('should generate correct file name format', () => {
      const forms = [createMockForm()];
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      expect(bundles[0].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305');
    });

    it('should handle application names with spaces', () => {
      const forms = [
        createMockForm({
          application: mockApplication2 // "AO Crew Training"
        })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      expect(bundles[0].fileName).toContain('AO_Crew_Training');
    });

    it('should use same file name base for all artifacts from one form', () => {
      // The bundle contains a single file name that will be used for HTML, PDF, and PNG
      const forms = [createMockForm()];
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Verify the bundle has one file name (will be used with .html, .pdf, .png extensions)
      expect(bundles[0].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305');
    });
  });

  describe('Collision Handling (Requirements 14.1, 14.3)', () => {
    it('should not add suffix to single form with unique name', () => {
      const forms = [createMockForm({ formId: 'form-1' })];
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      expect(bundles[0].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305');
      expect(bundles[0].fileName).not.toContain('-1');
    });

    it('should add suffixes when forms have colliding base names', () => {
      // Create 3 forms with identical application, environment, CHG#, and date
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' }),
        createMockForm({ formId: 'form-3' })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // First form (alphabetically by ID) gets no suffix
      expect(bundles[0].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305');
      
      // Second and third forms get suffixes
      expect(bundles[1].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305-1');
      expect(bundles[2].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305-2');
    });

    it('should use stable ordering for collision suffixes', () => {
      // Create forms with IDs in non-alphabetical order
      const forms = [
        createMockForm({ formId: 'form-3' }),
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Should be ordered by form ID: form-1, form-2, form-3
      // Find each bundle by formId
      const bundle1 = bundles.find(b => b.formId === 'form-1')!;
      const bundle2 = bundles.find(b => b.formId === 'form-2')!;
      const bundle3 = bundles.find(b => b.formId === 'form-3')!;

      expect(bundle1.fileName).toBe('Crew_Portal_PROD_CHG12345_20250305');
      expect(bundle2.fileName).toBe('Crew_Portal_PROD_CHG12345_20250305-1');
      expect(bundle3.fileName).toBe('Crew_Portal_PROD_CHG12345_20250305-2');
    });

    it('should handle mixed collision and non-collision forms', () => {
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG12345' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG12345' }), // collides with form-1
        createMockForm({ formId: 'form-3', changeNumber: 'CHG67890' })  // no collision
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      const bundle1 = bundles.find(b => b.formId === 'form-1')!;
      const bundle2 = bundles.find(b => b.formId === 'form-2')!;
      const bundle3 = bundles.find(b => b.formId === 'form-3')!;

      expect(bundle1.fileName).toBe('Crew_Portal_PROD_CHG12345_20250305');
      expect(bundle2.fileName).toBe('Crew_Portal_PROD_CHG12345_20250305-1');
      expect(bundle3.fileName).toBe('Crew_Portal_PROD_CHG67890_20250305');
    });

    it('should handle 4+ colliding forms', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' }),
        createMockForm({ formId: 'form-3' }),
        createMockForm({ formId: 'form-4' })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      expect(bundles[0].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305');
      expect(bundles[1].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305-1');
      expect(bundles[2].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305-2');
      expect(bundles[3].fileName).toBe('Crew_Portal_PROD_CHG12345_20250305-3');
    });
  });

  describe('Data Isolation (Requirements 11.2, 11.3)', () => {
    it('should maintain separate HTML content for each form', () => {
      const forms = [
        createMockForm({ 
          formId: 'form-1',
          application: mockApplication1,
          changeNumber: 'CHG11111'
        }),
        createMockForm({ 
          formId: 'form-2',
          application: mockApplication2,
          changeNumber: 'CHG22222'
        })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Each bundle should have different HTML content
      expect(bundles[0].htmlContent).not.toBe(bundles[1].htmlContent);
      
      // Verify each contains its own form's data
      expect(bundles[0].htmlContent).toContain('CHG11111');
      expect(bundles[0].htmlContent).not.toContain('CHG22222');
      
      expect(bundles[1].htmlContent).toContain('CHG22222');
      expect(bundles[1].htmlContent).not.toContain('CHG11111');
    });

    it('should create distinct bundles, not merged artifacts', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Should have 2 separate bundles
      expect(bundles).toHaveLength(2);
      
      // Each bundle is independent
      expect(bundles[0].formId).not.toBe(bundles[1].formId);
      expect(bundles[0].fileName).not.toBe(bundles[1].fileName);
    });

    it('should preserve form data reference without modification', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Form data should be exact references (not copies)
      expect(bundles[0].formData).toBe(forms[0]);
      expect(bundles[1].formData).toBe(forms[1]);
      
      // Original forms should be unchanged
      expect(forms[0].formId).toBe('form-1');
      expect(forms[1].formId).toBe('form-2');
    });
  });

  describe('Error Handling', () => {
    it('should throw error if form has missing required fields', () => {
      const forms = [
        createMockForm({ application: null }) // Missing application
      ];
      
      expect(() => buildArtifactBundles(forms, 'Dark Mode')).toThrow(
        /Failed to build artifact bundle for form form-1/
      );
    });

    it('should throw error if form has no environment', () => {
      const forms = [
        createMockForm({ environment: null }) // Missing environment
      ];
      
      expect(() => buildArtifactBundles(forms, 'Dark Mode')).toThrow(
        /Failed to build artifact bundle for form form-1/
      );
    });

    it('should throw error if form has no change number', () => {
      const forms = [
        createMockForm({ changeNumber: '' }) // Missing change number
      ];
      
      expect(() => buildArtifactBundles(forms, 'Dark Mode')).toThrow(
        /Failed to build artifact bundle for form form-1/
      );
    });

    it('should include form ID in error message', () => {
      const forms = [
        createMockForm({ formId: 'my-custom-form-id', application: null })
      ];
      
      expect(() => buildArtifactBundles(forms, 'Dark Mode')).toThrow(
        /my-custom-form-id/
      );
    });

    it('should propagate HTML generation errors', () => {
      // Clear templates to force an error
      templateProvider.clear();
      
      const forms = [createMockForm()];
      
      expect(() => buildArtifactBundles(forms, 'Dark Mode')).toThrow();
    });
  });

  describe('Multiple Forms (Requirement 11.1)', () => {
    it('should generate exactly N bundles for N forms', () => {
      const testCases = [1, 2, 3, 5];
      
      testCases.forEach(n => {
        const forms = Array.from({ length: n }, (_, i) => 
          createMockForm({ 
            formId: `form-${i}`,
            changeNumber: `CHG${10000 + i}`
          })
        );
        
        const bundles = buildArtifactBundles(forms, 'Dark Mode');
        
        expect(bundles).toHaveLength(n);
      });
    });

    it('should maintain form order in returned bundles', () => {
      const forms = [
        createMockForm({ formId: 'alpha', changeNumber: 'CHG001' }),
        createMockForm({ formId: 'beta', changeNumber: 'CHG002' }),
        createMockForm({ formId: 'gamma', changeNumber: 'CHG003' })
      ];
      
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Bundles should be in same order as input forms
      expect(bundles[0].formId).toBe('alpha');
      expect(bundles[1].formId).toBe('beta');
      expect(bundles[2].formId).toBe('gamma');
    });
  });

  describe('Empty Input', () => {
    it('should return empty array for empty forms array', () => {
      const bundles = buildArtifactBundles([], 'Dark Mode');
      
      expect(bundles).toEqual([]);
      expect(bundles).toHaveLength(0);
    });
  });
});
