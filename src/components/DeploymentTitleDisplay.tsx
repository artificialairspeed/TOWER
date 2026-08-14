/**
 * DeploymentTitleDisplay Component
 * 
 * Read-only text display showing the computed Deployment_Title.
 * Updates within 500ms of Change Number, Release Version, Environment, or Application change.
 * Shows empty when any required component is missing.
 * 
 * Requirements: 3.6, 3.7, 3.8
 */

import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import { DeploymentFormData } from '../types/models';
import { generateDeploymentTitle } from '../utils/formatters';

interface DeploymentTitleDisplayProps {
  /** The deployment form data containing all fields needed for title generation */
  data: DeploymentFormData;
}

/**
 * Displays the computed deployment title as a read-only field.
 * 
 * The title updates automatically when any of the following fields change:
 * - Application
 * - Change Number
 * - Release Version
 * - Environment
 * 
 * Updates are debounced with a 500ms delay to avoid excessive re-computation
 * during rapid user input.
 * 
 * @param props - Component props containing deployment form data
 * @returns A read-only text field displaying the deployment title
 */
export function DeploymentTitleDisplay({ data }: DeploymentTitleDisplayProps) {
  const [displayedTitle, setDisplayedTitle] = useState<string>('');

  useEffect(() => {
    // Debounce the title computation by 500ms
    // This prevents excessive updates during rapid user input
    const timeoutId = setTimeout(() => {
      const newTitle = generateDeploymentTitle(data);
      setDisplayedTitle(newTitle);
    }, 500);

    // Cleanup: cancel the timeout if dependencies change before 500ms
    return () => clearTimeout(timeoutId);
  }, [
    // Dependencies: trigger re-computation when any title component changes
    data.application,
    data.changeNumber,
    data.releaseVersion,
    data.environment
  ]);

  return (
    <TextField
      label="Deployment Title"
      value={displayedTitle}
      fullWidth
      multiline
      maxRows={3}
      slotProps={{
        input: {
          readOnly: true
        }
      }}
      helperText="This field is automatically generated from the application, change number, release version, and environment"
      margin="normal"
    />
  );
}
