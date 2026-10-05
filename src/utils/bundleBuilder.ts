/**
 * Artifact Bundle Builder
 *
 * This module builds the artifact bundle (HTML content + file name) for the
 * deployment form prior to delivery.
 *
 * Requirements: 10.4, 11.1, 11.2, 11.3, 12.4
 */

import type { DeploymentFormData, ArtifactBundle } from '../types/models';
import { generateHTML } from './htmlGenerator';
import { generateBaseFileName } from './fileNaming';

/**
 * Builds the artifact bundle for the deployment form.
 *
 * 1. Computes the file name for the form
 * 2. Generates the HTML content from the Flight Plan template
 * 3. Returns a bundle containing the HTML content and file name
 *
 * Requirements:
 * - 10.4: Generate HTML artifact containing all metadata
 * - 11.2: The artifact contains only its form's data
 * - 12.4: File names share identical base name differing only by extension
 *
 * @param form - Deployment form data to generate the artifact for
 * @returns The artifact bundle for the form
 * @throws Error if the file name cannot be computed or HTML generation fails
 *
 * @example
 * ```typescript
 * const bundle = buildArtifactBundle(form);
 * // { formId: 'form-1', htmlContent: '...', fileName: 'OQS_SimLog_PROD_CHG123_20250315', formData: form }
 * ```
 */
export function buildArtifactBundle(form: DeploymentFormData): ArtifactBundle {
  try {
    // Compute the file name for this form.
    const fileName = generateBaseFileName(form);

    if (!fileName) {
      throw new Error(
        'Failed to generate file name. ' +
          'This may indicate missing required fields (application, environment, change number, or date).'
      );
    }

    // Generate HTML content for this form (Requirement 10.4).
    const htmlContent = generateHTML(form);

    const bundle: ArtifactBundle = {
      formId: form.formId,
      htmlContent,
      fileName,
      formData: form
    };

    return bundle;
  } catch (error) {
    // Re-throw with form context for better error messages.
    throw new Error(
      `Failed to build artifact bundle for form ${form.formId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
