/**
 * DeploymentTitleDisplay Component
 * 
 * Read-only text display showing the computed Deployment_Title.
 * Updates within 500ms of Change Number, Release Version, Environment, or Application change.
 * Shows empty when any required component is missing.
 * 
 * Performance optimizations:
 * - Memoizes title computation with useMemo (22.2: Performance optimization)
 * - Component wrapped with React.memo to prevent re-renders on parent changes (22.2)
 * 
 * Requirements: 3.6, 3.7, 3.8
 */

import { useEffect, useState, useMemo, memo } from 'react';
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
 * Performance: Uses useMemo to memoize the title computation, and React.memo
 * to prevent re-renders when parent component updates but props haven't changed.
 * 
 * @param props - Component props containing deployment form data
 * @returns A read-only text field displaying the deployment title
 */
function DeploymentTitleDisplayComponent({ data }: DeploymentTitleDisplayProps) {
  const [displayedTitle, setDisplayedTitle] = useState<string>('');

  // Memoize title computation based on dependency fields (22.2: Performance optimization)
  // Only recompute when application, changeNumber, releaseVersion, or environment changes
  const memoizedTitle = useMemo(() => {
    return generateDeploymentTitle(data);
  }, [
    data.application,
    data.changeNumber,
    data.releaseVersion,
    data.environment
  ]);

  useEffect(() => {
    // Debounce the title display update by 500ms
    // This prevents excessive UI updates during rapid user input
    const timeoutId = setTimeout(() => {
      setDisplayedTitle(memoizedTitle);
    }, 500);

    // Cleanup: cancel the timeout if dependencies change before 500ms
    return () => clearTimeout(timeoutId);
  }, [memoizedTitle]);

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

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const DeploymentTitleDisplay = memo(DeploymentTitleDisplayComponent);
