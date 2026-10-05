/**
 * File naming utilities for artifact generation
 * 
 * Computes the base name for the generated deployment notification artifact.
 *
 * Note: the current delivery path opens the rendered PNG in a new tab rather
 * than downloading it, so this name is carried through the artifact bundle but
 * is not applied to any file the user receives. Restoring a named download is
 * an open product decision — see the open items in docs/DEVELOPER_GUIDE.md.
 *
 * Requirements: 12.1, 12.2, 12.3, 12.6
 */

import type { DeploymentFormData } from '../types/models';
import { formatChangeNumber, formatYYYYMMDD } from './formatters';

/**
 * Generates the base file name for deployment notification artifacts
 * 
 * The base file name follows the format:
 * `<Application>_<Environment>_<CHG#>_<YYYYMMDD>`
 * (extension-less; see the module note on how this name is currently used)
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
 *   changeNumber: '12345',
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
  // CHG prefix is applied to the digits-only change number so the file name
  // matches the on-screen/HTML title (e.g. "CHG12345")
  const chg = slugify(formatChangeNumber(data.changeNumber));
  
  // Format deployment date as YYYYMMDD
  // Requirement: 12.2
  const dateStr = formatYYYYMMDD(data.startDateTime);

  // Construct base file name
  // Format: <Application>_<Environment>_<CHG#>_<YYYYMMDD>
  // Requirements: 12.1
  return `${app}_${env}_${chg}_${dateStr}`;
}
