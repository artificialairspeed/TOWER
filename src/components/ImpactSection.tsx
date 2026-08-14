/**
 * ImpactSection Component
 * 
 * Provides UI for managing deployment impact items:
 * - Display list of Impact_Item entries with Add/Remove controls
 * - Each item: single-line text field for impact text (max 500 chars)
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
import { Box, Typography, TextField, Button, IconButton, Alert, Paper } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ImpactItem } from '../types/models';

/**
 * ItemNumberBadge - Circular badge displaying an item number
 * Uses amber to indicate impact/consequences of the deployment
 * Matches the design of the deployment queue position badge
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
      bgcolor: hasError ? 'error.main' : 'warning.main',
      color: 'warning.contrastText',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '1rem',
    }}
    aria-label={`Impact item ${number}`}
  >
    {number}
  </Box>
));

ItemNumberBadge.displayName = 'ItemNumberBadge';

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
  const hasError = !!error;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: hasError ? 'error.main' : 'divider',
        borderRadius: 1,
        mb: 2
      }}
      component="article"
      aria-labelledby={`impact-item-${index}-badge`}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Item Number Badge - Icon component */}
        <ItemNumberBadge number={index + 1} hasError={hasError} />
        
        {/* Impact text field - single line, no wrapping - Requirements: 7.3, 7.4 */}
        <TextField
          placeholder="Impacts *"
          value={item.text}
          onChange={(e) => onTextChange(item.id, e.target.value)}
          fullWidth
          required
          error={hasError}
          slotProps={{
            htmlInput: {
              maxLength: 500,
              'aria-label': `Impact item ${index + 1} description`,
              'aria-describedby': error ? `impact-item-${index}-error` : `impact-item-${index}-help`,
              'aria-invalid': hasError,
              style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
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
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Paper>
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
        Impact Items
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
        sx={{ mt: 2 }}
        fullWidth
      >
        {isAtMaxCapacity ? 'Maximum 100 items reached' : 'Add Impact Item'}
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
