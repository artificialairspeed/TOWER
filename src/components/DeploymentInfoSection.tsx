/**
 * DeploymentInfoSection Component
 * 
 * Provides input controls for core deployment identifiers:
 * - Change Number (max 20 chars, required, auto-trim on blur)
 * - Release Version (max 50 chars, required, auto-trim on blur)
 * - Environment dropdown (PROD/QA/ITEST/DEV, none default, required)
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  InputAdornment
} from '@mui/material';
import { Environment } from '../types/models';

export interface DeploymentInfoSectionProps {
  /** Current change number value */
  changeNumber: string;
  /** Current release version value */
  releaseVersion: string;
  /** Current environment value (null if not selected) */
  environment: Environment | null;
  /** Callback when change number changes */
  onChangeNumberChange: (value: string) => void;
  /** Callback when release version changes */
  onReleaseVersionChange: (value: string) => void;
  /** Callback when environment changes */
  onEnvironmentChange: (value: Environment | null) => void;
  /** Validation error for change number field */
  changeNumberError?: string;
  /** Validation error for release version field */
  releaseVersionError?: string;
  /** Validation error for environment field */
  environmentError?: string;
  /** Callback for onBlur field validation (field, value) */
  onBlurValidate?: (field: string, value: string) => void;
  /** If true, only render the environment field (for same-row layout) */
  environmentOnly?: boolean;
  /** If true, only render the change number field (for same-row layout) */
  changeNumberOnly?: boolean;
  /** If true, only render the release version field (for same-row layout) */
  releaseVersionOnly?: boolean;
}

/**
 * DeploymentInfoSection component for entering core deployment identifiers
 * 
 * Performance optimization:
 * - Wrapped with React.memo to prevent re-renders when parent changes (22.2)
 */
function DeploymentInfoSectionComponent({
  changeNumber,
  releaseVersion,
  environment,
  onChangeNumberChange,
  onReleaseVersionChange,
  onEnvironmentChange,
  changeNumberError,
  releaseVersionError,
  environmentError,
  onBlurValidate,
  environmentOnly = false,
  changeNumberOnly = false,
  releaseVersionOnly = false
}: DeploymentInfoSectionProps) {
  /**
   * Handle change number blur event - auto-trim leading/trailing whitespace
   * Requirements: 3.4
   */
  const handleChangeNumberBlur = () => {
    const trimmed = changeNumber.trim();
    if (trimmed !== changeNumber) {
      onChangeNumberChange(trimmed);
    }
    onBlurValidate?.('changeNumber', trimmed);
  };

  /**
   * Handle release version blur event - auto-trim leading/trailing whitespace
   * Requirements: 3.4
   */
  const handleReleaseVersionBlur = () => {
    const trimmed = releaseVersion.trim();
    if (trimmed !== releaseVersion) {
      onReleaseVersionChange(trimmed);
    }
    onBlurValidate?.('releaseVersion', trimmed);
  };

  /**
   * Handle environment selection change
   * Requirements: 3.3
   */
  const handleEnvironmentChange = (value: string) => {
    if (value === '') {
      onEnvironmentChange(null);
    } else {
      onEnvironmentChange(value as Environment);
    }
  };

  return (
    <Box sx={{ mb: environmentOnly || changeNumberOnly || releaseVersionOnly ? 0 : 3 }} component={environmentOnly || changeNumberOnly || releaseVersionOnly ? 'div' : 'section'} aria-labelledby={environmentOnly || changeNumberOnly || releaseVersionOnly ? undefined : "deployment-info-heading"}>
      {!environmentOnly && !changeNumberOnly && !releaseVersionOnly && (
        <Typography variant="h6" gutterBottom id="deployment-info-heading">
          Deployment Information
        </Typography>
      )}
      
      {/* Change Number Input - Requirements: 3.1, 3.4 */}
      {(changeNumberOnly || (!environmentOnly && !changeNumberOnly && !releaseVersionOnly)) && (
        <TextField
          fullWidth
          required
          label="Change Number"
          value={changeNumber}
          onChange={(e) => onChangeNumberChange(e.target.value)}
          onBlur={handleChangeNumberBlur}
          error={!!changeNumberError}
          slotProps={{
            htmlInput: {
              maxLength: 20,
              'aria-label': 'Change number',
              'aria-describedby': changeNumberError ? 'change-number-error' : 'change-number-help',
              'aria-invalid': !!changeNumberError
            },
            input: {
              startAdornment: <InputAdornment position="start">CHG</InputAdornment>
            },
            inputLabel: {
              shrink: true
            }
          }}
          sx={{ mb: changeNumberOnly ? 0 : 2 }}
        />
      )}

      {/* Release Version Input - Requirements: 3.2, 3.4 */}
      {(releaseVersionOnly || (!environmentOnly && !changeNumberOnly && !releaseVersionOnly)) && (
        <TextField
          fullWidth
          required
          label="Release Version"
          placeholder="YYYY.#.#"
          value={releaseVersion}
          onChange={(e) => onReleaseVersionChange(e.target.value)}
          onBlur={handleReleaseVersionBlur}
          error={!!releaseVersionError}
          slotProps={{
            htmlInput: {
              maxLength: 50,
              'aria-label': 'Release version',
              'aria-describedby': releaseVersionError ? 'release-version-error' : 'release-version-help',
              'aria-invalid': !!releaseVersionError
            },
            input: {
              startAdornment: <InputAdornment position="start">PI</InputAdornment>
            },
            inputLabel: {
              shrink: true
            }
          }}
          sx={{ mb: releaseVersionOnly ? 0 : 2 }}
        />
      )}

      {/* Environment Dropdown - Requirements: 3.3 (only shown when environmentOnly is true) */}
      {environmentOnly && (
        <FormControl 
          fullWidth 
          required 
          error={!!environmentError}
          sx={{ mb: 0 }}
        >
          <InputLabel id="environment-label" shrink>Environment *</InputLabel>
          <Select
            labelId="environment-label"
            id="environment-select"
            value={environment || ''}
            label="Environment *"
            onChange={(e) => handleEnvironmentChange(e.target.value)}
            notched={true}
            inputProps={{
              'aria-label': 'Deployment environment',
              'aria-describedby': environmentError ? 'environment-error' : 'environment-help',
              'aria-invalid': !!environmentError
            }}
          >
            <MenuItem value="PROD">PROD</MenuItem>
            <MenuItem value="QA">QA</MenuItem>
            <MenuItem value="ITEST">ITEST</MenuItem>
            <MenuItem value="DEV">DEV</MenuItem>
          </Select>
          {environmentError && (
            <FormHelperText id="environment-error">{environmentError}</FormHelperText>
          )}
          {!environmentError && (
            <span id="environment-help" className="sr-only">
              Select the target environment for this deployment
            </span>
          )}
        </FormControl>
      )}
    </Box>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const DeploymentInfoSection = React.memo(DeploymentInfoSectionComponent);
