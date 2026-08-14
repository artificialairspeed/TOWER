/**
 * Sequential Delivery Orchestration
 * 
 * This module implements the sequential delivery pacer that opens HTML tabs
 * and downloads PDF/PNG artifacts with 500ms intervals between operations.
 * 
 * Task: 16.2
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

import type { ArtifactBundle, DeliveryResult } from '../types/models';
import { openAndDownloadPNG } from './artifactGeneration';

/**
 * Minimum interval between artifact deliveries (milliseconds)
 * Requirement 13.1, 13.2: 500ms minimum interval
 */
const DELIVERY_INTERVAL_MS = 500;

/**
 * Delivers artifacts sequentially with 500ms intervals
 * 
 * Processes artifact bundles in order, delivering all three artifact types
 * (HTML tab, PDF download, PNG download) for each form with 500ms delays
 * between each operation to prevent browser throttling.
 * 
 * Requirements:
 * - 13.1: Open HTML tabs one at a time with 500ms intervals
 * - 13.2: Download PDF/PNG one at a time with 500ms intervals
 * - 13.3: Display message if popup blocked, continue with remaining
 * - 13.4: Continue on download failure, display message for failed artifacts
 * 
 * @param bundles - Array of artifact bundles to deliver, processed in order
 * @param onProgress - Optional callback to report progress (current artifact count)
 * @returns Promise resolving to delivery result with success/failure counts
 * 
 * @example
 * ```typescript
 * const bundles = buildArtifactBundles(forms, 'Dark Mode');
 * const result = await deliverArtifacts(bundles, (current) => {
 *   console.log(`Progress: ${current}/${bundles.length * 3}`);
 * });
 * console.log(`Delivered ${result.successful}/${result.total} artifacts`);
 * if (result.popupBlocked) {
 *   console.log('Some HTML tabs were blocked');
 * }
 * ```
 */
export async function deliverArtifacts(
  bundles: ArtifactBundle[],
  onProgress?: (current: number) => void
): Promise<DeliveryResult> {
  const result: DeliveryResult = {
    total: bundles.length, // Exactly one artifact (PNG tab) per bundle
    successful: 0,
    failed: 0,
    errors: [],
    popupBlocked: false
  };

  let artifactCount = 0;

  // Process each bundle sequentially in the order provided
  // Requirement 13.1, 13.2: Process in form order
  for (let i = 0; i < bundles.length; i++) {
    const bundle = bundles[i];
    if (!bundle) continue; // TypeScript guard
    const isLastBundle = i === bundles.length - 1;

    // Deliver the single artifact: render PNG, download it, and open a new tab
    await deliverPNG(bundle, result);
    artifactCount++;
    onProgress?.(artifactCount);

    // Pace tab openings to avoid browser throttling (except after the last one)
    if (!isLastBundle) {
      await delay(DELIVERY_INTERVAL_MS);
    }
  }

  return result;
}

/**
 * Delivers the single artifact for a bundle: renders the notification to a PNG,
 * downloads it automatically, and opens it in a new browser tab.
 *
 * The download is the guaranteed deliverable (it is not subject to popup
 * blocking), so as long as the image renders the artifact counts as delivered.
 * If the new tab is blocked, the block is recorded for informational purposes
 * but the artifact is still considered successful (Requirement 13.3).
 * If rendering fails, the artifact is recorded as failed and delivery continues
 * with the remaining forms (Requirement 13.4).
 *
 * @param bundle - Artifact bundle to deliver
 * @param result - Delivery result to update
 */
async function deliverPNG(
  bundle: ArtifactBundle,
  result: DeliveryResult
): Promise<void> {
  try {
    const opened = await openAndDownloadPNG(bundle.htmlContent, bundle.fileName);

    // The file downloaded successfully regardless of whether the tab opened.
    result.successful++;

    if (!opened) {
      // Requirement 13.3: Note that the preview tab was blocked; the file was
      // still downloaded, so this is informational rather than a failure.
      result.popupBlocked = true;
    }
  } catch (error) {
    // Requirement 13.4: Continue on failure, display message
    result.failed++;
    result.errors.push({
      formId: bundle.formId,
      artifactType: 'PNG',
      message: `Failed to generate PNG: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error : new Error(String(error))
    });
  }
}

/**
 * Delays execution for the specified duration
 * 
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
