/**
 * ChangeItemsSection Component
 * 
 * Section for managing Change_Item entries (Jira change items).
 * 
 * Performance optimizations:
 * - Extracted ChangeItemRow component and wrapped with React.memo (22.2)
 * - Parent component wrapped with React.memo to prevent re-renders (22.2)
 * - Callbacks memoized with useCallback (22.2: Performance optimization)
 * 
 * Requirements:
 * - 6.1: Allow 1-999 Change_Item entries
 * - 6.2: Each item requires non-empty Jira Number (1-50 chars) and Description (1-500 chars)
 * - 6.3: Show validation errors for empty fields
 * - 6.4: Remove individual items without altering others
 * - 6.5: Prevent removal when only 1 item remains
 * - 6.6: Require at least one Change_Item
 * - 6.7: Display Jira Number in <strong> followed by Description
 */

import { useCallback, memo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Alert,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChangeItem } from '../types/models';

/**
 * Props for individual change item row
 */
interface ChangeItemRowProps {
  item: ChangeItem;
  index: number;
  isAtMinimum: boolean;
  errors?: { jiraNumber?: string; description?: string };
  onItemChange: (id: string, field: 'jiraNumber' | 'description', value: string) => void;
  onRemoveItem: (id: string) => void;
}

/**
 * ChangeItemRow - Individual row component for a single change item
 * Memoized with React.memo to prevent re-renders of other rows (22.2: Performance)
 */
const ChangeItemRow = memo<ChangeItemRowProps>(({
  item,
  index,
  isAtMinimum,
  errors = {},
  onItemChange,
  onRemoveItem
}) => (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      border: (errors.jiraNumber || errors.description) 
        ? '1px solid' 
        : 'none',
      borderColor: 'error.main'
    }}
    component="article"
    aria-labelledby={`change-item-${index}-heading`}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ mb: 1, fontWeight: 'bold' }}
          id={`change-item-${index}-heading`}
        >
          Change Item {index + 1}
        </Typography>
        
        {/* Jira Number Input - Requirement: 6.2, 6.3 */}
        <TextField
          fullWidth
          required
          label="Jira Number"
          value={item.jiraNumber}
          onChange={(e) => onItemChange(item.id, 'jiraNumber', e.target.value)}
          error={!!errors.jiraNumber}
          helperText={errors.jiraNumber || 'Max 50 characters'}
          slotProps={{
            htmlInput: {
              maxLength: 50,
              'aria-label': `Jira number for change item ${index + 1}`,
              'aria-describedby': errors.jiraNumber ? `change-item-${index}-jira-error` : `change-item-${index}-jira-help`,
              'aria-invalid': !!errors.jiraNumber
            }
          }}
          sx={{ mb: 2 }}
        />
        
        {/* Description Textarea - Requirement: 6.2, 6.3 */}
        <TextField
          fullWidth
          required
          multiline
          rows={3}
          label="Description"
          value={item.description}
          onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
          error={!!errors.description}
          helperText={errors.description || 'Max 500 characters'}
          slotProps={{
            htmlInput: {
              maxLength: 500,
              'aria-label': `Description for change item ${index + 1}`,
              'aria-describedby': errors.description ? `change-item-${index}-desc-error` : `change-item-${index}-desc-help`,
              'aria-invalid': !!errors.description
            }
          }}
        />
      </Box>
      
      {/* Remove Button - Requirements: 6.4, 6.5 */}
      <IconButton
        aria-label={`Remove change item ${index + 1}`}
        onClick={() => onRemoveItem(item.id)}
        disabled={isAtMinimum}
        color="error"
        title={isAtMinimum ? 'At least one change item is required' : undefined}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  </Paper>
));

ChangeItemRow.displayName = 'ChangeItemRow';

export interface ChangeItemsSectionProps {
  /** Array of change items (1-999 items) */
  changeItems: ChangeItem[];
  /** Callback when change items are updated */
  onChange: (items: ChangeItem[]) => void;
  /** Validation errors for specific items (map of item id to error message) */
  errors?: Record<string, { jiraNumber?: string; description?: string }>;
  /** General error message for the section */
  sectionError?: string;
}

/**
 * ChangeItemsSection component
 * 
 * Displays a list of Change_Item entries with Add/Remove controls.
 * Each item has text input for Jira Number and textarea for Description.
 * 
 * Performance: Memoized with React.memo and uses useCallback for handlers (22.2)
 */
function ChangeItemsSectionComponent({
  changeItems,
  onChange,
  errors = {},
  sectionError
}: ChangeItemsSectionProps) {
  /**
   * Add a new change item (max 999)
   * Requirement: 6.1
   * Memoized with useCallback (22.2: Performance optimization)
   */
  const handleAddItem = useCallback(() => {
    if (changeItems.length >= 999) {
      return; // Already at maximum
    }
    
    const newItem: ChangeItem = {
      id: `change-item-${Date.now()}-${Math.random()}`,
      jiraNumber: '',
      description: ''
    };
    
    onChange([...changeItems, newItem]);
  }, [changeItems.length, onChange]);

  /**
   * Remove a change item by id (min 1 required)
   * Requirements: 6.4, 6.5, 6.6
   * Memoized with useCallback (22.2: Performance optimization)
   */
  const handleRemoveItem = useCallback((id: string) => {
    if (changeItems.length <= 1) {
      return; // Must keep at least one item
    }
    
    onChange(changeItems.filter(item => item.id !== id));
  }, [changeItems.length, onChange]);

  /**
   * Update a specific change item field
   * Requirement: 6.2
   * Memoized with useCallback (22.2: Performance optimization)
   */
  const handleItemChange = useCallback((id: string, field: 'jiraNumber' | 'description', value: string) => {
    onChange(
      changeItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }, [changeItems, onChange]);

  // Check if at maximum items (disable Add button)
  const isAtMaximum = changeItems.length >= 999;
  
  // Check if at minimum items (disable Remove button)
  const isAtMinimum = changeItems.length <= 1;

  return (
    <Box sx={{ mb: 3 }} component="section" aria-labelledby="change-items-heading">
      <Typography variant="h6" gutterBottom id="change-items-heading">
        Change Items
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        List the Jira change items included in this deployment (1-999 items required)
      </Typography>
      
      {/* Requirement 6.3: Show section-level validation error */}
      {sectionError && (
        <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-live="polite">
          {sectionError}
        </Alert>
      )}
      
      {/* ARIA live region for announcing add/remove actions */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {changeItems.length} change {changeItems.length === 1 ? 'item' : 'items'} in the list
      </div>
      
      <Stack spacing={2}>
        {changeItems.map((item, index) => {
          const itemErrors = errors[item.id] || {};
          
          return (
            <ChangeItemRow
              key={item.id}
              item={item}
              index={index}
              isAtMinimum={isAtMinimum}
              errors={itemErrors}
              onItemChange={handleItemChange}
              onRemoveItem={handleRemoveItem}
            />
          );
        })}
      </Stack>
      
      {/* Add Button - Requirement: 6.1 */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddItem}
        disabled={isAtMaximum}
        sx={{ mt: 2 }}
        fullWidth
      >
        {isAtMaximum ? 'Maximum 999 items reached' : 'Add Change Item'}
      </Button>
      
      {isAtMaximum && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ mt: 1, display: 'block' }}
          id="change-items-max-message"
        >
          You have reached the maximum of 999 change items.
        </Typography>
      )}
    </Box>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const ChangeItemsSection = memo(ChangeItemsSectionComponent);
