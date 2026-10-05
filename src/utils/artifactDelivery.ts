/**
 * Artifact Delivery
 *
 * This module delivers the generated artifact for the deployment form: it
 * renders the notification to a PNG and opens it in a new browser tab for
 * viewing.
 *
 * Requirements: 13.3, 13.4
 */

import type { ArtifactBundle, DeliveryResult } from '../types/models';
import { openPNGInNewTab } from './artifactGeneration';

/**
 * Delivers the artifact for a bundle: renders the notification to a PNG and
 * opens it in a new browser tab for viewing.
 *
 * The PNG is displayed in the new tab without downloading. If the new tab is
 * blocked, the block is recorded but the artifact is still considered
 * successful since the image was rendered (Requirement 13.3). If rendering
 * fails, the artifact is recorded as failed (Requirement 13.4).
 *
 * @param bundle - Artifact bundle to deliver
 * @returns Promise resolving to the delivery result
 *
 * @example
 * ```typescript
 * const bundle = buildArtifactBundle(form);
 * const result = await deliverArtifact(bundle);
 * console.log(`Delivered ${result.successful}/${result.total} artifacts`);
 * if (result.popupBlocked) {
 *   console.log('The tab was blocked');
 * }
 * ```
 */
export async function deliverArtifact(bundle: ArtifactBundle): Promise<DeliveryResult> {
  const result: DeliveryResult = {
    total: 1,
    successful: 0,
    failed: 0,
    errors: [],
    popupBlocked: false
  };

  try {
    const opened = await openPNGInNewTab(bundle.htmlContent);

    // The PNG rendered successfully.
    result.successful++;

    if (!opened) {
      // Requirement 13.3: Note that the tab was blocked, but rendering succeeded.
      result.popupBlocked = true;
    }
  } catch (error) {
    // Requirement 13.4: Record the failure with a descriptive message.
    result.failed++;
    result.errors.push({
      formId: bundle.formId,
      artifactType: 'PNG',
      message: `Failed to generate PNG: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error : new Error(String(error))
    });
  }

  return result;
}
