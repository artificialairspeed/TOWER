/**
 * Tests for FormManager Component
 *
 * The queue renders each deployment as a collapsible row. The newest form is
 * auto-expanded; other rows can be expanded on demand. FormManager can run with
 * its own internal state (standalone) or with lifted state passed via props.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.8
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormManager } from './FormManager';

describe('FormManager', () => {
  describe('Initial State - Requirement 1.1', () => {
    it('should render the queue heading and a form count of 1 of 5', () => {
      render(<FormManager />);

      expect(screen.getByRole('heading', { name: /Deployment Forms/i })).toBeInTheDocument();
      expect(screen.getByText(/1 of 5/)).toBeInTheDocument();
    });

    it('should render the initial form collapsed on load', () => {
      render(<FormManager />);

      // On initial load / refresh every row starts collapsed, so the row
      // exposes an "Expand" control rather than a "Collapse" one.
      expect(
        screen.getByRole('button', { name: /Expand deployment details/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Collapse deployment details/i })
      ).not.toBeInTheDocument();
    });

    it('should render exactly one queue row initially', () => {
      render(<FormManager />);

      // Each row exposes an expand/collapse toggle
      const toggles = screen.getAllByRole('button', { name: /deployment details/i });
      expect(toggles).toHaveLength(1);
    });
  });

  describe('Add Form - Requirements 1.2, 1.3, 1.4', () => {
    it('should add a new form when Add Form is clicked', async () => {
      const user = userEvent.setup();
      render(<FormManager />);

      expect(screen.getByText(/1 of 5/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /add new deployment form/i }));

      expect(screen.getByText(/2 of 5/)).toBeInTheDocument();
      const toggles = screen.getAllByRole('button', { name: /deployment details/i });
      expect(toggles).toHaveLength(2);
    });

    it('should auto-expand the newest form after adding', async () => {
      const user = userEvent.setup();
      render(<FormManager />);

      await user.click(screen.getByRole('button', { name: /add new deployment form/i }));

      // Newest form (form 2) should be expanded
      expect(screen.getByRole('heading', { name: /Deployment Form 2/i })).toBeInTheDocument();
    });

    it('should disable Add Form when 5 forms exist - Requirement 1.4', async () => {
      const user = userEvent.setup();
      render(<FormManager />);

      const addButton = screen.getByRole('button', { name: /add new deployment form/i });
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);

      expect(screen.getByText(/5 of 5/)).toBeInTheDocument();
      const maxedButton = screen.getByRole('button', { name: /Maximum of 5 forms reached/i });
      expect(maxedButton).toBeDisabled();
    });

    it('should update the form count as forms are added', async () => {
      const user = userEvent.setup();
      render(<FormManager />);

      expect(screen.getByText(/1 of 5/)).toBeInTheDocument();

      const addButton = screen.getByRole('button', { name: /add new deployment form/i });
      await user.click(addButton);
      expect(screen.getByText(/2 of 5/)).toBeInTheDocument();

      await user.click(addButton);
      expect(screen.getByText(/3 of 5/)).toBeInTheDocument();
    });
  });

  describe('Remove Form - Requirements 1.6, 1.8', () => {
    it('should disable row remove when only one form exists - Requirement 1.8', () => {
      render(<FormManager />);

      const removeButton = screen.getByRole('button', {
        name: /Cannot remove the only deployment/i,
      });
      expect(removeButton).toBeDisabled();
    });

    it('should enable row remove when more than one form exists - Requirement 1.6', async () => {
      const user = userEvent.setup();
      render(<FormManager />);

      await user.click(screen.getByRole('button', { name: /add new deployment form/i }));

      const removeButtons = screen.getAllByRole('button', { name: /^Remove deployment$/i });
      expect(removeButtons.length).toBeGreaterThanOrEqual(2);
      removeButtons.forEach((button) => expect(button).toBeEnabled());
    });

    it('should remove a form and re-enable Add after reaching max', async () => {
      const user = userEvent.setup();
      render(<FormManager />);

      const addButton = screen.getByRole('button', { name: /add new deployment form/i });
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);

      expect(screen.getByText(/5 of 5/)).toBeInTheDocument();

      const removeButtons = screen.getAllByRole('button', { name: /^Remove deployment$/i });
      await user.click(removeButtons[removeButtons.length - 1]);

      expect(screen.getByText(/4 of 5/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add new deployment form/i })).toBeEnabled();
    });
  });

  describe('Collapsible rows', () => {
    it('should expose an expand/collapse toggle on each row', async () => {
      const user = userEvent.setup();
      render(<FormManager />);

      await user.click(screen.getByRole('button', { name: /add new deployment form/i }));

      const toggles = screen.getAllByRole('button', { name: /deployment details/i });
      expect(toggles).toHaveLength(2);
    });

    it('should collapse an expanded row when its toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<FormManager />);

      // Initial form is collapsed; expand it first
      const expandToggle = screen.getByRole('button', {
        name: /Expand deployment details/i,
      });
      await user.click(expandToggle);

      // Now its collapse control is available
      const collapseToggle = screen.getByRole('button', {
        name: /Collapse deployment details/i,
      });
      expect(collapseToggle).toBeInTheDocument();

      await user.click(collapseToggle);

      // After collapsing, an expand control should be present instead
      expect(
        screen.getByRole('button', { name: /Expand deployment details/i })
      ).toBeInTheDocument();
    });
  });
});
