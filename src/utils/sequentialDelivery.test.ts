/**
 * Unit tests for Sequential Delivery Orchestration
 *
 * Tests the sequential delivery pacer that renders each notification to a PNG,
 * downloads it, and opens it in a new browser tab, with 500ms intervals between
 * forms. Exactly one artifact is produced per form.
 *
 * The download is the guaranteed deliverable, so a blocked preview tab is
 * recorded via `popupBlocked` but does not count as a failure.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deliverArtifacts } from './sequentialDelivery';
import type { ArtifactBundle } from '../types/models';
import * as artifactGeneration from './artifactGeneration';

// Mock the artifact generation module
vi.mock('./artifactGeneration', () => ({
  openAndDownloadPNG: vi.fn()
}));

describe('Sequential Delivery Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Helper to create a mock artifact bundle
   */
  function createMockBundle(formId: string): ArtifactBundle {
    return {
      formId,
      htmlContent: `<html><body>${formId}</body></html>`,
      fileName: `test_${formId}`,
      formData: {
        formId,
        application: { id: 'test', name: 'Test App', notificationHeader: 'Test' },
        changeNumber: 'CHG123',
        releaseVersion: 'v1.0',
        environment: 'PROD',
        deploymentDate: new Date('2025-01-01'),
        startTime: new Date('2025-01-01T20:00:00'),
        endTime: new Date('2025-01-01T22:00:00'),
        hasOutage: false,
        outageStartDate: null,
        outageStartTime: null,
        outageEndDate: null,
        outageEndTime: null,
        changeItems: [{ id: '1', jiraNumber: 'JIRA-1', description: 'Test' }],
        impactItems: [{ id: '1', text: 'Test impact' }],
        contactName: 'Test User',
        contactEmail: 'test@example.com',
        contactPhone: '(555) 123-4567',
        deploymentTitle: '[CHG123] — [Test App: v1.0 - Deploy Product to PROD]'
      }
    };
  }

  describe('Basic delivery flow', () => {
    it('should deliver exactly one artifact per bundle (download + tab)', async () => {
      // Arrange
      const bundle = createMockBundle('form-1');
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockResolvedValue(true);

      // Act
      const resultPromise = deliverArtifacts([bundle]);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(1);
      expect(result.total).toBe(1); // 1 bundle × 1 artifact
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.popupBlocked).toBe(false);
    });

    it('should pass the HTML content and file name to openAndDownloadPNG', async () => {
      // Arrange
      const bundle = createMockBundle('form-1');
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockResolvedValue(true);

      // Act
      const resultPromise = deliverArtifacts([bundle]);
      await vi.runAllTimersAsync();
      await resultPromise;

      // Assert
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledWith(
        bundle.htmlContent,
        bundle.fileName
      );
    });

    it('should perform a single delivery operation per form', async () => {
      // Arrange
      const bundle = createMockBundle('form-1');
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockResolvedValue(true);

      // Act
      const resultPromise = deliverArtifacts([bundle]);
      await vi.runAllTimersAsync();
      await resultPromise;

      // Assert
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sequential ordering with 500ms intervals (Requirements 13.1, 13.2)', () => {
    it('should process bundles in the provided order', async () => {
      // Arrange
      const bundles = [
        createMockBundle('form-1'),
        createMockBundle('form-2'),
        createMockBundle('form-3')
      ];
      const callOrder: string[] = [];

      vi.mocked(artifactGeneration.openAndDownloadPNG).mockImplementation(async (html) => {
        callOrder.push(
          `PNG-${html.includes('form-1') ? '1' : html.includes('form-2') ? '2' : '3'}`
        );
        return true;
      });

      // Act
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      await resultPromise;

      // Assert - Verify strict sequential ordering
      expect(callOrder).toEqual(['PNG-1', 'PNG-2', 'PNG-3']);
    });

    it('should wait at least 500ms between bundles', async () => {
      // Arrange
      const bundles = [createMockBundle('form-1'), createMockBundle('form-2')];
      const timestamps: number[] = [];

      vi.mocked(artifactGeneration.openAndDownloadPNG).mockImplementation(async () => {
        timestamps.push(Date.now());
        return true;
      });

      // Act
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      await resultPromise;

      // Assert - Second delivery happens at least 500ms after the first
      expect(timestamps[1]! - timestamps[0]!).toBeGreaterThanOrEqual(500);
    });
  });

  describe('Multiple bundles (Requirement 11.1)', () => {
    it('should deliver exactly N artifacts for N bundles', async () => {
      // Arrange
      const bundles = [
        createMockBundle('form-1'),
        createMockBundle('form-2'),
        createMockBundle('form-3')
      ];
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockResolvedValue(true);

      // Act
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(result.total).toBe(3); // 3 bundles × 1 artifact each
      expect(result.successful).toBe(3);
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(3);
    });

    it('should handle five bundles (maximum)', async () => {
      // Arrange
      const bundles = [
        createMockBundle('form-1'),
        createMockBundle('form-2'),
        createMockBundle('form-3'),
        createMockBundle('form-4'),
        createMockBundle('form-5')
      ];
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockResolvedValue(true);

      // Act
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(result.total).toBe(5); // 5 bundles × 1 artifact each
      expect(result.successful).toBe(5);
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error handling (Requirements 13.3, 13.4)', () => {
    it('should still count success when the preview tab is blocked (file downloaded)', async () => {
      // Arrange
      const bundles = [createMockBundle('form-1'), createMockBundle('form-2')];
      vi.mocked(artifactGeneration.openAndDownloadPNG)
        .mockResolvedValueOnce(false) // First tab blocked (file still downloaded)
        .mockResolvedValueOnce(true); // Second tab opens

      // Act
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert - Requirement 13.3: download delivered, block is informational
      expect(result.popupBlocked).toBe(true);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(2);
    });

    it('should handle PNG rendering failure and continue', async () => {
      // Arrange
      const bundles = [createMockBundle('form-1'), createMockBundle('form-2')];
      vi.mocked(artifactGeneration.openAndDownloadPNG)
        .mockRejectedValueOnce(new Error('PNG generation failed'))
        .mockResolvedValueOnce(true);

      // Act
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert - Requirement 13.4: Continue with remaining forms
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.artifactType).toBe('PNG');
      expect(result.errors[0]?.formId).toBe('form-1');
      expect(result.errors[0]?.message).toContain('Failed to generate PNG');
      expect(result.errors[0]?.error).toBeDefined();

      // Verify second form was still processed
      expect(artifactGeneration.openAndDownloadPNG).toHaveBeenCalledTimes(2);
    });

    it('should handle a mix of a blocked tab and a rendering failure', async () => {
      // Arrange
      const bundles = [
        createMockBundle('form-1'),
        createMockBundle('form-2'),
        createMockBundle('form-3')
      ];
      vi.mocked(artifactGeneration.openAndDownloadPNG)
        .mockResolvedValueOnce(false) // form-1 tab blocked (still downloaded)
        .mockRejectedValueOnce(new Error('PNG failed')) // form-2 render failed
        .mockResolvedValueOnce(true); // form-3 fully succeeds

      // Act
      const resultPromise = deliverArtifacts(bundles);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(result.total).toBe(3);
      expect(result.successful).toBe(2); // form-1 (downloaded) + form-3
      expect(result.failed).toBe(1); // form-2 render failure
      expect(result.errors).toHaveLength(1);
      expect(result.popupBlocked).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty bundle array', async () => {
      // Arrange
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockResolvedValue(true);

      // Act
      const resultPromise = deliverArtifacts([]);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(result.total).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(artifactGeneration.openAndDownloadPNG).not.toHaveBeenCalled();
    });

    it('should record a failure when rendering fails for a bundle', async () => {
      // Arrange
      const bundle = createMockBundle('form-1');
      vi.mocked(artifactGeneration.openAndDownloadPNG).mockRejectedValue(
        new Error('render failed')
      );

      // Act
      const resultPromise = deliverArtifacts([bundle]);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Assert
      expect(result.total).toBe(1);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });
});
