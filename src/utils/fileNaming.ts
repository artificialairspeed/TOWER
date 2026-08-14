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
 * Generates the base file name for deployment notification artifacts
 * 
 * The base file name follows the format:
 * `<Application>_<Environment>_<CHG#>_<YYYYMMDD>`
 * 
 * Where spaces in Application, Environment, and CHG# are replaced with underscores.
 * Date is formatted as an 8-digit YYYYMMDD string.
 * 
 * @param data - The deployment form data
 * @returns The base file name (without extension), or null if any required component is missing
 * 
 * @example
 * ```typescript
 * const data: DeploymentFormData = {
 *   application: { name: 'OQS SimLog', ... },
 *   changeNumber: 'CHG12345',
 *   environment: 'PROD',
 *   startDateTime: new Date('2025-01-15'),
 *   ...
 * };
 * 
 * const baseName = generateBaseFileName(data);
 * // Returns: "OQS_SimLog_PROD_CHG12345_20250115"
 * ```
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.6
 */
export function generateBaseFileName(data: DeploymentFormData): string | null {
  // Check if all required components are present
  // Requirements: 12.6
  if (!data.application || !data.environment || !data.changeNumber || !data.startDateTime) {
    return null;
  }

  // Helper function to replace spaces with underscores
  // Requirement: 12.3
  const slugify = (text: string): string => text.replace(/ /g, '_');

  // Extract and format components
  const app = slugify(data.application.name);
  const env = slugify(data.environment);
  const chg = slugify(data.changeNumber);
  
  // Format deployment date as YYYYMMDD
  // Requirement: 12.2
  const year = data.startDateTime.getFullYear();
  const month = String(data.startDateTime.getMonth() + 1).padStart(2, '0');
  const day = String(data.startDateTime.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Construct base file name
  // Format: <Application>_<Environment>_<CHG#>_<YYYYMMDD>
  // Requirements: 12.1
  return `${app}_${env}_${chg}_${dateStr}`;
}

/**
 * Detects file name collisions among a set of deployment forms
 * 
 * Groups forms by their base file name. Forms are classified as colliding
 * if they have the same change number and application.
 * 
 * @param forms - Array of deployment form data
 * @returns Map where keys are base file names and values are arrays of forms that share that name
 * 
 * @example
 * ```typescript
 * const forms = [form1, form2, form3];
 * const collisions = detectCollisions(forms);
 * // Returns: Map {
 * //   "CHG12345 | Crew Portal" => [form1, form2],
 * //   "CHG67890 | OQS SimLog" => [form3]
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
 *   { formId: 'form-2', application: { name: 'Crew Portal' }, changeNumber: 'CHG12345', ... },
 *   { formId: 'form-1', application: { name: 'Crew Portal' }, changeNumber: 'CHG12345', ... },
 *   { formId: 'form-3', application: { name: 'Crew Portal' }, changeNumber: 'CHG12345', ... },
 *   { formId: 'form-4', application: { name: 'OQS SimLog' }, changeNumber: 'CHG67890', ... }
 * ];
 * const fileNames = disambiguateFileNames(forms);
 * // Returns: Map {
 * //   'form-1' => 'CHG12345 | Crew Portal',       // first (no suffix)
 * //   'form-2' => 'CHG12345 | Crew Portal-1',     // second
 * //   'form-3' => 'CHG12345 | Crew Portal-2',     // third
 * //   'form-4' => 'CHG67890 | OQS SimLog'         // no collision
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
