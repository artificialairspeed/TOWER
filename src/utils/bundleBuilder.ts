/**
 * Artifact Bundle Builder
 * 
 * This module implements the artifact bundle builder that generates all three
 * artifact formats (HTML, PDF, PNG) for deployment forms with collision handling.
 * 
 * Task: 16.1
 * Requirements: 10.4, 11.1, 11.2, 11.3, 12.4, 14.1, 14.3
 */

import type { DeploymentFormData, Theme, ArtifactBundle } from '../types/models';
import { generateHTML } from './htmlGenerator';
import { disambiguateFileNames } from './fileNaming';

/**
 * Builds artifact bundles for multiple deployment forms
 * 
 * For each form:
 * 1. Generates HTML content using the selected theme
 * 2. Computes file names with collision handling
 * 3. Creates a bundle containing HTML content and file names
 * 
 * File name collision handling ensures that if multiple forms would generate
 * the same base file name (same application, environment, CHG#, and date),
 * they receive distinguishing suffixes (-1, -2, etc.) using stable ordering.
 * 
 * Requirements:
 * - 10.4: Generate HTML artifact containing all metadata
 * - 11.1: Produce exactly N×3 artifacts for N forms
 * - 11.2: Each artifact contains only its associated form's data
 * - 11.3: Artifacts are distinct files, not merged
 * - 12.4: File names share identical base name differing only by extension
 * - 14.1: Append distinguishing suffix for colliding forms
 * - 14.3: Apply identical base name (including suffix) to all three artifacts
 * 
 * @param forms - Array of deployment form data to generate artifacts for
 * @param theme - Selected visual theme (Light Mode or Dark Mode)
 * @returns Array of artifact bundles, one per form, in the same order as input
 * @throws Error if HTML generation fails for any form
 * 
 * @example
 * ```typescript
 * const forms: DeploymentFormData[] = [form1, form2, form3];
 * const bundles = buildArtifactBundles(forms, 'Dark Mode');
 * // Returns: [
 * //   { formId: 'form-1', htmlContent: '...', fileName: 'Crew_Portal_PROD_CHG123_20250315', formData: form1 },
 * //   { formId: 'form-2', htmlContent: '...', fileName: 'Crew_Portal_PROD_CHG123_20250315-1', formData: form2 },
 * //   { formId: 'form-3', htmlContent: '...', fileName: 'Admin_Portal_QA_CHG456_20250316', formData: form3 }
 * // ]
 * ```
 */
export function buildArtifactBundles(
  forms: DeploymentFormData[],
  theme: Theme
): ArtifactBundle[] {
  // Step 1: Compute disambiguated file names for all forms
  // This handles collision detection and suffix assignment
  // Requirements: 14.1, 14.3
  const fileNameMap = disambiguateFileNames(forms);
  
  // Step 2: Generate HTML and create bundles for each form
  // Requirements: 10.4, 11.1, 11.2, 11.3, 12.4
  const bundles: ArtifactBundle[] = forms.map(form => {
    try {
      // Generate HTML content for this form with the selected theme
      // Requirement: 10.4
      const htmlContent = generateHTML(form, theme);
      
      // Get the disambiguated file name for this form
      // The file name may include a collision suffix if needed
      // Requirements: 14.1, 14.3
      const fileName = fileNameMap.get(form.formId);
      
      if (!fileName) {
        throw new Error(
          `Failed to generate file name for form ${form.formId}. ` +
          `This may indicate missing required fields (application, environment, change number, or date).`
        );
      }
      
      // Create the artifact bundle
      // Requirements: 11.2, 11.3, 12.4
      const bundle: ArtifactBundle = {
        formId: form.formId,
        htmlContent,
        fileName,
        formData: form
      };
      
      return bundle;
    } catch (error) {
      // Re-throw with form context for better error messages
      throw new Error(
        `Failed to build artifact bundle for form ${form.formId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  });
  
  return bundles;
}
