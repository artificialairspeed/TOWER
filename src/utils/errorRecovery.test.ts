/**
 * Unit tests for error recovery and reporting
 * 
 * Task 16.3: Implement error recovery and reporting
 * Requirements: 10.8, 11.4, 13.3, 13.4
 * 
 * These tests verify that error recovery correctly handles failures during
 * artifact bundle building and provides detailed error reporting while
 * continuing to process remaining forms.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildArtifactBundlesWithRecovery,
  formatGenerationError,
  getErrorSummary,
  groupErrorsByForm,
  type BundleBuildResult
} from './errorRecovery';
import type { DeploymentFormData, Application, GenerationError } from '../types/models';
import { templateProvider } from './templateProvider';

// Mock the bundleBuilder module
vi.mock('./bundleBuilder', () => ({
  buildArtifactBundles: vi.fn()
}));

// Import the mocked function
import { buildArtifactBundles } from './bundleBuilder';

describe('buildArtifactBundlesWithRecovery', () => {
  const mockApplication: Application = {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  };

  const createMockForm = (overrides?: Partial<DeploymentFormData>): DeploymentFormData => ({
    formId: 'form-1',
    application: mockApplication,
    changeNumber: 'CHG12345',
    releaseVersion: 'v5.4.1',
    environment: 'PROD',
    deploymentTitle: '[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]',
    deploymentDate: new Date('2025-03-05T00:00:00Z'),
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
    // Set up mock templates
    templateProvider.setTemplate('light', '<html><body class="light">{{NOTIFICATION_HEADER}}</body></html>');
    templateProvider.setTemplate('dark', '<html><body class="dark">{{NOTIFICATION_HEADER}}</body></html>');
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    templateProvider.clear();
  });

  describe('Success Scenarios', () => {
    it('should build all bundles successfully when no errors occur', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' }),
        createMockForm({ formId: 'form-3' })
      ];

      const mockBundles = forms.map(form => ({
        formId: form.formId,
        htmlContent: `<html>${form.formId}</html>`,
        fileName: `test-${form.formId}`,
        formData: form
      }));

      vi.mocked(buildArtifactBundles).mockReturnValue(mockBundles);

      const result = buildArtifactBundlesWithRecovery(forms, 'Dark Mode');

      expect(result.bundles).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(result.bundles).toEqual(mockBundles);
    });

    it('should return empty bundles array for empty input', () => {
      vi.mocked(buildArtifactBundles).mockReturnValue([]);

      const result = buildArtifactBundlesWithRecovery([], 'Dark Mode');

      expect(result.bundles).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should build single bundle successfully', () => {
      const form = createMockForm({ formId: 'form-1' });
      const mockBundle = {
        formId: 'form-1',
        htmlContent: '<html>test</html>',
        fileName: 'test-bundle',
        formData: form
      };

      vi.mocked(buildArtifactBundles).mockReturnValue([mockBundle]);

      const result = buildArtifactBundlesWithRecovery([form], 'Dark Mode');

      expect(result.bundles).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.bundles[0]).toEqual(mockBundle);
    });
  });

  describe('Error Recovery - Single Form Failure', () => {
    it('should continue with remaining forms when one form fails', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' }),
        createMockForm({ formId: 'form-3' })
      ];

      // Mock: batch fails, then individual calls succeed except form-2
      vi.mocked(buildArtifactBundles)
        .mockImplementationOnce(() => {
          throw new Error('Batch build failed');
        })
        .mockImplementationOnce(() => [{
          formId: 'form-1',
          htmlContent: '<html>form-1</html>',
          fileName: 'test-form-1',
          formData: forms[0]
        }])
        .mockImplementationOnce(() => {
          throw new Error('Form 2 build failed');
        })
        .mockImplementationOnce(() => [{
          formId: 'form-3',
          htmlContent: '<html>form-3</html>',
          fileName: 'test-form-3',
          formData: forms[2]
        }]);

      const result = buildArtifactBundlesWithRecovery(forms, 'Dark Mode');

      // Should have 2 successful bundles (form-1 and form-3)
      expect(result.bundles).toHaveLength(2);
      expect(result.bundles[0].formId).toBe('form-1');
      expect(result.bundles[1].formId).toBe('form-3');

      // Should have 1 error (form-2)
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].formId).toBe('form-2');
      expect(result.errors[0].artifactType).toBe('HTML');
      expect(result.errors[0].message).toContain('Form 2 build failed');
    });

    it('should handle Error objects in bundle build failure', () => {
      const form = createMockForm({ formId: 'form-1' });

      vi.mocked(buildArtifactBundles)
        .mockImplementationOnce(() => {
          throw new Error('Batch failed');
        })
        .mockImplementationOnce(() => {
          throw new Error('Missing required field');
        });

      const result = buildArtifactBundlesWithRecovery([form], 'Dark Mode');

      expect(result.bundles).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Missing required field');
      expect(result.errors[0].error).toBeInstanceOf(Error);
    });

    it('should handle non-Error exceptions in bundle build failure', () => {
      const form = createMockForm({ formId: 'form-1' });

      vi.mocked(buildArtifactBundles)
        .mockImplementationOnce(() => {
          throw new Error('Batch failed');
        })
        .mockImplementationOnce(() => {
          throw 'String error';
        });

      const result = buildArtifactBundlesWithRecovery([form], 'Dark Mode');

      expect(result.bundles).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('String error');
    });
  });

  describe('Error Recovery - Multiple Form Failures', () => {
    it('should handle all forms failing', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' }),
        createMockForm({ formId: 'form-3' })
      ];

      // Mock: batch fails, then all individual calls fail
      vi.mocked(buildArtifactBundles)
        .mockImplementation(() => {
          throw new Error('Build failed');
        });

      const result = buildArtifactBundlesWithRecovery(forms, 'Dark Mode');

      expect(result.bundles).toHaveLength(0);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0].formId).toBe('form-1');
      expect(result.errors[1].formId).toBe('form-2');
      expect(result.errors[2].formId).toBe('form-3');
    });

    it('should handle first and last forms failing', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' }),
        createMockForm({ formId: 'form-3' })
      ];

      // Mock: batch fails, first and last fail, middle succeeds
      vi.mocked(buildArtifactBundles)
        .mockImplementationOnce(() => {
          throw new Error('Batch failed');
        })
        .mockImplementationOnce(() => {
          throw new Error('Form 1 failed');
        })
        .mockImplementationOnce(() => [{
          formId: 'form-2',
          htmlContent: '<html>form-2</html>',
          fileName: 'test-form-2',
          formData: forms[1]
        }])
        .mockImplementationOnce(() => {
          throw new Error('Form 3 failed');
        });

      const result = buildArtifactBundlesWithRecovery(forms, 'Dark Mode');

      expect(result.bundles).toHaveLength(1);
      expect(result.bundles[0].formId).toBe('form-2');
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].formId).toBe('form-1');
      expect(result.errors[1].formId).toBe('form-3');
    });
  });

  describe('Error Recovery - Edge Cases', () => {
    it('should handle empty bundle returned (should not happen but defensive)', () => {
      const form = createMockForm({ formId: 'form-1' });

      vi.mocked(buildArtifactBundles)
        .mockImplementationOnce(() => {
          throw new Error('Batch failed');
        })
        .mockImplementationOnce(() => []); // Empty array instead of single bundle

      const result = buildArtifactBundlesWithRecovery([form], 'Dark Mode');

      expect(result.bundles).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].formId).toBe('form-1');
      expect(result.errors[0].message).toContain('No bundle returned');
    });

    it('should preserve form order in results', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' }),
        createMockForm({ formId: 'form-3' })
      ];

      // Mock: batch fails, then all succeed individually
      vi.mocked(buildArtifactBundles)
        .mockImplementationOnce(() => {
          throw new Error('Batch failed');
        })
        .mockImplementation((inputForms) => [{
          formId: inputForms[0].formId,
          htmlContent: `<html>${inputForms[0].formId}</html>`,
          fileName: `test-${inputForms[0].formId}`,
          formData: inputForms[0]
        }]);

      const result = buildArtifactBundlesWithRecovery(forms, 'Dark Mode');

      expect(result.bundles).toHaveLength(3);
      expect(result.bundles[0].formId).toBe('form-1');
      expect(result.bundles[1].formId).toBe('form-2');
      expect(result.bundles[2].formId).toBe('form-3');
    });
  });

  describe('Fast Path Optimization', () => {
    it('should use fast path when batch succeeds', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' })
      ];

      const mockBundles = forms.map(form => ({
        formId: form.formId,
        htmlContent: `<html>${form.formId}</html>`,
        fileName: `test-${form.formId}`,
        formData: form
      }));

      vi.mocked(buildArtifactBundles).mockReturnValue(mockBundles);

      buildArtifactBundlesWithRecovery(forms, 'Dark Mode');

      // Should only call buildArtifactBundles once (batch call, no individual calls)
      expect(buildArtifactBundles).toHaveBeenCalledTimes(1);
      expect(buildArtifactBundles).toHaveBeenCalledWith(forms, 'Dark Mode');
    });

    it('should fall back to individual processing when batch fails', () => {
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' })
      ];

      // Mock: batch fails, individuals succeed
      vi.mocked(buildArtifactBundles)
        .mockImplementationOnce(() => {
          throw new Error('Batch failed');
        })
        .mockImplementation((inputForms) => [{
          formId: inputForms[0].formId,
          htmlContent: `<html>${inputForms[0].formId}</html>`,
          fileName: `test-${inputForms[0].formId}`,
          formData: inputForms[0]
        }]);

      buildArtifactBundlesWithRecovery(forms, 'Dark Mode');

      // Should call buildArtifactBundles 3 times: 1 batch + 2 individual
      expect(buildArtifactBundles).toHaveBeenCalledTimes(3);
    });
  });
});

describe('formatGenerationError', () => {
  it('should format error with form name', () => {
    const error: GenerationError = {
      formId: 'form-1',
      artifactType: 'PDF',
      message: 'Generation library error'
    };

    const result = formatGenerationError(error, 'Crew Portal Deployment');

    expect(result).toBe('Failed to generate PDF for Crew Portal Deployment: Generation library error');
  });

  it('should format error without form name', () => {
    const error: GenerationError = {
      formId: 'form-1',
      artifactType: 'PNG',
      message: 'Image conversion failed'
    };

    const result = formatGenerationError(error);

    expect(result).toBe('Failed to generate PNG for form form-1: Image conversion failed');
  });

  it('should handle HTML artifact type', () => {
    const error: GenerationError = {
      formId: 'form-2',
      artifactType: 'HTML',
      message: 'Template not found'
    };

    const result = formatGenerationError(error, 'Admin Portal');

    expect(result).toBe('Failed to generate HTML for Admin Portal: Template not found');
  });

  it('should handle all artifact types', () => {
    const types: Array<'HTML' | 'PDF' | 'PNG'> = ['HTML', 'PDF', 'PNG'];
    
    types.forEach(type => {
      const error: GenerationError = {
        formId: 'form-1',
        artifactType: type,
        message: 'Test error'
      };

      const result = formatGenerationError(error, 'Test Form');
      expect(result).toContain(type);
    });
  });
});

describe('getErrorSummary', () => {
  it('should return "No errors" for empty array', () => {
    const result = getErrorSummary([]);
    expect(result).toBe('No errors');
  });

  it('should return singular message for one error', () => {
    const errors: GenerationError[] = [
      { formId: 'form-1', artifactType: 'PDF', message: 'Test' }
    ];

    const result = getErrorSummary(errors);
    expect(result).toBe('1 artifact failed to generate');
  });

  it('should return plural message for multiple errors', () => {
    const errors: GenerationError[] = [
      { formId: 'form-1', artifactType: 'PDF', message: 'Test 1' },
      { formId: 'form-2', artifactType: 'PNG', message: 'Test 2' }
    ];

    const result = getErrorSummary(errors);
    expect(result).toBe('2 artifacts failed to generate');
  });

  it('should handle large number of errors', () => {
    const errors: GenerationError[] = Array.from({ length: 15 }, (_, i) => ({
      formId: `form-${i}`,
      artifactType: 'PDF' as const,
      message: `Error ${i}`
    }));

    const result = getErrorSummary(errors);
    expect(result).toBe('15 artifacts failed to generate');
  });
});

describe('groupErrorsByForm', () => {
  it('should return empty map for no errors', () => {
    const result = groupErrorsByForm([]);
    expect(result.size).toBe(0);
  });

  it('should group single error by form', () => {
    const errors: GenerationError[] = [
      { formId: 'form-1', artifactType: 'PDF', message: 'Test' }
    ];

    const result = groupErrorsByForm(errors);

    expect(result.size).toBe(1);
    expect(result.get('form-1')).toHaveLength(1);
    expect(result.get('form-1')?.[0].artifactType).toBe('PDF');
  });

  it('should group multiple errors for same form', () => {
    const errors: GenerationError[] = [
      { formId: 'form-1', artifactType: 'PDF', message: 'PDF error' },
      { formId: 'form-1', artifactType: 'PNG', message: 'PNG error' },
      { formId: 'form-1', artifactType: 'HTML', message: 'HTML error' }
    ];

    const result = groupErrorsByForm(errors);

    expect(result.size).toBe(1);
    expect(result.get('form-1')).toHaveLength(3);
    
    const formErrors = result.get('form-1')!;
    expect(formErrors.map(e => e.artifactType)).toEqual(['PDF', 'PNG', 'HTML']);
  });

  it('should group errors across multiple forms', () => {
    const errors: GenerationError[] = [
      { formId: 'form-1', artifactType: 'PDF', message: 'Form 1 PDF' },
      { formId: 'form-1', artifactType: 'PNG', message: 'Form 1 PNG' },
      { formId: 'form-2', artifactType: 'HTML', message: 'Form 2 HTML' },
      { formId: 'form-3', artifactType: 'PDF', message: 'Form 3 PDF' }
    ];

    const result = groupErrorsByForm(errors);

    expect(result.size).toBe(3);
    expect(result.get('form-1')).toHaveLength(2);
    expect(result.get('form-2')).toHaveLength(1);
    expect(result.get('form-3')).toHaveLength(1);
  });

  it('should preserve error order within each form', () => {
    const errors: GenerationError[] = [
      { formId: 'form-1', artifactType: 'HTML', message: 'First' },
      { formId: 'form-1', artifactType: 'PDF', message: 'Second' },
      { formId: 'form-1', artifactType: 'PNG', message: 'Third' }
    ];

    const result = groupErrorsByForm(errors);
    const formErrors = result.get('form-1')!;

    expect(formErrors[0].message).toBe('First');
    expect(formErrors[1].message).toBe('Second');
    expect(formErrors[2].message).toBe('Third');
  });

  it('should handle forms with different numbers of errors', () => {
    const errors: GenerationError[] = [
      { formId: 'form-1', artifactType: 'PDF', message: 'Test' },
      { formId: 'form-2', artifactType: 'PDF', message: 'Test' },
      { formId: 'form-2', artifactType: 'PNG', message: 'Test' },
      { formId: 'form-2', artifactType: 'HTML', message: 'Test' },
      { formId: 'form-3', artifactType: 'HTML', message: 'Test' },
      { formId: 'form-3', artifactType: 'PNG', message: 'Test' }
    ];

    const result = groupErrorsByForm(errors);

    expect(result.size).toBe(3);
    expect(result.get('form-1')).toHaveLength(1);
    expect(result.get('form-2')).toHaveLength(3);
    expect(result.get('form-3')).toHaveLength(2);
  });
});
