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
 * ItemNumberBadge - Circular badge displaying an item number
 * Uses green for Change Items to indicate approved changes ready to deploy
 * Distinct from the blue deployment queue position badge
 */
interface ItemNumberBadgeProps {
  number: number;
  hasError?: boolean;
}

const ItemNumberBadge = memo<ItemNumberBadgeProps>(({ number, hasError = false }) => (
  <Box
    sx={{
      flexShrink: 0,
      minWidth: 44,
      height: 44,
      borderRadius: '50%',
      bgcolor: hasError ? 'error.main' : 'success.main',
      color: 'success.contrastText',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '1rem',
    }}
    aria-label={`Change item ${number}`}
  >
    {number}
  </Box>
));

ItemNumberBadge.displayName = 'ItemNumberBadge';

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
}) => {
  const hasError = !!(errors.jiraNumber || errors.description);
  
  return (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      border: '1px solid',
      borderColor: hasError ? 'error.main' : 'divider',
      borderRadius: 1
    }}
    component="article"
    aria-labelledby={`change-item-${index}-badge`}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Item Number Badge - Icon component instead of text header */}
      <ItemNumberBadge number={index + 1} hasError={hasError} />
      
      <Box sx={{ flex: 1 }}>
        {/* Jira Number and Description on same line - Requirement: 6.2, 6.3 */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Jira Number Input - 25% width */}
          <TextField
            required
            label="Jira #"
            value={item.jiraNumber}
            onChange={(e) => onItemChange(item.id, 'jiraNumber', e.target.value)}
            error={!!errors.jiraNumber}
            slotProps={{
              htmlInput: {
                maxLength: 50,
                'aria-label': `Jira number for change item ${index + 1}`,
                'aria-describedby': errors.jiraNumber ? `change-item-${index}-jira-error` : `change-item-${index}-jira-help`,
                'aria-invalid': !!errors.jiraNumber,
                style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
              }
            }}
            sx={{ flex: '0 0 25%' }}
          />
          
          {/* Description Input - 75% width, same height as Jira # */}
          <TextField
            required
            label="Description"
            value={item.description}
            onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
            error={!!errors.description}
            slotProps={{
              htmlInput: {
                maxLength: 500,
                'aria-label': `Description for change item ${index + 1}`,
                'aria-describedby': errors.description ? `change-item-${index}-desc-error` : `change-item-${index}-desc-help`,
                'aria-invalid': !!errors.description,
                style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
              }
            }}
            sx={{ flex: '0 0 75%' }}
          />
        </Box>
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
  );
});

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
   * Note: jiraNumber is automatically converted to uppercase
   */
  const handleItemChange = useCallback((id: string, field: 'jiraNumber' | 'description', value: string) => {
    const processedValue = field === 'jiraNumber' ? value.toUpperCase() : value;
    onChange(
      changeItems.map(item =>
        item.id === id ? { ...item, [field]: processedValue } : item
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
