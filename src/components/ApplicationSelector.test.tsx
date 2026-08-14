/**
 * ApplicationSelector Component Tests
 * 
 * Tests for ApplicationSelector component covering all acceptance criteria:
 * - 2.1: Present all applications from APPLICATION_CATALOG
 * - 2.2: Display placeholder prompt when no application selected
 * - 2.7: Display banner "No applications available" when catalog empty
 * - 2.8: Disable dropdown when catalog empty
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationSelector } from './ApplicationSelector';
import { Application } from '../types/models';

const MOCK_CATALOG: Application[] = [
  {
    id: 'app-1',
    name: 'Test App 1',
    notificationHeader: 'Test App 1 Deployment Notification'
  },
  {
    id: 'app-2',
    name: 'Test App 2',
    notificationHeader: 'Test App 2 Deployment Notification'
  },
  {
    id: 'app-3',
    name: 'Test App 3',
    notificationHeader: 'Test App 3 Deployment Notification'
  }
];

describe('ApplicationSelector', () => {
  describe('Requirement 2.1: Present all applications as selectable options', () => {
    it('should display all applications from the catalog', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
          catalog={MOCK_CATALOG}
        />
      );

      // Open the dropdown
      const select = screen.getByLabelText(/Application/);
      await user.click(select);

      // Verify all applications are present
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.getByText('Test App 2')).toBeInTheDocument();
      expect(screen.getByText('Test App 3')).toBeInTheDocument();
    });

    it('should call onChange with selected application when clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
          catalog={MOCK_CATALOG}
        />
      );

      // Open dropdown and select an option
      const select = screen.getByLabelText(/Application/);
      await user.click(select);
      await user.click(screen.getByText('Test App 2'));

      // Verify onChange was called with the correct application
      expect(onChange).toHaveBeenCalledWith(MOCK_CATALOG[1]);
    });
  });

  describe('Requirement 2.2: Display placeholder when no application selected', () => {
    it('should show label as placeholder when no selection', () => {
      const onChange = vi.fn();

      const { container } = render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
          catalog={MOCK_CATALOG}
        />
      );

      // The label serves as the placeholder
      expect(screen.getByLabelText(/Application/)).toBeInTheDocument();
      
      // The select input should be empty (no value set)
      const input = container.querySelector('#application-selector') as HTMLElement;
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('should display selected application name when value is set', () => {
      const onChange = vi.fn();

      render(
        <ApplicationSelector
          value={MOCK_CATALOG[0]}
          onChange={onChange}
          catalog={MOCK_CATALOG}
        />
      );

      // The selected value should be visible
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
    });
  });

  describe('Requirement 2.7: Display banner when catalog empty', () => {
    it('should display "No applications available" message when catalog is empty', () => {
      const onChange = vi.fn();

      render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
          catalog={[]}
        />
      );

      expect(screen.getByText('No applications available')).toBeInTheDocument();
    });

    it('should not display banner when catalog has applications', () => {
      const onChange = vi.fn();

      render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
          catalog={MOCK_CATALOG}
        />
      );

      expect(screen.queryByText('No applications available')).not.toBeInTheDocument();
    });
  });

  describe('Requirement 2.8: Disable dropdown when catalog empty', () => {
    it('should disable dropdown when catalog is empty', () => {
      const onChange = vi.fn();

      render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
          catalog={[]}
        />
      );

      const select = screen.getByRole('combobox');
      // MUI uses aria-disabled for disabled state
      expect(select).toHaveAttribute('aria-disabled', 'true');
    });

    it('should enable dropdown when catalog has applications', () => {
      const onChange = vi.fn();

      render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
          catalog={MOCK_CATALOG}
        />
      );

      const select = screen.getByRole('combobox');
      // When enabled, aria-disabled is either false or not present
      expect(select).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should respect disabled prop even when catalog is not empty', () => {
      const onChange = vi.fn();

      render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
          catalog={MOCK_CATALOG}
          disabled={true}
        />
      );

      const select = screen.getByRole('combobox');
      // MUI uses aria-disabled for disabled state
      expect(select).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Error handling', () => {
    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      const errorMessage = 'Application selection is required';

      render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
          catalog={MOCK_CATALOG}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Integration with APPLICATION_CATALOG', () => {
    it('should use APPLICATION_CATALOG by default when no catalog prop provided', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <ApplicationSelector
          value={null}
          onChange={onChange}
        />
      );

      // Open dropdown
      const select = screen.getByLabelText(/Application/);
      await user.click(select);

      // Should show applications from APPLICATION_CATALOG
      expect(screen.getByText('AO Crew Training')).toBeInTheDocument();
      expect(screen.getByText('Crew Portal')).toBeInTheDocument();
      expect(screen.getByText('Crew Mobile')).toBeInTheDocument();
      expect(screen.getByText('Learning Management')).toBeInTheDocument();
      expect(screen.getByText('Administration Portal')).toBeInTheDocument();
    });
  });
});
