/**
 * ImpactSection Component
 *
 * Nested sub-section for managing the impact items that belong to a single
 * Change Item. Impact items are children of a change item, so this section is
 * rendered inside each change item row rather than as a standalone top-level
 * section.
 *
 * Behavior:
 * - Display the parent change item's impact items with Add/Remove controls
 * - Each item: single-line text field for impact text (max 500 chars)
 * - Add button creates a new item (max 100 per change item)
 * - Remove button deletes an item (impacts are optional, so removing the last
 *   one is allowed — a change item may carry zero impact items)
 * - Disable Add at 100 items, show message "Maximum 100 impact items reached"
 * - Show validation errors for empty text or text > 500 chars
 * - Preserve insertion order for rendering
 *
 * Performance optimizations:
 * - Extracted ImpactItemRow component and wrapped with React.memo
 * - Parent component wrapped with React.memo
 * - Callbacks memoized with useCallback
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
 */

import { useCallback, memo } from 'react';
import { Box, Typography, TextField, Button, IconButton, Alert, Chip } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ImpactItem } from '../types/models';
import { createNewImpactItem } from '../data/formFactory';

/** Maximum number of impact items allowed per change item */
const MAX_IMPACT_ITEMS = 100;

/**
 * ImpactNumberBadge - Small outlined chip displaying an impact item's number.
 * A compact red counterpart to the change item's blue ItemNumberBadge; it
 * echoes the red the impacts render with in the output. Decorative only — the
 * impact text field already announces its position to screen readers, so the
 * badge is aria-hidden to avoid a duplicate announcement.
 */
interface ImpactNumberBadgeProps {
  number: number;
}

const ImpactNumberBadge = memo<ImpactNumberBadgeProps>(({ number }) => (
  <Chip
    aria-hidden="true"
    label={number}
    color="error"
    variant="outlined"
    size="small"
    sx={{
      flexShrink: 0,
      fontWeight: 600,
      fontSize: '0.7rem',
      minWidth: 28,
      // Match the 2px border weight used by outlined buttons (e.g. "Add Change Item")
      borderWidth: 2
    }}
  />
));

ImpactNumberBadge.displayName = 'ImpactNumberBadge';

/**
 * Props for individual impact item row
 */
interface ImpactItemRowProps {
  item: ImpactItem;
  index: number;
  /** DOM-id prefix unique to the parent change item (keeps ARIA ids unique) */
  idPrefix: string;
  error?: string;
  onTextChange: (itemId: string, newText: string) => void;
  onRemoveItem: (itemId: string) => void;
}

/**
 * ImpactItemRow - Individual row component for a single impact item
 * Memoized with React.memo to prevent re-renders of other rows
 */
const ImpactItemRow = memo<ImpactItemRowProps>(({
  item,
  index,
  idPrefix,
  error,
  onTextChange,
  onRemoveItem
}) => {
  const hasError = !!error;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Numbered red badge, echoing the red impacts render with in the output */}
      <ImpactNumberBadge number={index + 1} />

      {/* Impact text field - single line, no wrapping - Requirements: 7.3, 7.4 */}
      <TextField
        placeholder="Impact statement"
        value={item.text}
        onChange={(e) => onTextChange(item.id, e.target.value)}
        fullWidth
        size="small"
        error={hasError}
        helperText={error ? <span id={`${idPrefix}-error`}>{error}</span> : undefined}
        slotProps={{
          htmlInput: {
            maxLength: 500,
            'aria-label': `Impact statement ${index + 1}`,
            'aria-describedby': error ? `${idPrefix}-error` : `${idPrefix}-help`,
            'aria-invalid': hasError,
            style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
          }
        }}
      />

      {/* Screen-reader hint, rendered only while the field is valid; the error
          variant is the helperText span above. */}
      {!hasError && (
        <span id={`${idPrefix}-help`} className="sr-only">
          Describe one deployment impact for this change, up to 500 characters
        </span>
      )}

      {/* Remove button - impacts are optional, so this is always enabled */}
      <IconButton
        onClick={() => onRemoveItem(item.id)}
        color="error"
        size="small"
        aria-label={`Remove impact statement ${index + 1}`}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
});

