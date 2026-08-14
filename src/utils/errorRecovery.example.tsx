/**
 * Error Recovery Usage Examples
 * 
 * This file demonstrates how to use the error recovery and reporting
 * utilities in real-world scenarios.
 * 
 * Task: 16.3
 */

import React, { useState } from 'react';
import { Alert, AlertTitle, Box, Button, List, ListItem, Typography } from '@mui/material';
import type { DeploymentFormData, Theme } from '../types/models';
import {
  buildArtifactBundlesWithRecovery,
  deliverArtifacts,
  formatGenerationError,
  getErrorSummary,
  groupErrorsByForm,
  type BundleBuildResult
} from './errorRecovery';

/**
 * Example 1: Basic error recovery with user feedback
 */
export function BasicErrorRecoveryExample() {
  const [status, setStatus] = useState<string>('Ready');
  const [errors, setErrors] = useState<string[]>([]);

  const handleGenerate = async (forms: DeploymentFormData[], theme: Theme) => {
    setStatus('Generating...');
    setErrors([]);

    // Step 1: Build bundles with error recovery
    const buildResult = buildArtifactBundlesWithRecovery(forms, theme);

    // Report build errors
    if (buildResult.errors.length > 0) {
      const errorMessages = buildResult.errors.map(error =>
        formatGenerationError(error)
      );
      setErrors(errorMessages);
    }

    // Step 2: Deliver successful bundles
    if (buildResult.bundles.length > 0) {
      const deliveryResult = await deliverArtifacts(buildResult.bundles);

      // Report delivery errors
      if (deliveryResult.errors.length > 0) {
        const deliveryMessages = deliveryResult.errors.map(error =>
          formatGenerationError(error)
        );
        setErrors(prev => [...prev, ...deliveryMessages]);
      }

      if (deliveryResult.popupBlocked) {
        setErrors(prev => [
          ...prev,
          'Some HTML tabs were blocked. Please allow pop-ups and try again.'
        ]);
      }

      setStatus(
        `Generated ${deliveryResult.successful}/${deliveryResult.total} artifacts`
      );
    } else {
      setStatus('All forms failed to build');
    }
  };

  return (
    <Box>
      <Typography variant="h6">Status: {status}</Typography>
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Generation Errors</AlertTitle>
          <List>
            {errors.map((error, index) => (
              <ListItem key={index}>{error}</ListItem>
            ))}
          </List>
        </Alert>
      )}
    </Box>
  );
}

/**
 * Example 2: Detailed error reporting per form
 */
