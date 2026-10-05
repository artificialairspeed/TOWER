/**
 * HTML Artifact Generator
 *
 * This module provides functionality to generate HTML artifacts by loading
 * the single Flight Plan template and injecting deployment data.
 */

import { templateProvider } from './templateProvider';
import { injectTemplate } from './formatters';
import type { DeploymentFormData } from '../types/models';

/**
 * Generates an HTML artifact from deployment form data.
 *
 * This function loads the single Flight Plan template, injects all deployment
 * data into the template tokens, and returns the complete HTML string ready for
 * display or further processing.
 *
 * Requirements:
 * - 1.3, 1.4: Output is derived from the single template.
 * - 8.3, 8.4: The template is selected without any theme branching.
 *
 * @param data - Complete deployment form data including all fields
 * @returns Complete HTML string with all tokens replaced with deployment data
 * @throws Error if the template hasn't been initialized
 *
 * @example
 * ```typescript
 * const formData: DeploymentFormData = {
 *   formId: '1',
 *   application: { id: 'crew-portal', name: 'Crew Portal' },
 *   changeNumber: '12345',
 *   releaseVersion: '2025.4.1',
 *   environment: 'PROD',
 *   // ... other fields
 * };
 *
 * const html = generateHTML(formData);
 * // Returns: complete HTML string with the Flight Plan template populated with data
 * ```
 */
export function generateHTML(data: DeploymentFormData): string {
  // Load the single Flight Plan template.
  // This will throw an error if the template hasn't been initialized.
  const template = templateProvider.getTemplate();

  // Inject all deployment data into the template
  return injectTemplate(template, data);
}
