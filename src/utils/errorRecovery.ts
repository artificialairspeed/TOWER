/**
 * Error Recovery and Reporting
 * 
 * This module implements error recovery wrappers for artifact generation
 * that catch and report errors while allowing the process to continue.
 * 
 * Task: 16.3
 * Requirements: 10.8, 11.4, 13.3, 13.4
 */

import type { 
  ArtifactBundle, 
  DeploymentFormData, 
  Theme, 
  GenerationError 
} from '../types/models';
import { buildArtifactBundles } from './bundleBuilder';

/**
 * Result of building artifact bundles with error recovery
 */
export interface BundleBuildResult {
  /** Successfully built bundles */
  bundles: ArtifactBundle[];
  /** Errors encountered during bundle building */
  errors: GenerationError[];
}

/**
 * Builds artifact bundles with error recovery
 * 
 * Attempts to build artifact bundles for all forms. If bundle building fails
 * for one form, captures the error and continues with remaining forms.
 * 
 * This implements Requirement 11.4: "If artifact generation fails for one
 * Deployment_Form, continue generating artifacts for the remaining
 * Deployment_Forms and produce an error indication identifying the
 * Deployment_Form for which generation failed."
 * 
 * Requirements:
 * - 10.8: Handle generation failures gracefully
 * - 11.4: Continue with remaining forms on single-form failure
 * - 13.3: Track and report errors
 * - 13.4: Provide detailed error information
 * 
 * @param forms - Array of deployment form data to generate bundles for
 * @param theme - Selected visual theme (Light Mode or Dark Mode)
 * @returns Result containing successful bundles and any errors encountered
 * 
 * @example
 * ```typescript
 * const result = buildArtifactBundlesWithRecovery(forms, 'Dark Mode');
 * if (result.errors.length > 0) {
 *   console.error(`${result.errors.length} bundles failed to build`);
 *   result.errors.forEach(err => console.error(err.message));
 * }
 * // Continue with successful bundles
 * const deliveryResult = await deliverArtifacts(result.bundles);
 * ```
 */
export function buildArtifactBundlesWithRecovery(
  forms: DeploymentFormData[],
  theme: Theme
): BundleBuildResult {
  const result: BundleBuildResult = {
    bundles: [],
    errors: []
  };

  // Try to build all bundles together first (the fast path)
  // This is more efficient when all forms are valid
  try {
    const bundles = buildArtifactBundles(forms, theme);
    result.bundles = bundles;
    return result;
  } catch (error) {
    // If batch building failed, fall back to building forms one at a time
    // This allows us to identify which specific form(s) failed
    // Requirement 11.4: Continue with remaining forms on failure
    console.warn('Batch bundle building failed, falling back to individual form processing');
  }

  // Build bundles one at a time to isolate failures
  // Requirement 11.4: Continue generating for remaining forms
  for (const form of forms) {
    try {
      const bundles = buildArtifactBundles([form], theme);
      const firstBundle = bundles[0];

      if (firstBundle !== undefined) {
        result.bundles.push(firstBundle);
      } else {
        // This shouldn't happen, but handle it anyway
        result.errors.push({
          formId: form.formId,
          artifactType: 'HTML',
          message: 'Failed to build artifact bundle: No bundle returned'
        });
      }
    } catch (error) {
      // Catch bundle build errors for this form
      // Requirements: 10.8, 11.4, 13.4
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      result.errors.push({
        formId: form.formId,
        artifactType: 'HTML',
        message: `Failed to build artifact bundle: ${errorMessage}`,
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      // Continue with the next form per Requirement 11.4
      continue;
    }
  }

  return result;
}

/**
 * Formats a generation error for user display
 * 
 * Creates a user-friendly error message from a GenerationError object.
 * 
 * @param error - Generation error to format
 * @param formName - Optional human-readable form name for context
 * @returns Formatted error message string
 * 
 * @example
 * ```typescript
 * const error = { formId: 'form-1', artifactType: 'PDF', message: 'Generation failed' };
 * const message = formatGenerationError(error, 'Crew Portal Deployment');
 * // Returns: "Failed to generate PDF for Crew Portal Deployment: Generation failed"
 * ```
 */
export function formatGenerationError(
  error: GenerationError,
  formName?: string
): string {
  const formIdentifier = formName || `form ${error.formId}`;
  return `Failed to generate ${error.artifactType} for ${formIdentifier}: ${error.message}`;
}

/**
 * Gets a summary of generation errors
 * 
 * Creates a summary message describing the number and types of errors.
 * 
 * @param errors - Array of generation errors
 * @returns Summary message string
 * 
 * @example
 * ```typescript
 * const errors = [
 *   { formId: 'form-1', artifactType: 'PDF', message: '...' },
 *   { formId: 'form-2', artifactType: 'PNG', message: '...' }
 * ];
 * const summary = getErrorSummary(errors);
 * // Returns: "2 artifacts failed to generate"
 * ```
 */
export function getErrorSummary(errors: GenerationError[]): string {
  if (errors.length === 0) {
    return 'No errors';
  }
  
  if (errors.length === 1) {
    return '1 artifact failed to generate';
  }
  
  return `${errors.length} artifacts failed to generate`;
}

/**
 * Groups errors by form ID
 * 
 * Organizes generation errors by the form they belong to, making it easier
 * to display per-form error summaries.
 * 
 * @param errors - Array of generation errors
 * @returns Map of form ID to array of errors for that form
 * 
 * @example
 * ```typescript
 * const errors = [
 *   { formId: 'form-1', artifactType: 'PDF', message: '...' },
 *   { formId: 'form-1', artifactType: 'PNG', message: '...' },
 *   { formId: 'form-2', artifactType: 'HTML', message: '...' }
 * ];
 * const grouped = groupErrorsByForm(errors);
 * // Returns: Map { 'form-1' => [pdf error, png error], 'form-2' => [html error] }
 * ```
 */
export function groupErrorsByForm(
  errors: GenerationError[]
): Map<string, GenerationError[]> {
  const grouped = new Map<string, GenerationError[]>();
  
  for (const error of errors) {
    const formErrors = grouped.get(error.formId) || [];
    formErrors.push(error);
    grouped.set(error.formId, formErrors);
  }
  
  return grouped;
}
