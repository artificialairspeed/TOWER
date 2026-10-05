/**
 * DeploymentInfoSection Component
 * 
 * Provides input controls for core deployment identifiers:
 * - Change Number (exactly 8 digits max, numeric only, required, auto-trim on blur)
 * - Release Version (masked as YYYY.#.# while typing, required, auto-trim on blur)
 * - Environment dropdown (PROD/QA/ITEST/DEV, none default, required)
 *
 * Exactly one of `changeNumberOnly`, `releaseVersionOnly` or `environmentOnly`
 * must be set: DeploymentForm renders one instance per field so the four
 * deployment-information controls can share a single row. The heading above the
 * row is owned by DeploymentForm.
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
  InputAdornment
} from '@mui/material';
import type { Environment } from '../types/models';
import { formatReleaseVersion } from '../utils/formatters';

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
  /** Render only the environment field (for the same-row layout) */
  environmentOnly?: boolean;
  /** Render only the change number field (for the same-row layout) */
  changeNumberOnly?: boolean;
  /** Render only the release version field (for the same-row layout) */
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
    <Box sx={{ mb: 0 }}>
      {/* Change Number Input - Requirements: 3.1, 3.4 */}
      {changeNumberOnly && (
        <>
          <TextField
            fullWidth
            required
            label="Change Number"
            value={changeNumber}
            onChange={(e) => onChangeNumberChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
            onBlur={handleChangeNumberBlur}
            error={!!changeNumberError}
            helperText={
              changeNumberError ? (
                <span id="change-number-error">{changeNumberError}</span>
              ) : undefined
            }
            slotProps={{
              htmlInput: {
                maxLength: 8,
                inputMode: 'numeric',
                pattern: '[0-9]*',
                'aria-label': 'Change number',
                'aria-describedby': changeNumberError
                  ? 'change-number-error'
                  : 'change-number-help',
                'aria-invalid': !!changeNumberError
              },
              input: {
                startAdornment: <InputAdornment position="start">CHG</InputAdornment>
              },
              inputLabel: {
                shrink: true
              }
            }}
            sx={{ mb: 0 }}
          />
          {!changeNumberError && (
            <span id="change-number-help" className="sr-only">
              Enter the ServiceNow change number digits only, up to 8 digits. The CHG prefix is
              added automatically.
            </span>
          )}
        </>
      )}

      {/* Release Version Input - Requirements: 3.2, 3.4 */}
      {releaseVersionOnly && (
        <>
          <TextField
            fullWidth
            required
            label="Release Version"
            placeholder="YYYY.#.#"
            value={releaseVersion}
            onChange={(e) => onReleaseVersionChange(formatReleaseVersion(e.target.value))}
            onBlur={handleReleaseVersionBlur}
            error={!!releaseVersionError}
            helperText={
              releaseVersionError ? (
                <span id="release-version-error">{releaseVersionError}</span>
              ) : undefined
            }
            slotProps={{
              htmlInput: {
                maxLength: 8,
                inputMode: 'numeric',
                'aria-label': 'Release version',
                'aria-describedby': releaseVersionError
                  ? 'release-version-error'
                  : 'release-version-help',
                'aria-invalid': !!releaseVersionError
              },
              input: {
                startAdornment: <InputAdornment position="start">PI</InputAdornment>
              },
              inputLabel: {
                shrink: true
              }
            }}
            sx={{ mb: 0 }}
          />
          {!releaseVersionError && (
            <span id="release-version-help" className="sr-only">
              Enter the program increment version in YYYY.#.# format, for example 2025.4.1
            </span>
          )}
        </>
      )}

      {/* Environment Dropdown - Requirements: 3.3 (only shown when environmentOnly is true) */}
      {environmentOnly && (
        <FormControl 
          fullWidth 
          required 
          error={!!environmentError}
          sx={{ mb: 0 }}
        >
          <InputLabel id="environment-label" shrink>Environment</InputLabel>
          <Select
            labelId="environment-label"
            id="environment-select"
            value={environment || ''}
            label="Environment"
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
