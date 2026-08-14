/**
 * Unit tests for ImpactSection component
 * 
 * Tests cover:
 * - Initial rendering with one item
 * - Adding new items (up to maximum of 100)
 * - Removing items (minimum of 1 required)
 * - Text input and validation
 * - Character count display
 * - Error display
 * - Add button disabled at max capacity
 * - Remove button disabled at min capacity
 * - Maximum capacity warning message
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImpactSection } from './ImpactSection';
import type { ImpactItem } from '../types/models';

describe('ImpactSection', () => {
  // Helper function to create mock impact items
  const createMockItem = (id: string, text: string): ImpactItem => ({
    id,
    text
  });

  describe('Initial Rendering', () => {
    it('should render with heading', () => {
      const items = [createMockItem('1', '')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByText('Impact Items *')).toBeInTheDocument();
    });

    it('should render description text', () => {
      const items = [createMockItem('1', '')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByText(/List the deployment impacts/i)).toBeInTheDocument();
    });

    it('should render one impact item by default', () => {
      const items = [createMockItem('1', '')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByRole('textbox', { name: /impact item 1/i })).toBeInTheDocument();
    });

    it('should render Add Impact Item button', () => {
      const items = [createMockItem('1', '')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByRole('button', { name: /add impact item/i })).toBeInTheDocument();
    });
  });

  describe('Adding Impact Items (Requirements 7.1, 7.2)', () => {
    it('should call onChange with new item when Add button clicked', () => {
      const items = [createMockItem('1', 'First item')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const addButton = screen.getByRole('button', { name: /add impact item/i });
      fireEvent.click(addButton);
      
      expect(onChange).toHaveBeenCalledTimes(1);
      const newItems = onChange.mock.calls[0][0] as ImpactItem[];
      expect(newItems).toHaveLength(2);
      expect(newItems[0]).toEqual(items[0]);
      expect(newItems[1].text).toBe('');
      expect(newItems[1].id).toBeTruthy();
    });

    it('should preserve insertion order when adding items (Requirement 7.8)', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second')
      ];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const addButton = screen.getByRole('button', { name: /add impact item/i });
      fireEvent.click(addButton);
      
      const newItems = onChange.mock.calls[0][0] as ImpactItem[];
      expect(newItems[0].text).toBe('First');
      expect(newItems[1].text).toBe('Second');
      expect(newItems[2].text).toBe('');
    });

    it('should disable Add button at 100 items (Requirement 7.2)', () => {
      const items = Array.from({ length: 100 }, (_, i) => 
        createMockItem(`${i}`, `Item ${i}`)
      );
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const addButton = screen.getByRole('button', { name: /add impact item/i });
      expect(addButton).toBeDisabled();
    });

    it('should show maximum capacity message at 100 items (Requirement 7.2)', () => {
      const items = Array.from({ length: 100 }, (_, i) => 
        createMockItem(`${i}`, `Item ${i}`)
      );
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByText('Maximum 100 impact items reached')).toBeInTheDocument();
    });

    it('should not show maximum capacity message below 100 items', () => {
      const items = Array.from({ length: 99 }, (_, i) => 
        createMockItem(`${i}`, `Item ${i}`)
      );
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.queryByText('Maximum 100 impact items reached')).not.toBeInTheDocument();
    });

    it('should not call onChange when Add clicked at max capacity', () => {
      const items = Array.from({ length: 100 }, (_, i) => 
        createMockItem(`${i}`, `Item ${i}`)
      );
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const addButton = screen.getByRole('button', { name: /add impact item/i });
      fireEvent.click(addButton);
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Removing Impact Items (Requirements 7.5, 7.6)', () => {
    it('should render remove button for each item', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second')
      ];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const removeButtons = screen.getAllByRole('button', { name: /remove impact item/i });
      expect(removeButtons).toHaveLength(2);
    });

    it('should call onChange with item removed when Remove button clicked', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second')
      ];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const removeButtons = screen.getAllByRole('button', { name: /remove impact item/i });
      fireEvent.click(removeButtons[0]!);
      
      expect(onChange).toHaveBeenCalledTimes(1);
      const newItems = onChange.mock.calls[0][0] as ImpactItem[];
      expect(newItems).toHaveLength(1);
      expect(newItems[0]).toEqual(items[1]);
    });

    it('should preserve order of remaining items when removing (Requirement 7.8)', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second'),
        createMockItem('3', 'Third')
      ];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      // Remove the middle item
      const removeButtons = screen.getAllByRole('button', { name: /remove impact item/i });
      fireEvent.click(removeButtons[1]!);
      
      const newItems = onChange.mock.calls[0][0] as ImpactItem[];
      expect(newItems).toHaveLength(2);
      expect(newItems[0].text).toBe('First');
      expect(newItems[1].text).toBe('Third');
    });

    it('should disable Remove button when only 1 item remains (Requirement 7.6)', () => {
      const items = [createMockItem('1', 'Only item')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const removeButton = screen.getByRole('button', { name: /remove impact item 1/i });
      expect(removeButton).toBeDisabled();
    });

    it('should not call onChange when Remove clicked with only 1 item', () => {
      const items = [createMockItem('1', 'Only item')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const removeButton = screen.getByRole('button', { name: /remove impact item 1/i });
      fireEvent.click(removeButton);
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should enable Remove button when more than 1 item exists', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second')
      ];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const removeButtons = screen.getAllByRole('button', { name: /remove impact item/i });
      expect(removeButtons[0]).not.toBeDisabled();
      expect(removeButtons[1]).not.toBeDisabled();
    });
  });

  describe('Text Input (Requirements 7.3, 7.4)', () => {
    it('should display current text value for each item', () => {
      const items = [
        createMockItem('1', 'First item text'),
        createMockItem('2', 'Second item text')
      ];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByDisplayValue('First item text')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Second item text')).toBeInTheDocument();
    });

    it('should call onChange when text is edited', () => {
      const items = [createMockItem('1', 'Original text')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const textarea = screen.getByRole('textbox', { name: /impact item 1/i });
      fireEvent.change(textarea, { target: { value: 'Updated text' } });
      
      expect(onChange).toHaveBeenCalledTimes(1);
      const newItems = onChange.mock.calls[0][0] as ImpactItem[];
      expect(newItems[0]?.text).toBe('Updated text');
    });

    it('should show character count for each item (Requirement 7.4)', () => {
      const items = [createMockItem('1', 'Test')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByText(/4\/500 characters/i)).toBeInTheDocument();
    });

    it('should update character count as text changes', () => {
      const items = [createMockItem('1', '')];
      const onChange = vi.fn();
      
      const { rerender } = render(
        <ImpactSection impactItems={items} onImpactItemsChange={onChange} />
      );
      
      expect(screen.getByText(/0\/500 characters/i)).toBeInTheDocument();
      
      const updatedItems = [createMockItem('1', 'Hello World')];
      rerender(
        <ImpactSection impactItems={updatedItems} onImpactItemsChange={onChange} />
      );
      
      expect(screen.getByText(/11\/500 characters/i)).toBeInTheDocument();
    });

    it('should show warning when text exceeds 500 characters (Requirement 7.4)', () => {
      const longText = 'a'.repeat(501);
      const items = [createMockItem('1', longText)];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByText(/501\/500 characters - exceeds maximum length/i)).toBeInTheDocument();
    });
  });

  describe('Validation Errors (Requirements 7.3, 7.4, 7.7)', () => {
    it('should display field-specific error when provided', () => {
      const items = [createMockItem('1', '')];
      const onChange = vi.fn();
      const errors = {
        'impactItems[0].text': 'Impact Item 1: Text is required'
      };
      
      render(
        <ImpactSection 
          impactItems={items} 
          onImpactItemsChange={onChange}
          errors={errors}
        />
      );
      
      expect(screen.getByText('Impact Item 1: Text is required')).toBeInTheDocument();
    });

    it('should display length validation error when provided', () => {
      const longText = 'a'.repeat(501);
      const items = [createMockItem('1', longText)];
      const onChange = vi.fn();
      const errors = {
        'impactItems[0].text': 'Impact Item 1: Text must not exceed 500 characters'
      };
      
      render(
        <ImpactSection 
          impactItems={items} 
          onImpactItemsChange={onChange}
          errors={errors}
        />
      );
      
      expect(screen.getByText('Impact Item 1: Text must not exceed 500 characters')).toBeInTheDocument();
    });

    it('should display multiple errors for different items', () => {
      const items = [
        createMockItem('1', ''),
        createMockItem('2', 'a'.repeat(501))
      ];
      const onChange = vi.fn();
      const errors = {
        'impactItems[0].text': 'Impact Item 1: Text is required',
        'impactItems[1].text': 'Impact Item 2: Text must not exceed 500 characters'
      };
      
      render(
        <ImpactSection 
          impactItems={items} 
          onImpactItemsChange={onChange}
          errors={errors}
        />
      );
      
      expect(screen.getByText('Impact Item 1: Text is required')).toBeInTheDocument();
      expect(screen.getByText('Impact Item 2: Text must not exceed 500 characters')).toBeInTheDocument();
    });

    it('should display general impactItems error when provided (Requirement 7.7)', () => {
      const items = [createMockItem('1', 'Test')];
      const onChange = vi.fn();
      const errors = {
        'impactItems': 'At least one Impact Item is required'
      };
      
      render(
        <ImpactSection 
          impactItems={items} 
          onImpactItemsChange={onChange}
          errors={errors}
        />
      );
      
      expect(screen.getByText('At least one Impact Item is required')).toBeInTheDocument();
    });

    it('should mark textarea as error when validation fails', () => {
      const items = [createMockItem('1', '')];
      const onChange = vi.fn();
      const errors = {
        'impactItems[0].text': 'Impact Item 1: Text is required'
      };
      
      render(
        <ImpactSection 
          impactItems={items} 
          onImpactItemsChange={onChange}
          errors={errors}
        />
      );
      
      const textarea = screen.getByRole('textbox', { name: /impact item 1/i });
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Multiple Items Display', () => {
    it('should render all items in order (Requirement 7.8)', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second'),
        createMockItem('3', 'Third')
      ];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByRole('textbox', { name: /impact item 1/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /impact item 2/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /impact item 3/i })).toBeInTheDocument();
    });

    it('should maintain correct indexing after removal', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second')
      ];
      const onChange = vi.fn();
      
      const { rerender } = render(
        <ImpactSection impactItems={items} onImpactItemsChange={onChange} />
      );
      
      // After removing first item, second becomes first
      const updatedItems = [createMockItem('2', 'Second')];
      rerender(
        <ImpactSection impactItems={updatedItems} onImpactItemsChange={onChange} />
      );
      
      expect(screen.getByRole('textbox', { name: /impact item 1/i })).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /impact item 2/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have required attribute on textareas', () => {
      const items = [createMockItem('1', '')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const textarea = screen.getByRole('textbox', { name: /impact item 1/i });
      expect(textarea).toBeRequired();
    });

    it('should have aria-label on remove buttons', () => {
      const items = [
        createMockItem('1', 'First'),
        createMockItem('2', 'Second')
      ];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      expect(screen.getByRole('button', { name: 'Remove impact item 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove impact item 2' })).toBeInTheDocument();
    });

    it('should have title attribute on disabled remove button', () => {
      const items = [createMockItem('1', 'Only item')];
      const onChange = vi.fn();
      
      render(<ImpactSection impactItems={items} onImpactItemsChange={onChange} />);
      
      const removeButton = screen.getByRole('button', { name: /remove impact item 1/i });
      expect(removeButton).toHaveAttribute('title', 'At least one impact item is required');
    });
  });
});
