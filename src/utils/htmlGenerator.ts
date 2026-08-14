/**
 * HTML Artifact Generator
 * Implements task 15.1 - HTML artifact generator
 * Requirements: 10.4, 10.5
 * 
 * This module provides functionality to generate HTML artifacts by loading
 * templates and injecting deployment data.
 */

import { templateProvider } from './templateProvider';
import { injectTemplate } from './formatters';
import type { DeploymentFormData, Theme } from '../types/models';

/**
 * Maps the UI Theme type to the TemplateProvider theme type
 * 
 * @param theme - UI theme ('Light Mode' or 'Dark Mode')
 * @returns TemplateProvider theme ('light' or 'dark')
 */
function mapThemeToTemplate(theme: Theme): 'light' | 'dark' {
  return theme === 'Light Mode' ? 'light' : 'dark';
}

/**
 * Generates an HTML artifact from deployment form data.
 * 
 * This function loads the appropriate HTML template based on the selected theme,
 * injects all deployment data into the template tokens, and returns the complete
 * HTML string ready for display or further processing.
 * 
 * Requirements:
 * - 10.4: Generate HTML artifact containing all metadata from the deployment form
 * - 10.5: Open HTML artifact in a new browser tab
 * - 9.5: Render artifact using the HTML template corresponding to the active theme
 * - 9.6: Visual appearance matches the HTML template for the active theme
 * 
 * @param data - Complete deployment form data including all fields
 * @param theme - Selected visual theme ('Light Mode' or 'Dark Mode')
 * @returns Complete HTML string with all tokens replaced with deployment data
 * @throws Error if templates haven't been initialized or template not found
 * 
 * @example
 * ```typescript
 * const formData: DeploymentFormData = {
 *   formId: '1',
 *   application: { id: 'crew-portal', name: 'Crew Portal', notificationHeader: '...' },
 *   changeNumber: 'CHG12345',
 *   releaseVersion: 'v5.4.1',
 *   environment: 'PROD',
 *   // ... other fields
 * };
 * 
 * const html = generateHTML(formData, 'Dark Mode');
 * // Returns: complete HTML string with dark theme template populated with data
 * ```
 */
export function generateHTML(data: DeploymentFormData, theme: Theme): string {
  // Map UI theme to template provider theme
  const templateTheme = mapThemeToTemplate(theme);
  
  // Load the template for the selected theme
  // This will throw an error if templates haven't been initialized
  const template = templateProvider.getTemplate(templateTheme);
  
  // Inject all deployment data into the template
  const populatedHtml = injectTemplate(template, data);
  
  return populatedHtml;
}
