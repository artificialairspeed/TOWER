/**
 * File naming utilities for artifact generation
 * 
 * This module implements the file naming logic for generated deployment
 * notification artifacts (HTML, PDF, PNG).
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.6
 */

import { DeploymentFormData } from '../types/models';

/**
 * Formats a Date object as an 8-digit YYYYMMDD string
 * 
 * @param date - The date to format
 * @returns 8-digit date string (e.g., "20250315" for March 15, 2025)
 * 
 * Requirements: 12.2
 */
function formatYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Replaces all space characters in a string with underscores
 * 
 * @param text - The text to process
 * @returns The text with spaces replaced by underscores
 * 
 * Requirements: 12.3
 */
function replaceSpacesWithUnderscores(text: string): string {
  return text.replace(/ /g, '_');
}

/**
 * Generates the base file name for deployment notification artifacts
 * 
 * The base file name follows the format:
 * `<Application>_<Environment>_<CHG#>_<YYYYMMDD>`
 * 
 * All space characters in the Application, Environment, and CHG# components
 * are replaced with underscores before concatenation.
 * 
 * @param data - The deployment form data
 * @returns The base file name (without extension), or null if any required component is missing
 * 
 * @example
 * ```typescript
 * const data: DeploymentFormData = {
 *   application: { name: 'AO Crew Training', ... },
 *   environment: 'PROD',
 *   changeNumber: 'CHG12345',
 *   deploymentDate: new Date('2025-03-15'),
 *   ...
 * };
 * 
 * const baseName = generateBaseFileName(data);
 * // Returns: "AO_Crew_Training_PROD_CHG12345_20250315"
 * ```
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.6
 */
export function generateBaseFileName(data: DeploymentFormData): string | null {
  // Check if all required components are present
  // Requirements: 12.6
  if (!data.application || !data.environment || !data.changeNumber || !data.deploymentDate) {
    return null;
  }

  // Extract and process each component
  // Requirements: 12.3
  const application = replaceSpacesWithUnderscores(data.application.name);
  const environment = replaceSpacesWithUnderscores(data.environment);
  const changeNumber = replaceSpacesWithUnderscores(data.changeNumber);
  const date = formatYYYYMMDD(data.deploymentDate);

  // Concatenate components with underscores
  // Requirements: 12.1, 12.2
  return `${application}_${environment}_${changeNumber}_${date}`;
}

/**
 * Detects file name collisions among a set of deployment forms
 * 
 * Groups forms by their base file name. Forms are classified as colliding
 * if and only if they share the same application, environment, change number,
 * and deployment date.
 * 
 * @param forms - Array of deployment form data
 * @returns Map where keys are base file names and values are arrays of forms that share that name
 * 
 * @example
 * ```typescript
 * const forms = [form1, form2, form3];
 * const collisions = detectCollisions(forms);
 * // Returns: Map {
 * //   "Crew_Portal_PROD_CHG12345_20250315" => [form1, form2],
 * //   "AO_Crew_Training_QA_CHG67890_20250316" => [form3]
 * // }
 * ```
 * 
 * Requirements: 14.1, 14.2
 */
export function detectCollisions(forms: DeploymentFormData[]): Map<string, DeploymentFormData[]> {
  const collisionMap = new Map<string, DeploymentFormData[]>();

  for (const form of forms) {
    const baseName = generateBaseFileName(form);
    
    // Skip forms with incomplete data (null base name)
    if (baseName === null) {
      continue;
    }

    // Add form to the collision group for this base name
    if (!collisionMap.has(baseName)) {
      collisionMap.set(baseName, []);
    }
    collisionMap.get(baseName)!.push(form);
  }

  return collisionMap;
}

/**
 * Disambiguates file names for forms with colliding base names
 * 
 * Assigns suffixes (-1, -2, etc.) to forms with colliding base names using
 * a stable ordering based on form ID. The first form in each collision group
 * (by form ID sort order) receives no suffix, while subsequent forms receive
 * suffixes -1, -2, -3, etc.
 * 
 * The same suffix applies to all three artifacts (HTML, PDF, PNG) for a given form.
 * 
 * @param forms - Array of deployment form data
 * @returns Map from form ID to disambiguated file name (without extension)
 * 
 * @example
 * ```typescript
 * const forms = [
 *   { formId: 'form-2', ... }, // collides with form-1 and form-3
 *   { formId: 'form-1', ... }, // collides with form-2 and form-3
 *   { formId: 'form-3', ... }, // collides with form-1 and form-2
 *   { formId: 'form-4', ... }  // no collision
 * ];
 * const fileNames = disambiguateFileNames(forms);
 * // Returns: Map {
 * //   'form-1' => 'Crew_Portal_PROD_CHG12345_20250315',       // first (no suffix)
 * //   'form-2' => 'Crew_Portal_PROD_CHG12345_20250315-1',     // second
 * //   'form-3' => 'Crew_Portal_PROD_CHG12345_20250315-2',     // third
 * //   'form-4' => 'AO_Crew_Training_QA_CHG67890_20250316'     // no collision
 * // }
 * ```
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */
export function disambiguateFileNames(forms: DeploymentFormData[]): Map<string, string> {
  const fileNameMap = new Map<string, string>();
  
  // Group forms by base file name
  const collisionMap = detectCollisions(forms);

  // Process each collision group
  for (const [baseName, collidingForms] of collisionMap.entries()) {
    // Sort forms by ID for stable, repeatable ordering
    // Requirements: 14.4
    const sortedForms = [...collidingForms].sort((a, b) => 
      a.formId.localeCompare(b.formId)
    );

    // Assign file names with suffixes
    sortedForms.forEach((form, index) => {
      if (index === 0) {
        // First form gets base name without suffix
        // Requirements: 14.1
        fileNameMap.set(form.formId, baseName);
      } else {
        // Subsequent forms get base name with suffix -1, -2, -3, etc.
        // Requirements: 14.1, 14.3
        fileNameMap.set(form.formId, `${baseName}-${index}`);
      }
    });
  }

  return fileNameMap;
}
