/**
 * ImpactSection Component - Usage Examples
 * 
 * This file demonstrates how to use the ImpactSection component
 * in various scenarios within the Deployment Notification Generator Portal.
 */

import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ImpactSection } from './ImpactSection';
import type { ImpactItem } from '../types/models';

/**
 * Example 1: Basic Usage
 * 
 * Shows minimal setup with state management
 */
export const BasicExample: React.FC = () => {
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([
    { id: '1', text: '' }
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Basic Example
      </Typography>
      
      <ImpactSection
        impactItems={impactItems}
        onImpactItemsChange={setImpactItems}
      />
      
      {/* Display current state for demo purposes */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="subtitle2">Current State ({impactItems.length} items):</Typography>
        <pre>{JSON.stringify(impactItems, null, 2)}</pre>
      </Box>
    </Box>
  );
};

/**
 * Example 2: With Validation
 * 
 * Shows how to integrate validation error display
 */
export const ValidationExample: React.FC = () => {
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([
    { id: '1', text: '' },
    { id: '2', text: 'a'.repeat(501) } // Exceeds max length
  ]);
  
  const [errors, setErrors] = useState<Record<string, string>>({
    'impactItems[0].text': 'Impact Item 1: Text is required',
    'impactItems[1].text': 'Impact Item 2: Text must not exceed 500 characters'
  });

  const handleValidate = () => {
    const newErrors: Record<string, string> = {};
    
    impactItems.forEach((item, index) => {
      const trimmedText = item.text.trim();
      
      if (!trimmedText) {
        newErrors[`impactItems[${index}].text`] = `Impact Item ${index + 1}: Text is required`;
      } else if (trimmedText.length > 500) {
        newErrors[`impactItems[${index}].text`] = `Impact Item ${index + 1}: Text must not exceed 500 characters`;
      }
    });
    
    setErrors(newErrors);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Validation Example
      </Typography>
      
      <ImpactSection
        impactItems={impactItems}
        onImpactItemsChange={setImpactItems}
        errors={errors}
      />
      
      <Button 
        variant="contained" 
        onClick={handleValidate}
        sx={{ mt: 2 }}
      >
        Validate
      </Button>
      
      {Object.keys(errors).length === 0 && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          ✓ All impact items are valid
        </Typography>
      )}
    </Box>
  );
};

/**
 * Example 3: Pre-filled Data
 * 
 * Shows component with existing impact items
 */
export const PrefilledExample: React.FC = () => {
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([
    { 
      id: '1', 
      text: 'System will be unavailable during the deployment window' 
    },
    { 
      id: '2', 
      text: 'Users may experience slower performance immediately after deployment' 
    },
    { 
      id: '3', 
      text: 'All active sessions will be terminated at deployment start' 
    }
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Pre-filled Example
      </Typography>
      
      <ImpactSection
        impactItems={impactItems}
        onImpactItemsChange={setImpactItems}
      />
    </Box>
  );
};

/**
 * Example 4: Maximum Capacity
 * 
 * Shows behavior at maximum capacity (100 items)
 */
export const MaximumCapacityExample: React.FC = () => {
  const [impactItems, setImpactItems] = useState<ImpactItem[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      text: `Impact item ${i + 1}`
    }))
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Maximum Capacity Example (100 items)
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        The Add button should be disabled and a warning message should appear.
      </Typography>
      
      <ImpactSection
        impactItems={impactItems}
        onImpactItemsChange={setImpactItems}
      />
    </Box>
  );
};

/**
 * Example 5: Form Integration
 * 
 * Shows how to integrate with a larger deployment form
 */
export const FormIntegrationExample: React.FC = () => {
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([
    { id: '1', text: '' }
  ]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    // Validate impact items
    const newErrors: Record<string, string> = {};
    
    if (impactItems.length === 0) {
      newErrors['impactItems'] = 'At least one Impact Item is required';
    } else if (impactItems.length > 100) {
      newErrors['impactItems'] = 'Maximum of 100 Impact Items allowed';
    }
    
    impactItems.forEach((item, index) => {
      const trimmedText = item.text.trim();
      
      if (!trimmedText) {
        newErrors[`impactItems[${index}].text`] = `Impact Item ${index + 1}: Text is required`;
      } else if (trimmedText.length > 500) {
        newErrors[`impactItems[${index}].text`] = `Impact Item ${index + 1}: Text must not exceed 500 characters`;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      alert('Form submitted successfully!');
      console.log('Impact Items:', impactItems);
    }
  };

  const handleReset = () => {
    setImpactItems([{ id: `item-${Date.now()}`, text: '' }]);
    setErrors({});
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Form Integration Example
      </Typography>
      
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <ImpactSection
          impactItems={impactItems}
          onImpactItemsChange={setImpactItems}
          errors={errors}
        />
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
          >
            Submit Form
          </Button>
          
          <Button 
            type="button" 
            variant="outlined" 
            onClick={handleReset}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Example 6: All Examples in One View
 * 
 * Renders all examples for demonstration
 */
export const AllExamples: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        ImpactSection Component Examples
      </Typography>
      
      <BasicExample />
      <Box sx={{ borderTop: 2, borderColor: 'divider', my: 3 }} />
      
      <ValidationExample />
      <Box sx={{ borderTop: 2, borderColor: 'divider', my: 3 }} />
      
      <PrefilledExample />
      <Box sx={{ borderTop: 2, borderColor: 'divider', my: 3 }} />
      
      <FormIntegrationExample />
      <Box sx={{ borderTop: 2, borderColor: 'divider', my: 3 }} />
      
      <MaximumCapacityExample />
    </Box>
  );
};

export default AllExamples;
