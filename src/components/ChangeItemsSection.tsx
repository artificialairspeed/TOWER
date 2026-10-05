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
 * - 6.6: Require at least one Change_Item (enforced at form validation time,
 *        not by blocking removal here — the list may be emptied entirely)
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
  Stack,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ChangeItem, ImpactItem } from '../types/models';
import { createNewChangeItem } from '../data/formFactory';
import { ImpactSection } from './ImpactSection';

/**
 * ItemNumberBadge - Outlined chip displaying an item number
 * Uses the SWA blue primary accent to match the app styling; flips to a
 * filled error chip when the row has a validation error so it stays visible
 * against the rest of the (otherwise outlined) chip population.
 */
interface ItemNumberBadgeProps {
  number: number;
  hasError?: boolean;
  /** DOM id so the surrounding row can reference the badge as its label */
  id?: string;
}

const ItemNumberBadge = memo<ItemNumberBadgeProps>(({ number, hasError = false, id }) => (
  <Chip
    id={id}
    label={number}
    color={hasError ? 'error' : 'primary'}
    variant={hasError ? 'filled' : 'outlined'}
    sx={{
      flexShrink: 0,
      fontWeight: 600,
      fontSize: '0.9rem',
      minWidth: 40,
      // Match the 2px border weight used by outlined buttons (e.g. "Add Change Item")
      borderWidth: 2
    }}
    aria-label={`Change item ${number}`}
  />
));

ItemNumberBadge.displayName = 'ItemNumberBadge';

/**
 * Props for individual change item row
 */
interface ChangeItemRowProps {
  item: ChangeItem;
  index: number;
  errors?: { jiraNumber?: string; description?: string };
  /** Validation errors for this change item's impact items, keyed by nested field path */
  impactErrors?: Record<string, string>;
  onItemChange: (id: string, field: 'jiraNumber' | 'description', value: string) => void;
  onRemoveItem: (id: string) => void;
  /** Update the impact items belonging to a specific change item */
  onImpactItemsChange: (changeItemId: string, impactItems: ImpactItem[]) => void;
}

/**
 * ChangeItemRow - Individual row component for a single change item
 * Memoized with React.memo to prevent re-renders of other rows (22.2: Performance)
 */
const ChangeItemRow = memo<ChangeItemRowProps>(({
  item,
  index,
  errors = {},
  impactErrors,
  onItemChange,
  onRemoveItem,
  onImpactItemsChange
}) => {
  const hasError = !!(errors.jiraNumber || errors.description);

  // Stable per-row handler so the memoized ImpactSection only re-renders when
  // this change item's impact items actually change.
  const handleImpactItemsChange = useCallback(
    (impactItems: ImpactItem[]) => onImpactItemsChange(item.id, impactItems),
    [onImpactItemsChange, item.id]
  );

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
      {/* Item Number Badge - Icon component instead of text header.
          Carries the id that the surrounding <article> is labelled by. */}
      <ItemNumberBadge
        id={`change-item-${index}-badge`}
        number={index + 1}
        hasError={hasError}
      />
      
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
            helperText={
              errors.jiraNumber ? (
                <span id={`change-item-${index}-jira-error`}>{errors.jiraNumber}</span>
              ) : undefined
            }
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
            helperText={
              errors.description ? (
                <span id={`change-item-${index}-desc-error`}>{errors.description}</span>
              ) : undefined
            }
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

        {/* Screen-reader hints for the two fields above. Rendered only when the
            field is valid; the error variant is the helperText span. */}
        {!errors.jiraNumber && (
          <span id={`change-item-${index}-jira-help`} className="sr-only">
            Enter the Jira ticket number for this change, for example OQS-1234
          </span>
        )}
        {!errors.description && (
          <span id={`change-item-${index}-desc-help`} className="sr-only">
            Enter a short title or description for this change
          </span>
        )}
      </Box>

      {/* Remove Button - Requirement: 6.4 */}
      <IconButton
        aria-label={`Remove change item ${index + 1}`}
        onClick={() => onRemoveItem(item.id)}
        color="error"
      >
        <DeleteIcon />
      </IconButton>
    </Box>

    {/* Nested Impact Items - impacts are children of this change item */}
    <ImpactSection
      changeItemIndex={index}
      impactItems={item.impactItems}
      onImpactItemsChange={handleImpactItemsChange}
      errors={impactErrors}
    />
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
  /** Validation errors for nested impact items, keyed by nested field path */
  impactErrors?: Record<string, string>;
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
  impactErrors,
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

    onChange([...changeItems, createNewChangeItem()]);
  }, [changeItems, onChange]);

  /**
   * Remove a change item by id.
   * Requirement: 6.4
   * The list may be emptied entirely; it starts empty by default and a card is
   * only shown once the user adds one. The "at least one Change Item" business
   * rule is enforced at form validation time, not by blocking removal here.
   * Memoized with useCallback (22.2: Performance optimization)
   */
  const handleRemoveItem = useCallback((id: string) => {
    onChange(changeItems.filter(item => item.id !== id));
  }, [changeItems, onChange]);

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

  /**
   * Update the impact items belonging to a specific change item.
   * Only the targeted change item is modified; all others are preserved.
   */
  const handleImpactItemsChange = useCallback((changeItemId: string, impactItems: ImpactItem[]) => {
    onChange(
      changeItems.map(item =>
        item.id === changeItemId ? { ...item, impactItems } : item
      )
    );
  }, [changeItems, onChange]);

  // Check if at maximum items (disable Add button)
  const isAtMaximum = changeItems.length >= 999;

  // No cards are shown until the user adds the first change item.
  const isEmpty = changeItems.length === 0;

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
      
      {/* Empty state: no cards are shown until the user adds a change item */}
      {isEmpty && (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            borderStyle: 'dashed',
            color: 'text.secondary'
          }}
        >
          <Typography variant="body2">
            No change items yet. Select &ldquo;Add Change Item&rdquo; to add one.
          </Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {changeItems.map((item, index) => {
          const itemErrors = errors[item.id] || {};
          
          return (
            <ChangeItemRow
              key={item.id}
              item={item}
              index={index}
              errors={itemErrors}
              impactErrors={impactErrors}
              onItemChange={handleItemChange}
              onRemoveItem={handleRemoveItem}
              onImpactItemsChange={handleImpactItemsChange}
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
        aria-describedby={isAtMaximum ? 'change-items-max-message' : undefined}
        // Explicit borderWidth so this stays in sync with the ItemNumberBadge chip's border
        sx={{ mt: 2, borderWidth: 2 }}
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
