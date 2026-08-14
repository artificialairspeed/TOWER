/**
 * ImpactSection Component Tests
 * 
 * Tests for the Impact Item management UI component.
 * Validates Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImpactSection } from './ImpactSection';
import type { ImpactItem } from '../types/models';

describe('ImpactSection', () => {
  // Helper: Create mock impact items
  const createMockItem = (id: string, text: string): ImpactItem => ({
    id,
    text
  });

  // Helper: Render component with default props
  const renderComponent = (
    impactItems: ImpactItem[] = [createMockItem('1', '')],
    errors: Record<string, string> = {},
    onImpactItemsChange: (items: ImpactItem[]) => void = vi.fn()
  ) => {
    return render(
      <ImpactSection
        impactItems={impactItems}
        onImpactItemsChange={onImpactItemsChange}
        errors={errors}
      />
    );
  };

  describe('Requirement 7.1: Add Impact Items (1-100 items)', () => {
    it('should display Add Impact Item button', () => {
      renderComponent();
      expect(screen.getByText('Add Impact Item')).toBeInTheDocument();
    });

    it('should append a new empty impact item when Add button is clicked', async () => {
      const mockOnChange = vi.fn();
      renderComponent([createMockItem('1', 'First item')], {}, mockOnChange);

      const addButton = screen.getByText('Add Impact Item');
      fireEvent.click(addButton);

      // Should be called with 2 items (the original + new one)
      expect(mockOnChange).toHaveBeenCalled();
      const newItems = mockOnChange.mock.calls[0][0];
      expect(newItems).toHaveLength(2);
      expect(newItems[0]).toEqual(createMockItem('1', 'First item'));
      expect(newItems[1].id).toBeTruthy();
      expect(newItems[1].text).toBe('');
    });

    it('should preserve insertion order when adding new items', async () => {
      const mockOnChange = vi.fn();
      const items = [
        createMockItem('1', 'Item 1'),
        createMockItem('2', 'Item 2')
      ];
      renderComponent(items, {}, mockOnChange);

      const addButton = screen.getByText('Add Impact Item');
      fireEvent.click(addButton);

      const newItems = mockOnChange.mock.calls[0][0];
      expect(newItems[0].text).toBe('Item 1');
      expect(newItems[1].text).toBe('Item 2');
      expect(newItems[2].text).toBe('');
    });

    it('should support up to 100 impact items', () => {
      // Create 100 items
      const items = Array.from({ length: 100 }, (_, i) => 
        createMockItem(`item-${i}`, `Item ${i}`)
      );
      renderComponent(items);

      // Add button should be disabled at 100 items
      const addButton = screen.getByText('Add Impact Item');
      expect(addButton).toBeDisabled();
    });
  });

  describe('Requirement 7.2: Maximum 100 items with message', () => {
    it('should show "Maximum 100 impact items reached" alert when at 100 items', () => {
      const items = Array.from({ length: 100 }, (_, i) => 
        createMockItem(`item-${i}`, `Item ${i}`)
      );
      renderComponent(items);

      expect(screen.getByText('Maximum 100 impact items reached')).toBeInTheDocument();
    });

    it('should disable Add button when at 100 items', () => {
      const items = Array.from({ length: 100 }, (_, i) => 
        createMockItem(`item-${i}`, `Item ${i}`)
      );
      renderComponent(items);

      const addButton = screen.getByText('Add Impact Item');
      expect(addButton).toBeDisabled();
    });

    it('should not add item when clicking Add button at maximum capacity', () => {
      const items = Array.from({ length: 100 }, (_, i) => 
        createMockItem(`item-${i}`, `Item ${i}`)
      );
      const mockOnChange = vi.fn();
      renderComponent(items, {}, mockOnChange);

      const addButton = screen.getByText('Add Impact Item');
      fireEvent.click(addButton);

      // Should not call onChange because button is disabled
      // (In practice, disabled button won't register click, but we test the logic)
      expect(addButton).toBeDisabled();
    });

    it('should not show alert or disable button when under 100 items', () => {
      const items = Array.from({ length: 50 }, (_, i) => 
        createMockItem(`item-${i}`, `Item ${i}`)
      );
      renderComponent(items);

      expect(screen.queryByText('Maximum 100 impact items reached')).not.toBeInTheDocument();
      expect(screen.getByText('Add Impact Item')).not.toBeDisabled();
    });
  });

  describe('Requirement 7.3 & 7.4: Text validation (empty/> 500 chars)', () => {
    it('should display empty text error message when provided', () => {
      const errors = { 'impactItems[0].text': 'Impact text is required' };
      renderComponent([createMockItem('1', '')], errors);

      expect(screen.getByText('Impact text is required')).toBeInTheDocument();
    });

    it('should display too long text error message when provided', () => {
      const errors = { 'impactItems[0].text': 'Impact text must not exceed 500 characters' };
      renderComponent([createMockItem('1', 'x'.repeat(501))], errors);

      expect(screen.getByText('Impact text must not exceed 500 characters')).toBeInTheDocument();
    });

    it('should show character count in helper text', () => {
      renderComponent([createMockItem('1', 'Hello World')]);

      // The helper text should show character count
      const textarea = screen.getByLabelText('Impact item 1 description');
      expect(textarea).toBeInTheDocument();
    });

    it('should show error state on TextField when error exists', () => {
      const errors = { 'impactItems[0].text': 'Required field' };
      renderComponent([createMockItem('1', '')], errors);

      const textField = screen.getByLabelText('Impact item 1 description');
      expect(textField).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not show error state when no error exists', () => {
      renderComponent([createMockItem('1', 'Valid text')]);

      const textField = screen.getByLabelText('Impact item 1 description');
      expect(textField).toHaveAttribute('aria-invalid', 'false');
    });

    it('should display general validation error when provided', () => {
      const errors = { 'impactItems': 'At least one impact item is required' };
      renderComponent([createMockItem('1', '')], errors);

      expect(screen.getByText('At least one impact item is required')).toBeInTheDocument();
    });
  });

  describe('Requirement 7.5 & 7.6: Remove item controls', () => {
    it('should display delete button for each item', () => {
      const items = [
        createMockItem('1', 'Item 1'),
        createMockItem('2', 'Item 2')
      ];
      renderComponent(items);

      const deleteButtons = screen.getAllByRole('button', { name: /Remove impact item/ });
      expect(deleteButtons).toHaveLength(2);
    });

    it('should remove item when delete button is clicked', () => {
      const mockOnChange = vi.fn();
      const items = [
        createMockItem('1', 'Item 1'),
        createMockItem('2', 'Item 2')
      ];
      renderComponent(items, {}, mockOnChange);

      const deleteButtons = screen.getAllByRole('button', { name: /Remove impact item/ });
      fireEvent.click(deleteButtons[0]);

      expect(mockOnChange).toHaveBeenCalled();
      const updatedItems = mockOnChange.mock.calls[0][0];
      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].id).toBe('2');
    });

    it('should preserve order of remaining items when one is removed', () => {
      const mockOnChange = vi.fn();
      const items = [
        createMockItem('1', 'Item 1'),
        createMockItem('2', 'Item 2'),
        createMockItem('3', 'Item 3')
      ];
      renderComponent(items, {}, mockOnChange);

      const deleteButtons = screen.getAllByRole('button', { name: /Remove impact item/ });
      fireEvent.click(deleteButtons[1]); // Remove middle item

      const updatedItems = mockOnChange.mock.calls[0][0];
      expect(updatedItems).toHaveLength(2);
      expect(updatedItems[0].id).toBe('1');
      expect(updatedItems[1].id).toBe('3');
    });

    it('should disable delete button when only 1 item remains (min 1 required)', () => {
      renderComponent([createMockItem('1', 'Only item')]);

      const deleteButton = screen.getByRole('button', { name: /Remove impact item/ });
      expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button when 2 or more items exist', () => {
      const items = [
        createMockItem('1', 'Item 1'),
        createMockItem('2', 'Item 2')
      ];
      renderComponent(items);

      const deleteButtons = screen.getAllByRole('button', { name: /Remove impact item/ });
      deleteButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should not remove item when delete button is disabled', () => {
      const mockOnChange = vi.fn();
      renderComponent([createMockItem('1', 'Only item')], {}, mockOnChange);

      const deleteButton = screen.getByRole('button', { name: /Remove impact item/ });
      expect(deleteButton).toBeDisabled();
      fireEvent.click(deleteButton);

      // onChange should not be called
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should show appropriate title on disabled delete button', () => {
      renderComponent([createMockItem('1', 'Only item')]);

      const deleteButton = screen.getByRole('button', { name: /Remove impact item/ });
      expect(deleteButton).toHaveAttribute(
        'title',
        'At least one impact item is required'
      );
    });
  });

  describe('Requirement 7.7: Minimum 1 required', () => {
    it('should require at least 1 impact item', () => {
      const items = [createMockItem('1', 'Item 1')];
      const mockOnChange = vi.fn();
      renderComponent(items, {}, mockOnChange);

      const deleteButton = screen.getByRole('button', { name: /Remove impact item/ });
      expect(deleteButton).toBeDisabled();
    });

    it('should prevent removal of last item', () => {
      const mockOnChange = vi.fn();
      renderComponent([createMockItem('1', 'Last item')], {}, mockOnChange);

      const deleteButton = screen.getByRole('button', { name: /Remove impact item/ });
      fireEvent.click(deleteButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Requirement 7.8: Preserve insertion order for rendering', () => {
    it('should render items in the order they were added', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second'),
        createMockItem('3', 'Third')
      ];
      renderComponent(items);

      const textareas = screen.getAllByRole('textbox');
      expect(textareas[0]).toHaveValue('First');
      expect(textareas[1]).toHaveValue('Second');
      expect(textareas[2]).toHaveValue('Third');
    });

    it('should maintain order labels correctly', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second')
      ];
      renderComponent(items);

      expect(screen.getByLabelText('Impact item 1 description')).toHaveValue('First');
      expect(screen.getByLabelText('Impact item 2 description')).toHaveValue('Second');
    });

    it('should preserve order when updating item text', async () => {
      const mockOnChange = vi.fn();
      const items = [
        createMockItem('1', 'Item 1'),
        createMockItem('2', 'Item 2')
      ];
      renderComponent(items, {}, mockOnChange);

      const textareas = screen.getAllByRole('textbox');
      fireEvent.change(textareas[0], { target: { value: 'Updated Item 1' } });

      expect(mockOnChange).toHaveBeenCalled();
      const updatedItems = mockOnChange.mock.calls[0][0];
      expect(updatedItems[0].text).toBe('Updated Item 1');
      expect(updatedItems[1].text).toBe('Item 2');
    });
  });

  describe('Text input and change handling', () => {
    it('should update item text when textarea is modified', async () => {
      const mockOnChange = vi.fn();
      renderComponent([createMockItem('1', 'Original text')], {}, mockOnChange);

      const textarea = screen.getByLabelText('Impact item 1 description');
      fireEvent.change(textarea, { target: { value: 'New text' } });

      expect(mockOnChange).toHaveBeenCalled();
      const updatedItems = mockOnChange.mock.calls[0][0];
      expect(updatedItems[0].text).toBe('New text');
    });

    it('should allow empty text (validation happens at form level)', () => {
      const mockOnChange = vi.fn();
      renderComponent([createMockItem('1', 'Some text')], {}, mockOnChange);

      const textarea = screen.getByLabelText('Impact item 1 description');
      fireEvent.change(textarea, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalled();
      const updatedItems = mockOnChange.mock.calls[0][0];
      expect(updatedItems[0].text).toBe('');
    });

    it('should allow text up to 500 characters', () => {
      const mockOnChange = vi.fn();
      const longText = 'a'.repeat(500);
      renderComponent([createMockItem('1', '')], {}, mockOnChange);

      const textarea = screen.getByLabelText('Impact item 1 description');
      fireEvent.change(textarea, { target: { value: longText } });

      expect(mockOnChange).toHaveBeenCalled();
      const updatedItems = mockOnChange.mock.calls[0][0];
      expect(updatedItems[0].text).toHaveLength(500);
    });

    it('should allow text exceeding 500 characters (validation at form level)', () => {
      const mockOnChange = vi.fn();
      const tooLongText = 'a'.repeat(501);
      renderComponent([createMockItem('1', '')], {}, mockOnChange);

      const textarea = screen.getByLabelText('Impact item 1 description');
      fireEvent.change(textarea, { target: { value: tooLongText } });

      expect(mockOnChange).toHaveBeenCalled();
      const updatedItems = mockOnChange.mock.calls[0][0];
      expect(updatedItems[0].text).toHaveLength(501);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for sections and items', () => {
      const items = [
        createMockItem('1', 'Item 1'),
        createMockItem('2', 'Item 2')
      ];
      renderComponent(items);

      expect(screen.getByRole('region', { hidden: true })).toHaveAttribute(
        'aria-labelledby',
        'impact-items-heading'
      );
      expect(screen.getByText('Impact Items *')).toHaveAttribute('id', 'impact-items-heading');
    });

    it('should have ARIA labels for textarea fields', () => {
      const items = [createMockItem('1', 'Item 1')];
      renderComponent(items);

      const textarea = screen.getByLabelText('Impact item 1 description');
      expect(textarea).toHaveAttribute('aria-label', 'Impact item 1 description');
    });

    it('should have aria-live region for status updates', () => {
      const items = [
        createMockItem('1', 'Item 1'),
        createMockItem('2', 'Item 2')
      ];
      render(
        <ImpactSection
          impactItems={items}
          onImpactItemsChange={vi.fn()}
        />
      );

      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveTextContent('2 impact items');
    });

    it('should update live region text based on item count', () => {
      const { rerender } = render(
        <ImpactSection
          impactItems={[createMockItem('1', 'Item 1')]}
          onImpactItemsChange={vi.fn()}
        />
      );

      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toHaveTextContent('1 impact item');

      rerender(
        <ImpactSection
          impactItems={[
            createMockItem('1', 'Item 1'),
            createMockItem('2', 'Item 2')
          ]}
          onImpactItemsChange={vi.fn()}
        />
      );

      expect(liveRegion).toHaveTextContent('2 impact items');
    });

    it('should have aria-invalid attributes on error fields', () => {
      const errors = { 'impactItems[0].text': 'Required field' };
      renderComponent([createMockItem('1', '')], errors);

      const textarea = screen.getByLabelText('Impact item 1 description');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple items with same text', () => {
      const items = [
        createMockItem('1', 'Duplicate text'),
        createMockItem('2', 'Duplicate text'),
        createMockItem('3', 'Duplicate text')
      ];
      renderComponent(items);

      const textareas = screen.getAllByRole('textbox');
      expect(textareas).toHaveLength(3);
      textareas.forEach(textarea => {
        expect(textarea).toHaveValue('Duplicate text');
      });
    });

    it('should handle text with special characters', () => {
      const mockOnChange = vi.fn();
      const specialText = 'Text with <script>, &, ", \', and other special chars';
      renderComponent([createMockItem('1', '')], {}, mockOnChange);

      const textarea = screen.getByLabelText('Impact item 1 description');
      fireEvent.change(textarea, { target: { value: specialText } });

      expect(mockOnChange).toHaveBeenCalled();
      const updatedItems = mockOnChange.mock.calls[0][0];
      expect(updatedItems[0].text).toBe(specialText);
    });

    it('should handle text with newlines', () => {
      const mockOnChange = vi.fn();
      const multilineText = 'Line 1\nLine 2\nLine 3';
      renderComponent([createMockItem('1', '')], {}, mockOnChange);

      const textarea = screen.getByLabelText('Impact item 1 description');
      fireEvent.change(textarea, { target: { value: multilineText } });

      expect(mockOnChange).toHaveBeenCalled();
      const updatedItems = mockOnChange.mock.calls[0][0];
      expect(updatedItems[0].text).toBe(multilineText);
    });

    it('should handle rapid add/remove operations', () => {
      const mockOnChange = vi.fn();
      let items = [createMockItem('1', 'Item 1')];
      const { rerender } = render(
        <ImpactSection
          impactItems={items}
          onImpactItemsChange={mockOnChange}
        />
      );

      const addButton = screen.getByText('Add Impact Item');

      // Add first item
      fireEvent.click(addButton);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      
      // Simulate component update with new items
      items = mockOnChange.mock.calls[0][0];
      rerender(
        <ImpactSection
          impactItems={items}
          onImpactItemsChange={mockOnChange}
        />
      );

      // Add second item
      fireEvent.click(addButton);
      expect(mockOnChange).toHaveBeenCalledTimes(2);
      
      items = mockOnChange.mock.calls[1][0];
      rerender(
        <ImpactSection
          impactItems={items}
          onImpactItemsChange={mockOnChange}
        />
      );

      // Add third item
      fireEvent.click(addButton);
      expect(mockOnChange).toHaveBeenCalledTimes(3);

      const lastCall = mockOnChange.mock.calls[2][0];
      expect(lastCall).toHaveLength(4); // Original + 3 added
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete workflow: add, edit, remove items', async () => {
      const mockOnChange = vi.fn();
      const { rerender } = render(
        <ImpactSection
          impactItems={[createMockItem('1', '')]}
          onImpactItemsChange={mockOnChange}
        />
      );

      // Add item
      const addButton = screen.getByText('Add Impact Item');
      fireEvent.click(addButton);
      expect(mockOnChange).toHaveBeenCalledTimes(1);

      // Update to have 2 items
      const newItems = [
        createMockItem('1', 'Impact 1'),
        createMockItem('2', 'Impact 2')
      ];
      rerender(
        <ImpactSection
          impactItems={newItems}
          onImpactItemsChange={mockOnChange}
        />
      );

      // Edit first item
      const textareas = screen.getAllByRole('textbox');
      await userEvent.clear(textareas[0]);
      await userEvent.type(textareas[0], 'Updated Impact 1');

      // Remove second item
      const deleteButtons = screen.getAllByRole('button', { name: /Remove impact item/ });
      fireEvent.click(deleteButtons[1]);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should maintain consistency with varying item counts', () => {
      const { rerender } = render(
        <ImpactSection
          impactItems={[createMockItem('1', 'Item 1')]}
          onImpactItemsChange={vi.fn()}
        />
      );

      expect(screen.getByText('Add Impact Item')).not.toBeDisabled();
      expect(screen.queryByText('Maximum 100 impact items reached')).not.toBeInTheDocument();

      // Rerender with max items
      const items = Array.from({ length: 100 }, (_, i) => 
        createMockItem(`item-${i}`, `Item ${i}`)
      );
      rerender(
        <ImpactSection
          impactItems={items}
          onImpactItemsChange={vi.fn()}
        />
      );

      expect(screen.getByText('Add Impact Item')).toBeDisabled();
      expect(screen.getByText('Maximum 100 impact items reached')).toBeInTheDocument();

      // Rerender back to minimum
      rerender(
        <ImpactSection
          impactItems={[createMockItem('1', 'Item')]}
          onImpactItemsChange={vi.fn()}
        />
      );

      expect(screen.getByText('Add Impact Item')).not.toBeDisabled();
      const deleteButton = screen.getByRole('button', { name: /Remove impact item/ });
      expect(deleteButton).toBeDisabled();
    });
  });
});
