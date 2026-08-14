/**
 * Integration tests for delivery orchestration
 *
 * Tests the complete orchestration pipeline from bundle building through
 * sequential delivery, verifying that buildArtifactBundles and deliverArtifacts
 * work together correctly.
 *
 * The generate action produces exactly one artifact per form: the notification
 * rendered to a PNG and opened in a new browser tab. Nothing is downloaded.
 *
 * Requirements: 10.4-10.8, 11.1-11.4, 13.1-13.4, 14.1-14.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildArtifactBundles } from './bundleBuilder';
import { deliverArtifacts } from './sequentialDelivery';
import type { DeploymentFormData, Application } from '../types/models';
import { templateProvider } from './templateProvider';
import * as artifactGeneration from './artifactGeneration';

// Mock the artifact generation module (only the PNG delivery operation is used)
vi.mock('./artifactGeneration', () => ({
  openAndDownloadPNG: vi.fn()
}));

describe('Delivery Orchestration Integration Tests', () => {
  const mockApplication1: Application = {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  };

  const mockApplication2: Application = {
    id: 'learning-management',
    name: 'Learning Management',
    notificationHeader: 'Learning Management Deployment Notification'
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
    deploymentDate: new Date('2025-03-05T12:00:00Z'),
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
    templateProvider.setTemplate('light', '<html><body class="light">{{NOTIFICATION_HEADER}} {{DEPLOYMENT_ID}}</body></html>');
    templateProvider.setTemplate('dark', '<html><body class="dark">{{NOTIFICATION_HEADER}} {{DEPLOYMENT_ID}}</body></html>');

    // Mock the single delivery operation to succeed by default
    vi.mocked(artifactGeneration.openAndDownloadPNG).mockResolvedValue(true);

    vi.useFakeTimers();
  });

  afterEach(() => {
    templateProvider.clear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Requirement 11.1: N forms → N artifacts generation', () => {
    it('should generate 1 artifact for 1 form', async () => {
      // Arrange
      const forms = [createMockForm({ formId: 'form-1' })];

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(bundles).toHaveLength(1);
      expect(result.total).toBe(1); // 1 form × 1 artifact
      expect(result.successful).toBe(1);
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(1);
    });

    it('should generate 3 artifacts for 3 forms', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG111' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG222' }),
        createMockForm({ formId: 'form-3', changeNumber: 'CHG333' })
      ];

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(bundles).toHaveLength(3);
      expect(result.total).toBe(3); // 3 forms × 1 artifact
      expect(result.successful).toBe(3);
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(3);
    });

    it('should generate 5 artifacts for 5 forms', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG111' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG222' }),
        createMockForm({ formId: 'form-3', changeNumber: 'CHG333' }),
        createMockForm({ formId: 'form-4', changeNumber: 'CHG444' }),
        createMockForm({ formId: 'form-5', changeNumber: 'CHG555' })
      ];

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(bundles).toHaveLength(5);
      expect(result.total).toBe(5); // 5 forms × 1 artifact
      expect(result.successful).toBe(5);
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(5);
    });
  });

  describe('Requirement 13.1, 13.2: Sequential ordering with 500ms intervals', () => {
    it('should process forms sequentially in order', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG111' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG222' })
      ];
      const callOrder: string[] = [];

      vi.mocked(artifactGeneration.openAndDownloadPNG).mockImplementation(async (html: string) => {
        const formId = html.includes('CHG111') ? 'form-1' : 'form-2';
        callOrder.push(`PNG-${formId}`);
        return true;
      });

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      await resultPromise;

      // Assert: Order should be PNG-form-1, PNG-form-2
      expect(callOrder).toEqual(['PNG-form-1', 'PNG-form-2']);
    });

    it('should wait at least 500ms between forms', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' })
      ];
      const timestamps: number[] = [];

      vi.mocked(artifactGeneration.openAndDownloadPNG).mockImplementation(async () => {
        timestamps.push(Date.now());
        return true;
      });

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      await resultPromise;

      // Assert: Check 500ms interval between consecutive tab openings
      for (let i = 1; i < timestamps.length; i++) {
        const interval = timestamps[i]! - timestamps[i - 1]!;
        expect(interval).toBeGreaterThanOrEqual(500);
      }
    });
  });

  describe('Requirement 13.3: Popup blocked handling (file still downloaded)', () => {
    it('should record a popup block but still count the download as delivered', async () => {
      // Arrange
      const forms = [createMockForm({ formId: 'form-1' })];
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockResolvedValue(false); // Tab blocked

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert: the file downloaded, so this is a success with an informational flag
      expect(result.popupBlocked).toBe(true);
      expect(result.total).toBe(1);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should flag popup blocking while delivering all forms', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG111' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG222' })
      ];

      // Block the tab for form-1 only (its file still downloads)
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockImplementation(async (html: string) => {
        return html.includes('CHG222'); // Block form-1 (CHG111), open form-2 (CHG222)
      });

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert: Both forms delivered (downloaded), form-1 tab was blocked
      expect(result.total).toBe(2); // 2 forms × 1 artifact
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.popupBlocked).toBe(true);
    });
  });

  describe('Requirement 13.4: PNG rendering failure (continue with other forms)', () => {
    it('should record the error when PNG rendering fails', async () => {
      // Arrange
      const forms = [createMockForm({ formId: 'form-1' })];
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockRejectedValue(
        new Error('PNG generation failed')
      );

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(result.total).toBe(1);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.artifactType).toBe('PNG');
    });

    it('should continue with other forms when one form fails', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG111' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG222' })
      ];

      // Fail form-1 only
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockImplementation(async (html: string) => {
        if (html.includes('CHG111')) {
          throw new Error('PNG failed for form-1');
        }
        return true;
      });

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert: Form-2 still processed
      expect(result.total).toBe(2); // 2 forms × 1 artifact
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(2);
    });

    it('should handle failures across multiple forms', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG111' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG222' }),
        createMockForm({ formId: 'form-3', changeNumber: 'CHG333' })
      ];

      // form-1 tab blocked (still downloads), form-2 throws, form-3 succeeds
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockImplementation(async (html: string) => {
        if (html.includes('CHG111')) return false; // tab blocked, file downloaded
        if (html.includes('CHG222')) throw new Error('PNG failed for form-2');
        return true;
      });

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert: only the render failure (form-2) counts as failed
      expect(result.total).toBe(3); // 3 forms × 1 artifact
      expect(result.successful).toBe(2); // form-1 (downloaded) + form-3
      expect(result.failed).toBe(1); // form-2 render failure
      expect(result.errors).toHaveLength(1);
      expect(result.popupBlocked).toBe(true);
    });
  });

  describe('Requirement 11.2: Per-form data isolation', () => {
    it('should ensure each bundle contains only its form data', async () => {
      // Arrange
      const forms = [
        createMockForm({
          formId: 'form-1',
          changeNumber: 'CHG111',
          contactName: 'Alice'
        }),
        createMockForm({
          formId: 'form-2',
          changeNumber: 'CHG222',
          contactName: 'Bob'
        })
      ];

      // Act: Build bundles
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Assert: Each bundle should contain only its form's data
      expect(bundles[0]?.formData.changeNumber).toBe('CHG111');
      expect(bundles[0]?.formData.contactName).toBe('Alice');
      expect(bundles[0]?.htmlContent).toContain('CHG111');
      expect(bundles[0]?.htmlContent).not.toContain('CHG222');

      expect(bundles[1]?.formData.changeNumber).toBe('CHG222');
      expect(bundles[1]?.formData.contactName).toBe('Bob');
      expect(bundles[1]?.htmlContent).toContain('CHG222');
      expect(bundles[1]?.htmlContent).not.toContain('CHG111');
    });

    it('should maintain data isolation during delivery', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG111' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG222' })
      ];
      const deliveredContent: string[] = [];

      vi.mocked(artifactGeneration.openAndDownloadPNG).mockImplementation(async (html: string) => {
        deliveredContent.push(html);
        return true;
      });

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      await resultPromise;

      // Assert: Each delivered artifact should contain only its form's data
      expect(deliveredContent).toHaveLength(2);
      expect(deliveredContent[0]).toContain('CHG111');
      expect(deliveredContent[0]).not.toContain('CHG222');
      expect(deliveredContent[1]).toContain('CHG222');
      expect(deliveredContent[1]).not.toContain('CHG111');
    });
  });

  describe('Requirement 14.1, 14.3: Collision handling applied to file names', () => {
    it('should apply collision suffix to colliding forms', async () => {
      // Arrange: Create forms with same application, environment, change number, and date
      const forms = [
        createMockForm({
          formId: 'form-1',
          changeNumber: 'CHG12345',
          application: mockApplication1,
          environment: 'PROD',
          deploymentDate: new Date('2025-03-05T12:00:00Z')
        }),
        createMockForm({
          formId: 'form-2',
          changeNumber: 'CHG12345',
          application: mockApplication1,
          environment: 'PROD',
          deploymentDate: new Date('2025-03-05T12:00:00Z')
        }),
        createMockForm({
          formId: 'form-3',
          changeNumber: 'CHG12345',
          application: mockApplication1,
          environment: 'PROD',
          deploymentDate: new Date('2025-03-05T12:00:00Z')
        })
      ];

      // Act: Build bundles
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Assert: File names should have collision suffixes
      const baseFileName = 'Crew_Portal_PROD_CHG12345_20250305';
      expect(bundles[0]?.fileName).toBe(baseFileName);
      expect(bundles[1]?.fileName).toBe(`${baseFileName}-1`);
      expect(bundles[2]?.fileName).toBe(`${baseFileName}-2`);
    });

    it('should not add suffix when forms have different identifiers', async () => {
      // Arrange: Create non-colliding forms
      const forms = [
        createMockForm({
          formId: 'form-1',
          changeNumber: 'CHG111'
        }),
        createMockForm({
          formId: 'form-2',
          changeNumber: 'CHG222' // Different change number
        })
      ];

      // Act: Build bundles
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Assert: No collision suffixes should be added
      expect(bundles[0]?.fileName).toBe('Crew_Portal_PROD_CHG111_20250305');
      expect(bundles[1]?.fileName).toBe('Crew_Portal_PROD_CHG222_20250305');
      expect(bundles[0]?.fileName).not.toContain('-1');
      expect(bundles[1]?.fileName).not.toContain('-1');
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle empty forms array gracefully', async () => {
      // Arrange
      const forms: DeploymentFormData[] = [];

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(bundles).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(artifactGeneration.openAndDownloadPNG).not.toHaveBeenCalled();
    });

    it('should handle complete delivery failure gracefully', async () => {
      // Arrange
      const forms = [createMockForm({ formId: 'form-1' })];
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockRejectedValue(new Error('PNG failed'));

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert: The artifact fails but the process completes
      expect(result.total).toBe(1);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should handle mixed theme selection correctly', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1' }),
        createMockForm({ formId: 'form-2' })
      ];

      // Act: Build bundles with Light Mode
      const lightBundles = buildArtifactBundles(forms, 'Light Mode');

      // Assert: All bundles should use light theme
      expect(lightBundles[0]?.htmlContent).toContain('class="light"');
      expect(lightBundles[1]?.htmlContent).toContain('class="light"');

      // Act: Build bundles with Dark Mode
      const darkBundles = buildArtifactBundles(forms, 'Dark Mode');

      // Assert: All bundles should use dark theme
      expect(darkBundles[0]?.htmlContent).toContain('class="dark"');
      expect(darkBundles[1]?.htmlContent).toContain('class="dark"');
    });

    it('should handle forms with different applications correctly', async () => {
      // Arrange
      const forms = [
        createMockForm({
          formId: 'form-1',
          application: mockApplication1,
          changeNumber: 'CHG111'
        }),
        createMockForm({
          formId: 'form-2',
          application: mockApplication2,
          changeNumber: 'CHG222'
        })
      ];

      // Act: Build bundles
      const bundles = buildArtifactBundles(forms, 'Dark Mode');

      // Assert: Each bundle should reflect its form's application
      expect(bundles[0]?.fileName).toContain('Crew_Portal');
      expect(bundles[1]?.fileName).toContain('Learning_Management');
      expect(bundles[0]?.formData.application?.name).toBe('Crew Portal');
      expect(bundles[1]?.formData.application?.name).toBe('Learning Management');
    });
  });

  describe('Performance and scalability', () => {
    it('should handle maximum capacity of 5 forms efficiently', async () => {
      // Arrange: Maximum 5 forms
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG111' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG222' }),
        createMockForm({ formId: 'form-3', changeNumber: 'CHG333' }),
        createMockForm({ formId: 'form-4', changeNumber: 'CHG444' }),
        createMockForm({ formId: 'form-5', changeNumber: 'CHG555' })
      ];

      // Act: Build bundles and deliver
      const startTime = Date.now();
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;
      const endTime = Date.now();

      // Assert
      expect(bundles).toHaveLength(5);
      expect(result.total).toBe(5); // 5 forms × 1 artifact
      expect(result.successful).toBe(5);

      // With 5 forms and 500ms intervals between them, minimum time is
      // (5 - 1) × 500ms = 2000ms
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThanOrEqual(2000);
    });

    it('should maintain consistent ordering with maximum forms', async () => {
      // Arrange
      const forms = [
        createMockForm({ formId: 'form-1', changeNumber: 'CHG111' }),
        createMockForm({ formId: 'form-2', changeNumber: 'CHG222' }),
        createMockForm({ formId: 'form-3', changeNumber: 'CHG333' }),
        createMockForm({ formId: 'form-4', changeNumber: 'CHG444' }),
        createMockForm({ formId: 'form-5', changeNumber: 'CHG555' })
      ];
      const callOrder: string[] = [];

      // Helper to identify form by change number
      const getFormId = (html: string): string => {
        if (html.includes('CHG111')) return 'form-1';
        if (html.includes('CHG222')) return 'form-2';
        if (html.includes('CHG333')) return 'form-3';
        if (html.includes('CHG444')) return 'form-4';
        if (html.includes('CHG555')) return 'form-5';
        return 'unknown';
      };

      vi.mocked(artifactGeneration.openAndDownloadPNG).mockImplementation(async (html: string) => {
        callOrder.push(`PNG-${getFormId(html)}`);
        return true;
      });

      // Act: Build bundles and deliver
      const bundles = buildArtifactBundles(forms, 'Dark Mode');
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      await resultPromise;

      // Assert: Order should be maintained for all 5 artifacts
      expect(callOrder).toEqual([
        'PNG-form-1',
        'PNG-form-2',
        'PNG-form-3',
        'PNG-form-4',
        'PNG-form-5'
      ]);
    });
  });
});
