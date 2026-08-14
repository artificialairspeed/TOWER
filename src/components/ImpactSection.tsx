/**
 * ImpactSection Component
 * 
 * Provides UI for managing deployment impact items:
 * - Display list of Impact_Item entries with Add/Remove controls
 * - Each item: textarea for impact text (max 500 chars)
 * - Add button creates new item (max 100 total)
 * - Remove button deletes item (min 1 required)
 * - Disable Add at 100 items, show message "Maximum 100 impact items reached"
 * - Disable Remove when only 1 item remains
 * - Show validation errors for empty text or text > 500 chars
 * - Preserve insertion order for rendering
 * 
 * Performance optimizations:
 * - Extracted ImpactItemRow component and wrapped with React.memo (22.2)
 * - Parent component wrapped with React.memo (22.2: Performance optimization)
 * - Callbacks memoized with useCallback (22.2: Performance optimization)
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
 */

import { useCallback, memo } from 'react';
import { Box, Typography, TextField, Button, IconButton, Alert } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ImpactItem } from '../types/models';

/**
 * Props for individual impact item row
 */
interface ImpactItemRowProps {
  item: ImpactItem;
  index: number;
  isAtMinCapacity: boolean;
  error?: string;
  onTextChange: (itemId: string, newText: string) => void;
  onRemoveItem: (itemId: string) => void;
}

/**
 * ImpactItemRow - Individual row component for a single impact item
 * Memoized with React.memo to prevent re-renders of other rows (22.2: Performance)
 */
const ImpactItemRow = memo<ImpactItemRowProps>(({
  item,
  index,
  isAtMinCapacity,
  error,
  onTextChange,
  onRemoveItem
}) => {
  const charCount = item.text.length;
  const isOverLimit = charCount > 500;
  const charCountText = isOverLimit
    ? `${charCount}/500 characters - exceeds maximum length`
    : `${charCount}/500 characters`;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        mb: 2,
        alignItems: 'flex-start'
      }}
    >
      {/* Impact text textarea - Requirements: 7.3, 7.4 */}
      <TextField
        label={`Impact Item ${index + 1}`}
        value={item.text}
        onChange={(e) => onTextChange(item.id, e.target.value)}
        multiline
        rows={3}
        fullWidth
        required
        error={!!error}
        helperText={error || charCountText}
        slotProps={{
          htmlInput: {
            'aria-label': `Impact item ${index + 1} description`,
            'aria-describedby': error ? `impact-item-${index}-error` : `impact-item-${index}-help`,
            'aria-invalid': !!error
          }
        }}
      />
      
      {/* Remove button - Requirements: 7.5, 7.6 */}
      <IconButton
        onClick={() => onRemoveItem(item.id)}
        disabled={isAtMinCapacity}
        color="error"
        aria-label={`Remove impact item ${index + 1}`}
        title={isAtMinCapacity ? 'At least one impact item is required' : undefined}
        sx={{ mt: 1 }}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
});

ImpactItemRow.displayName = 'ImpactItemRow';

export interface ImpactSectionProps {
  /** Current list of impact items (1-100 items) */
  impactItems: ImpactItem[];
  /** Callback when impact items list changes */
  onImpactItemsChange: (items: ImpactItem[]) => void;
  /** Validation errors for impact items */
  errors?: Record<string, string>;
}

/**
 * ImpactSection component for managing deployment impact items
 * 
 * Performance: Memoized with React.memo and uses useCallback for handlers (22.2)
 */
function ImpactSectionComponent({
  impactItems,
  onImpactItemsChange,
  errors = {}
}: ImpactSectionProps) {
  // Check if we're at maximum capacity (100 items) - Requirement 7.2
  const isAtMaxCapacity = impactItems.length >= 100;
  
  // Check if we're at minimum capacity (1 item) - Requirement 7.6
  const isAtMinCapacity = impactItems.length <= 1;

  /**
   * Handle adding a new impact item
   * Requirements: 7.1, 7.2
   * Memoized with useCallback (22.2: Performance optimization)
   */
  const handleAddItem = useCallback(() => {
    if (isAtMaxCapacity) {
      return; // Already at max capacity
    }
    
    // Create new item with unique ID
    const newItem: ImpactItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: ''
    };
    
    // Append to list (preserves insertion order - Requirement 7.8)
    onImpactItemsChange([...impactItems, newItem]);
  }, [impactItems.length, isAtMaxCapacity, onImpactItemsChange]);

  /**
   * Handle removing an impact item
   * Requirements: 7.5, 7.6
   * Memoized with useCallback (22.2: Performance optimization)
   */
  const handleRemoveItem = useCallback((itemId: string) => {
    if (isAtMinCapacity) {
      return; // Cannot remove last item
    }
    
    // Remove item by ID, preserving order of remaining items
    const updatedItems = impactItems.filter(item => item.id !== itemId);
    onImpactItemsChange(updatedItems);
  }, [impactItems, isAtMinCapacity, onImpactItemsChange]);

  /**
   * Handle updating an impact item's text
   * Requirements: 7.3, 7.4
   * Memoized with useCallback (22.2: Performance optimization)
   */
  const handleTextChange = useCallback((itemId: string, newText: string) => {
    // Update the specific item, preserving order
    const updatedItems = impactItems.map(item =>
      item.id === itemId ? { ...item, text: newText } : item
    );
    onImpactItemsChange(updatedItems);
  }, [impactItems, onImpactItemsChange]);

  return (
    <Box sx={{ mb: 3 }} component="section" aria-labelledby="impact-items-heading">
      <Typography variant="h6" gutterBottom id="impact-items-heading">
        Impact Items *
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        List the deployment impacts (1-100 items, max 500 characters per item)
      </Typography>

      {/* Show maximum capacity message when at 100 items - Requirement 7.2 */}
      {isAtMaxCapacity && (
        <Alert severity="warning" sx={{ mb: 2 }} role="alert" aria-live="polite">
          Maximum 100 impact items reached
        </Alert>
      )}

      {/* ARIA live region for announcing add/remove actions */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {impactItems.length} impact {impactItems.length === 1 ? 'item' : 'items'} in the list
      </div>

      {/* List of impact items */}
      {impactItems.map((item, index) => {
        const fieldKey = `impactItems[${index}].text`;
        const itemError = errors[fieldKey];

        return (
          <ImpactItemRow
            key={item.id}
            item={item}
            index={index}
            isAtMinCapacity={isAtMinCapacity}
            error={itemError}
            onTextChange={handleTextChange}
            onRemoveItem={handleRemoveItem}
          />
        );
      })}

      {/* Add button - Requirements: 7.1, 7.2 */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddItem}
        disabled={isAtMaxCapacity}
        sx={{ mt: 1 }}
      >
        Add Impact Item
      </Button>
      
      {/* General validation error for impact items list */}
      {errors['impactItems'] && (
        <Alert severity="error" sx={{ mt: 2 }} role="alert" aria-live="polite">
          {errors['impactItems']}
        </Alert>
      )}
    </Box>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const ImpactSection = memo(ImpactSectionComponent);
