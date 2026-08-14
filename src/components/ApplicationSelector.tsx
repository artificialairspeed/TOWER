/**
 * ApplicationSelector Component
 * 
 * Dropdown component for selecting an application from the APPLICATION_CATALOG.
 * 
 * Requirements:
 * - 2.1: Present all applications from APPLICATION_CATALOG as selectable options
 * - 2.2: Display placeholder prompt when no application selected
 * - 2.7: Display banner "No applications available" when catalog empty
 * - 2.8: Disable dropdown when catalog empty
 */

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Alert, SelectChangeEvent } from '@mui/material';
import { Application, APPLICATION_CATALOG } from '../types/models';

export interface ApplicationSelectorProps {
  /** Currently selected application (null if none selected) */
  value: Application | null;
  /** Callback when application selection changes */
  onChange: (application: Application | null) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Error message to display (if any) */
  error?: string;
  /** Application catalog to use (defaults to APPLICATION_CATALOG) */
  catalog?: Application[];
}

/**
 * ApplicationSelector component
 * 
 * Displays a dropdown for selecting an application from the catalog.
 * Shows appropriate messaging when catalog is empty.
 * 
 * Performance optimization:
 * - Wrapped with React.memo to prevent re-renders when parent changes (22.2)
 */
function ApplicationSelectorComponent({
  value,
  onChange,
  disabled = false,
  error,
  catalog = APPLICATION_CATALOG
}: ApplicationSelectorProps) {
  const isEmpty = catalog.length === 0;
  const isDisabled = disabled || isEmpty;

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;
    if (!selectedId) {
      onChange(null);
      return;
    }
    
    const selectedApp = catalog.find(app => app.id === selectedId);
    onChange(selectedApp || null);
  };

  return (
    <div>
      {/* Requirement 2.7: Display banner when catalog empty */}
      {isEmpty && (
        <Alert severity="error" sx={{ mb: 2 }} role="alert">
          No applications available
        </Alert>
      )}
      
      <FormControl 
        fullWidth 
        disabled={isDisabled}
        error={!!error}
      >
        <InputLabel id="application-selector-label" shrink>
          Application *
        </InputLabel>
        <Select
          labelId="application-selector-label"
          id="application-selector"
          value={value?.id || ''}
          label="Application *"
          onChange={handleChange}
          // Requirement 2.8: Disable dropdown when catalog empty
          disabled={isDisabled}
          // Requirement 2.2: Display placeholder when no application selected
          displayEmpty={false}
          notched={true}
          data-testid="application-selector"
          inputProps={{
            'aria-label': 'Select application',
            'aria-describedby': error ? 'application-selector-error' : 'application-selector-help'
          }}
        >
          {/* Requirement 2.1: Present all applications as selectable options */}
          {catalog.map((app) => (
            <MenuItem key={app.id} value={app.id}>
              {app.name}
            </MenuItem>
          ))}
        </Select>
        {error && (
          <div 
            style={{ color: 'inherit', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px' }}
            id="application-selector-error"
            role="alert"
          >
            {error}
          </div>
        )}
        {!error && (
          <span id="application-selector-help" className="sr-only">
            Select the application for this deployment
          </span>
        )}
      </FormControl>
    </div>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const ApplicationSelector = React.memo(ApplicationSelectorComponent);
