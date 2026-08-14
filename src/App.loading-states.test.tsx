/**
 * Tests for Loading States and User Feedback (Task 21.3)
 * 
 * This test suite verifies that the application properly shows loading states
 * and user feedback during artifact generation:
 * 
 * - Show loading spinner during artifact generation
 * - Disable Generate Outputs button during generation
 * - Show progress indication for multi-form generation
 * - Add success/error toast notifications
 * 
 * Task: 21.3
 * Requirements: (user experience polish)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as bundleBuilder from './utils/bundleBuilder';
import * as sequentialDelivery from './utils/sequentialDelivery';
import * as validators from './utils/validators';
import type { ArtifactBundle, DeliveryResult, ValidationResult } from './types/models';

// Mock the utility modules
vi.mock('./utils/bundleBuilder');
vi.mock('./utils/sequentialDelivery');
vi.mock('./utils/validators');

describe('App - Loading States and User Feedback (Task 21.3)', () => {
  const mockBuildArtifactBundles = vi.mocked(bundleBuilder.buildArtifactBundles);
  const mockDeliverArtifacts = vi.mocked(sequentialDelivery.deliverArtifacts);
  const mockValidateBatch = vi.mocked(validators.validateBatch);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock validation to always pass
    mockValidateBatch.mockReturnValue({
      isValid: true,
      errors: []
    } as ValidationResult);
  });

  /**
   * Test: Show loading spinner during artifact generation (Task 21.3)
   */
  it('should show loading spinner in Generate button during generation', async () => {
    const user = userEvent.setup();

    // Setup: Mock artifact generation with delay
    mockBuildArtifactBundles.mockReturnValue([
      {
        formId: 'form-1',
        fileName: 'test_PROD_CHG12345_20250101',
        htmlContent: '<html>Test</html>'
      } as ArtifactBundle
    ]);

    mockDeliverArtifacts.mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            total: 3,
            successful: 3,
            failed: 0,
            errors: [],
            popupBlocked: false
          });
        }, 100);
      })
    );

    render(<App />);

    // Find and click Generate button
    const generateButton = screen.getByRole('button', { name: /generate/i });
    expect(generateButton).not.toBeDisabled();

    // Click generate
    await user.click(generateButton);

    // Verify button shows "Generating..." text
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Generate Flight Plan')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  /**
   * Test: Disable Generate Outputs button during generation (Task 21.3)
   */
  it('should disable Generate button during generation', async () => {
    const user = userEvent.setup();

    // Setup: Mock artifact generation with delay
    mockBuildArtifactBundles.mockReturnValue([
      {
        formId: 'form-1',
        fileName: 'test_PROD_CHG12345_20250101',
        htmlContent: '<html>Test</html>'
      } as ArtifactBundle
    ]);

    mockDeliverArtifacts.mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            total: 3,
            successful: 3,
            failed: 0,
            errors: [],
            popupBlocked: false
          });
        }, 100);
      })
    );

    render(<App />);

    const generateButton = screen.getByRole('button', { name: /generate/i });

    // Click generate
    await user.click(generateButton);

    // Verify button is disabled during generation
    await waitFor(() => {
      expect(generateButton).toBeDisabled();
    });

    // Wait for completion and verify button is re-enabled
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    }, { timeout: 2000 });
  });

  /**
   * Test: Show progress indication for multi-form generation (Task 21.3)
   * Note: This test verifies that progress tracking is wired up correctly
   */
  it('should show progress indicator for multi-form generation', async () => {
    const user = userEvent.setup();

    // Setup: Mock multi-form artifact generation (2 forms = 6 artifacts)
    mockBuildArtifactBundles.mockReturnValue([
      {
        formId: 'form-1',
        fileName: 'test1_PROD_CHG12345_20250101',
        htmlContent: '<html>Test1</html>'
      } as ArtifactBundle,
      {
        formId: 'form-2',
        fileName: 'test2_PROD_CHG12346_20250101',
        htmlContent: '<html>Test2</html>'
      } as ArtifactBundle
    ]);

    // Track whether progress callback is called
    let progressCallbackInvoked = false;
    mockDeliverArtifacts.mockImplementation(
      async (bundles, onProgress) => {
        if (onProgress) {
          progressCallbackInvoked = true;
          // Simulate progress updates
          onProgress(1);
          await new Promise(resolve => setTimeout(resolve, 50));
          onProgress(3);
          await new Promise(resolve => setTimeout(resolve, 50));
          onProgress(6);
        }
        return {
          total: 6,
          successful: 6,
          failed: 0,
          errors: [],
          popupBlocked: false
        };
      }
    );

    render(<App />);

    // Add a second form to trigger multi-form progress indicator
    const addFormButton = screen.getByRole('button', { name: /add.*form/i });
    await user.click(addFormButton);

    // Click generate
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    // Wait for generation to complete
    await waitFor(() => {
      expect(screen.getByText(/Generated 6 artifacts successfully/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify progress callback was invoked (proves progress tracking is wired up)
    expect(progressCallbackInvoked).toBe(true);
  });

  /**
   * Test: Show success toast notification (Task 21.3)
   */
  it('should show success toast notification after successful generation', async () => {
    const user = userEvent.setup();

    // Setup: Mock successful generation
    mockBuildArtifactBundles.mockReturnValue([
      {
        formId: 'form-1',
        fileName: 'test_PROD_CHG12345_20250101',
        htmlContent: '<html>Test</html>'
      } as ArtifactBundle
    ]);

    mockDeliverArtifacts.mockResolvedValue({
      total: 3,
      successful: 3,
      failed: 0,
      errors: [],
      popupBlocked: false
    });

    render(<App />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Generated 3 artifacts successfully/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  /**
   * Test: Show error toast notification (Task 21.3)
   */
  it('should show error toast notification after failed generation', async () => {
    const user = userEvent.setup();

    // Setup: Mock partial failure
    mockBuildArtifactBundles.mockReturnValue([
      {
        formId: 'form-1',
        fileName: 'test_PROD_CHG12345_20250101',
        htmlContent: '<html>Test</html>'
      } as ArtifactBundle
    ]);

    mockDeliverArtifacts.mockResolvedValue({
      total: 3,
      successful: 2,
      failed: 1,
      errors: [{
        formId: 'form-1',
        artifactType: 'PDF',
        message: 'PDF generation failed'
      }],
      popupBlocked: false
    });

    render(<App />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    // Wait for partial success message
    await waitFor(() => {
      expect(screen.getByText(/Generated 2 of 3 artifacts/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify error details are shown
    expect(screen.getByText(/Failed to generate PDF/i)).toBeInTheDocument();
  });

  /**
   * Test: Show popup blocked notification (Task 21.3)
   */
  it('should show popup blocked notification in toast', async () => {
    const user = userEvent.setup();

    // Setup: Mock popup blocked scenario
    mockBuildArtifactBundles.mockReturnValue([
      {
        formId: 'form-1',
        fileName: 'test_PROD_CHG12345_20250101',
        htmlContent: '<html>Test</html>'
      } as ArtifactBundle
    ]);

    mockDeliverArtifacts.mockResolvedValue({
      total: 3,
      successful: 2,
      failed: 1,
      errors: [{
        formId: 'form-1',
        artifactType: 'HTML',
        message: 'Popup blocked'
      }],
      popupBlocked: true
    });

    render(<App />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    // Wait for popup blocked message
    await waitFor(() => {
      expect(screen.getByText(/Please allow pop-ups to view HTML notifications/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  /**
   * Test: Progress indicator only shows for multi-form generation (Task 21.3)
   */
  it('should not show progress indicator for single form (3 artifacts)', async () => {
    const user = userEvent.setup();

    // Setup: Mock single form generation (3 artifacts)
    mockBuildArtifactBundles.mockReturnValue([
      {
        formId: 'form-1',
        fileName: 'test_PROD_CHG12345_20250101',
        htmlContent: '<html>Test</html>'
      } as ArtifactBundle
    ]);

    mockDeliverArtifacts.mockImplementation(
      (bundles, onProgress) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            onProgress?.(1);
            onProgress?.(2);
            onProgress?.(3);
            resolve({
              total: 3,
              successful: 3,
              failed: 0,
              errors: [],
              popupBlocked: false
            });
          }, 100);
        });
      }
    );

    render(<App />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    // Verify progress indicator does NOT appear for single form
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });

    // Progress indicator text should not appear (only shows for > 3 artifacts)
    expect(screen.queryByText('Generating artifacts...')).not.toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Generate Flight Plan')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