ImpactItemRow.displayName = 'ImpactItemRow';

export interface ImpactSectionProps {
  /** Index of the parent change item (used for unique ids and error field keys) */
  changeItemIndex: number;
  /** Current list of impact items for the parent change item (0-100 items) */
  impactItems: ImpactItem[];
  /** Callback when the impact items list changes */
  onImpactItemsChange: (items: ImpactItem[]) => void;
  /** Validation errors for impact items, keyed by nested field path */
  errors?: Record<string, string>;
}

/**
 * ImpactSection component for managing a change item's impact items
 *
 * Performance: Memoized with React.memo and uses useCallback for handlers
 */
function ImpactSectionComponent({
  changeItemIndex,
  impactItems,
  onImpactItemsChange,
  errors = {}
}: ImpactSectionProps) {
  // Check if we're at maximum capacity (100 items per change item)
  const isAtMaxCapacity = impactItems.length >= MAX_IMPACT_ITEMS;

  /**
   * Handle adding a new impact item
   * Requirements: 7.1, 7.2
   */
  const handleAddItem = useCallback(() => {
    if (impactItems.length >= MAX_IMPACT_ITEMS) {
      return; // Already at max capacity
    }

    // Append a new item (preserves insertion order - Requirement 7.8)
    onImpactItemsChange([...impactItems, createNewImpactItem()]);
  }, [impactItems, onImpactItemsChange]);

  /**
   * Handle removing an impact item.
   * Impacts are optional children, so removing the last item is allowed.
   * Requirements: 7.5
   */
  const handleRemoveItem = useCallback((itemId: string) => {
    const updatedItems = impactItems.filter(item => item.id !== itemId);
    onImpactItemsChange(updatedItems);
  }, [impactItems, onImpactItemsChange]);

  /**
   * Handle updating an impact item's text
   * Requirements: 7.3, 7.4
   */
  const handleTextChange = useCallback((itemId: string, newText: string) => {
    const updatedItems = impactItems.map(item =>
      item.id === itemId ? { ...item, text: newText } : item
    );
    onImpactItemsChange(updatedItems);
  }, [impactItems, onImpactItemsChange]);

  const headingId = `change-${changeItemIndex}-impacts-heading`;

  return (
    <Box
      sx={{ mt: 2, pl: { xs: 0, sm: 2 }, borderLeft: { sm: '2px solid' }, borderColor: { sm: 'divider' } }}
      component="section"
      aria-labelledby={headingId}
    >
      <Typography
        variant="subtitle2"
        id={headingId}
        sx={{ color: 'text.secondary', mb: 1 }}
      >
        Impacts
      </Typography>

      {/* Show maximum capacity message when at 100 items - Requirement 7.2 */}
      {isAtMaxCapacity && (
        <Alert severity="warning" sx={{ mb: 1 }} role="alert" aria-live="polite">
          Maximum {MAX_IMPACT_ITEMS} impact items reached
        </Alert>
      )}

      {/* ARIA live region for announcing add/remove actions */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {impactItems.length} impact {impactItems.length === 1 ? 'item' : 'items'} for this change
      </div>

      {/* List of impact items */}
      {impactItems.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
          {impactItems.map((item, index) => {
            const fieldKey = `changeItems[${changeItemIndex}].impactItems[${index}].text`;
            const itemError = errors[fieldKey];
            const idPrefix = `change-${changeItemIndex}-impact-${index}`;

            return (
              <ImpactItemRow
                key={item.id}
                item={item}
                index={index}
                idPrefix={idPrefix}
                error={itemError}
                onTextChange={handleTextChange}
                onRemoveItem={handleRemoveItem}
              />
            );
          })}
        </Box>
      )}

      {/* Add button - Requirements: 7.1, 7.2 */}
      <Button
        variant="text"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAddItem}
        disabled={isAtMaxCapacity}
        sx={{ mt: impactItems.length > 0 ? 0 : 0.5 }}
      >
        {isAtMaxCapacity ? `Maximum ${MAX_IMPACT_ITEMS} items reached` : 'Add Impact'}
      </Button>
    </Box>
  );
}

// Wrap component with React.memo to prevent re-renders
export const ImpactSection = memo(ImpactSectionComponent);
