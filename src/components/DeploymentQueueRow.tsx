/**
 * DeploymentQueueRow Component
 *
 * Displays a single deployment form as an expandable row in a queue.
 * Shows a summary when collapsed and the full form when expanded.
 *
 * Summary displays:
 * - Queue position number
 * - Application name (or "Not Selected")
 * - Environment
 * - Change Number
 * - Release Version
 * - Expand/collapse control
 * - Remove control
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { DeploymentFormData, ValidationError } from '../types/models';
import { DeploymentForm } from './DeploymentForm';

export interface DeploymentQueueRowProps {
  /** The deployment form data */
  formData: DeploymentFormData;
  /** Position in queue (1-indexed) */
  position: number;
  /** Callback when form data is updated */
  onUpdate: (updates: Partial<DeploymentFormData>) => void;
  /** Callback when form is removed */
  onRemove: () => void;
  /** Whether the remove button should be enabled */
  canRemove: boolean;
  /** Validation errors for this form */
  validationErrors?: ValidationError[];
  /** Callback to clear validation error for a specific field */
  onClearFieldError?: (field: string) => void;
  /** Callback for onBlur field validation (field, value) */
  onBlurValidate?: (field: string, value: string) => void;
  /**
   * When true, the row expands on mount / when this becomes the newest row,
   * and scrolls itself into view. Used to auto-open freshly added forms.
   */
  defaultExpanded?: boolean;
}

/**
 * DeploymentQueueRow component for displaying a deployment form in a queue
 *
 * Features:
 * - Collapsible row with summary information
 * - Shows application, environment, date in collapsed state
 * - Auto-expands (and scrolls into view) when it is the newest form
 * - Expands to show full DeploymentForm component
 * - Visual indicators for validation errors
 * 
 * Performance optimization:
 * - Wrapped with React.memo to prevent re-renders when parent changes (22.2)
 */
function DeploymentQueueRowComponent({
  formData,
  position,
  onUpdate,
  onRemove,
  canRemove,
  validationErrors = [],
  onClearFieldError,
  onBlurValidate,
  defaultExpanded = false,
}: DeploymentQueueRowProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasErrors = validationErrors.length > 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);

  // Auto-expand and scroll into view when this row becomes the newest one.
  // Skips the very first mount of the initial form to avoid a jarring scroll
  // on page load.
  useEffect(() => {
    if (!defaultExpanded) return;
    setIsExpanded(true);
    if (didMountRef.current) {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [defaultExpanded]);

  useEffect(() => {
    didMountRef.current = true;
  }, []);

  // If this row has validation errors, surface them by expanding it.
  useEffect(() => {
    if (hasErrors) {
      setIsExpanded(true);
    }
  }, [hasErrors]);

  // Get application name
  const appName = formData.application?.name || 'Not set';

  // Get environment
  const environment = formData.environment || 'Not set';

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  return (
    <Paper
      ref={rootRef}
      elevation={isExpanded ? 3 : 1}
      sx={{
        overflow: 'hidden',
        border: '1px solid',
        borderColor: hasErrors ? 'error.main' : 'divider',
        borderRadius: 1,
        transition: 'all 0.2s ease-in-out',
      }}
      data-testid={`form-${position - 1}`}
    >
      {/* Summary Row */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
        aria-expanded={isExpanded}
        aria-label={`Deployment ${position}: ${appName} to ${environment}. Change: ${
          formData.changeNumber || 'Not set'
        }, Version: ${formData.releaseVersion || 'Not set'}. ${
          isExpanded ? 'Collapse' : 'Expand'
        } to ${isExpanded ? 'hide' : 'show'} details.`}
      >
        {/* Queue Position */}
        <Box
          sx={{
            flexShrink: 0,
            minWidth: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: hasErrors ? 'error.main' : 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.15rem',
          }}
        >
          {position}
        </Box>

        {/* Summary Information: flexes and wraps, actions stay anchored right */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 2 },
          }}
        >
          <Box sx={{ minWidth: 0, flex: { xs: '1 1 100%', sm: '1 1 auto' } }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.2 }}
            >
              Application
            </Typography>
            <Typography variant="body2" noWrap sx={{ fontWeight: 'medium' }}>
              {appName}
            </Typography>
            {hasErrors && (
              <Typography variant="caption" color="error">
                {validationErrors.length} error
                {validationErrors.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.2 }}
            >
              Environment
            </Typography>
            <Typography
              variant="body2"
              color={environment === 'PROD' ? 'error.main' : 'text.primary'}
              sx={{ fontWeight: 'medium' }}
            >
              {environment}
            </Typography>
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.2 }}
            >
              Change Number
            </Typography>
            <Typography variant="body2" color="text.primary">
              {formData.changeNumber || 'Not set'}
            </Typography>
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.2 }}
            >
              Release Version
            </Typography>
            <Typography variant="body2" color="text.primary">
              {formData.releaseVersion || 'Not set'}
            </Typography>
          </Box>
        </Box>

        {/* Actions - always anchored to the right */}
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 'auto' }}>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={!canRemove}
            aria-label={canRemove ? 'Remove deployment' : 'Cannot remove the only deployment'}
          >
            <DeleteIcon />
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse deployment details' : 'Expand deployment details'}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Expanded Content */}
      <Collapse in={isExpanded} timeout="auto">
        <Box sx={{ p: { xs: 2, sm: 3 }, pt: 0, bgcolor: 'background.default' }}>
          <DeploymentForm
            formData={formData}
            formNumber={position}
            onUpdate={onUpdate}
            validationErrors={validationErrors}
            onClearFieldError={onClearFieldError}
            onBlurValidate={onBlurValidate}
          />
        </Box>
      </Collapse>
    </Paper>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const DeploymentQueueRow = React.memo(DeploymentQueueRowComponent);
