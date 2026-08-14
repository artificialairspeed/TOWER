/**
 * ApplicationSelector Example Usage
 * 
 * This file demonstrates how to use the ApplicationSelector component.
 */

import { useState } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { ApplicationSelector } from './ApplicationSelector';
import { Application, APPLICATION_CATALOG } from '../types/models';

export function ApplicationSelectorExample() {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [error, setError] = useState<string>('');

  const handleChange = (app: Application | null) => {
    setSelectedApp(app);
    if (app) {
      setError('');
    }
  };

  const simulateValidation = () => {
    if (!selectedApp) {
      setError('Application selection is required');
    } else {
      setError('');
      alert(`Selected: ${selectedApp.name}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        ApplicationSelector Component Example
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Usage
        </Typography>
        <ApplicationSelector
          value={selectedApp}
          onChange={handleChange}
          error={error}
        />
        <Box sx={{ mt: 2 }}>
          <button onClick={simulateValidation}>
            Validate Selection
          </button>
        </Box>
        {selectedApp && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Selected Application: {selectedApp.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Notification Header: {selectedApp.notificationHeader}
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Disabled State
        </Typography>
        <ApplicationSelector
          value={null}
          onChange={() => {}}
          disabled={true}
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Empty Catalog
        </Typography>
        <ApplicationSelector
          value={null}
          onChange={() => {}}
          catalog={[]}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Applications
        </Typography>
        <ul>
          {APPLICATION_CATALOG.map(app => (
            <li key={app.id}>
              <strong>{app.name}</strong> - {app.notificationHeader}
            </li>
          ))}
        </ul>
      </Paper>
    </Container>
  );
}