export function DetailedErrorReportingExample() {
  const [buildResult, setBuildResult] = useState<BundleBuildResult | null>(null);

  const handleGenerate = (forms: DeploymentFormData[], theme: Theme) => {
    const result = buildArtifactBundlesWithRecovery(forms, theme);
    setBuildResult(result);
  };

  if (!buildResult) {
    return <Typography>Click Generate to see results</Typography>;
  }

  const errorsByForm = groupErrorsByForm(buildResult.errors);

  return (
    <Box>
      <Typography variant="h6">
        Build Results: {buildResult.bundles.length} successful, {buildResult.errors.length} failed
      </Typography>

      {/* Display successful forms */}
      {buildResult.bundles.length > 0 && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <AlertTitle>Successfully Built ({buildResult.bundles.length})</AlertTitle>
          <List>
            {buildResult.bundles.map(bundle => (
              <ListItem key={bundle.formId}>
                {bundle.formData.deploymentTitle || bundle.formId}
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Display errors grouped by form */}
      {errorsByForm.size > 0 && (
        <Box sx={{ mt: 2 }}>
          {Array.from(errorsByForm.entries()).map(([formId, errors]) => (
            <Alert key={formId} severity="error" sx={{ mb: 1 }}>
              <AlertTitle>Form {formId} Errors</AlertTitle>
              <List>
                {errors.map((error, index) => (
                  <ListItem key={index}>
                    {error.artifactType}: {error.message}
                  </ListItem>
                ))}
              </List>
            </Alert>
          ))}
        </Box>
      )}
    </Box>
  );
}

/**
 * Example 3: Progress tracking with partial success
 */
export function ProgressTrackingExample() {
  const [progress, setProgress] = useState<{
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  }>({
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  });

  const handleGenerate = async (forms: DeploymentFormData[], theme: Theme) => {
    const totalArtifacts = forms.length * 3;
    setProgress({ total: totalArtifacts, successful: 0, failed: 0, errors: [] });

    // Build bundles
    const buildResult = buildArtifactBundlesWithRecovery(forms, theme);
    
    const failedBuilds = buildResult.errors.length;
    const buildErrors = buildResult.errors.map(e => formatGenerationError(e));

    // Deliver successful bundles
    if (buildResult.bundles.length > 0) {
      const deliveryResult = await deliverArtifacts(buildResult.bundles);
      
      const deliveryErrors = deliveryResult.errors.map(e => formatGenerationError(e));

      setProgress({
        total: totalArtifacts,
        successful: deliveryResult.successful,
        failed: failedBuilds * 3 + deliveryResult.failed,
        errors: [...buildErrors, ...deliveryErrors]
      });
    } else {
      setProgress({
        total: totalArtifacts,
        successful: 0,
        failed: totalArtifacts,
        errors: buildErrors
      });
    }
  };

  const successRate = progress.total > 0 
    ? Math.round((progress.successful / progress.total) * 100) 
    : 0;

  return (
    <Box>
      <Typography variant="h6">
        Progress: {progress.successful}/{progress.total} artifacts ({successRate}% success)
      </Typography>
      
      {progress.failed > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <AlertTitle>{getErrorSummary([...progress.errors] as any)}</AlertTitle>
          <Typography variant="body2">
            {progress.successful} artifacts were generated successfully.
            {progress.failed} artifacts failed.
          </Typography>
        </Alert>
      )}

      {progress.errors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Error Details:</Typography>
          <List dense>
            {progress.errors.map((error, index) => (
              <ListItem key={index}>
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}

/**
 * Example 4: Retry failed forms
 */
export function RetryFailedFormsExample() {
  const [failedForms, setFailedForms] = useState<DeploymentFormData[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const handleGenerate = async (
    forms: DeploymentFormData[], 
    theme: Theme
  ) => {
    // Build bundles
    const buildResult = buildArtifactBundlesWithRecovery(forms, theme);

    // Track which forms failed
    const failedFormIds = new Set(buildResult.errors.map(e => e.formId));
    const failed = forms.filter(f => failedFormIds.has(f.formId));
    setFailedForms(failed);

    // Continue with successful bundles
    if (buildResult.bundles.length > 0) {
      await deliverArtifacts(buildResult.bundles);
    }
  };

  const handleRetry = async (theme: Theme) => {
    if (failedForms.length === 0) return;

    setRetryCount(prev => prev + 1);
    
    // Retry only the failed forms
    const buildResult = buildArtifactBundlesWithRecovery(failedForms, theme);

    // Update failed forms list
    const stillFailedIds = new Set(buildResult.errors.map(e => e.formId));
    const stillFailed = failedForms.filter(f => stillFailedIds.has(f.formId));
    setFailedForms(stillFailed);

    // Deliver any that succeeded on retry
    if (buildResult.bundles.length > 0) {
      await deliverArtifacts(buildResult.bundles);
    }
  };

  return (
    <Box>
      {failedForms.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>
            {failedForms.length} form{failedForms.length !== 1 ? 's' : ''} failed
          </AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {retryCount > 0 && `Retry attempt ${retryCount}`}
          </Typography>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => handleRetry('Dark Mode')}
          >
            Retry Failed Forms
          </Button>
        </Alert>
      )}
    </Box>
  );
}

/**
 * Example 5: Export error log
 */
export function ErrorLogExportExample() {
  const exportErrorLog = (buildResult: BundleBuildResult) => {
    const errorsByForm = groupErrorsByForm(buildResult.errors);
    
    const logLines: string[] = [
      '=== Artifact Generation Error Log ===',
      `Date: ${new Date().toISOString()}`,
      `Total Forms: ${buildResult.bundles.length + buildResult.errors.length}`,
      `Successful: ${buildResult.bundles.length}`,
      `Failed: ${buildResult.errors.length}`,
      '',
      '=== Errors by Form ===',
    ];

    errorsByForm.forEach((errors, formId) => {
      logLines.push('');
      logLines.push(`Form ID: ${formId}`);
      errors.forEach(error => {
        logLines.push(`  - ${error.artifactType}: ${error.message}`);
        if (error.error) {
          logLines.push(`    Stack: ${error.error.stack}`);
        }
      });
    });

    const logText = logLines.join('\n');
    
    // Download as text file
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generation-errors-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="body2">
        Export detailed error logs for troubleshooting
      </Typography>
    </Box>
  );
}
