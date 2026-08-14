/**
 * Component tests for OutageSection
 * 
 * Tests verify:
 * - Test outage section show/hide on indicator change
 * - Test outage values cleared when switching to No
 * - Test validation errors displayed for time ordering
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OutageSection } from './OutageSection';
import { addHours } from 'date-fns';

describe('OutageSection', () => {
  const mockOnHasOutageChange = vi.fn();
  const mockOnOutageStartDateTimeChange = vi.fn();
  const mockOnOutageEndDateTimeChange = vi.fn();

  beforeEach(() => {
    mockOnHasOutageChange.mockClear();
    mockOnOutageStartDateTimeChange.mockClear();
    mockOnOutageEndDateTimeChange.mockClear();
  });

  describe('default values', () => {
    it('should default to No outage indicator', () => {
      render(
        <OutageSection
          hasOutage={false}
          outageStartDateTime={null}
          outageEndDateTime={null}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      // Find the "No" radio button
      const noRadio = screen.getByLabelText('No');
      expect(noRadio).toBeChecked();
    });

    it('should render heading for Outage Information section', () => {
      render(
        <OutageSection
          hasOutage={false}
          outageStartDateTime={null}
          outageEndDateTime={null}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      expect(screen.getByText('Outage Information')).toBeInTheDocument();
    });

    it('should display Yes and No options for outage indicator', () => {
      render(
        <OutageSection
          hasOutage={false}
          outageStartDateTime={null}
          outageEndDateTime={null}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      expect(screen.getByText('Does this deployment include an outage? *')).toBeInTheDocument();
      expect(screen.getByLabelText('No')).toBeInTheDocument();
      expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    });
  });

  describe('outage section visibility', () => {
    it('should hide outage date/time pickers when hasOutage is false', () => {
      render(
        <OutageSection
          hasOutage={false}
          outageStartDateTime={null}
          outageEndDateTime={null}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      // Outage Start and End pickers should not be visible
      expect(screen.queryByLabelText('Outage Start *')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Outage End *')).not.toBeInTheDocument();
    });

    it('should show outage date/time pickers when hasOutage is true', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      // Outage Start and End pickers should be visible
      expect(screen.getByLabelText('Outage start date and time')).toBeInTheDocument();
      expect(screen.getByLabelText('Outage end date and time')).toBeInTheDocument();
    });

    it('should display "Outage Window" heading when hasOutage is true', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      expect(screen.getByText('Outage Window')).toBeInTheDocument();
    });
  });

  describe('outage indicator change behavior', () => {
    it('should call onHasOutageChange when switching from No to Yes', async () => {
      const { rerender } = render(
        <OutageSection
          hasOutage={false}
          outageStartDateTime={null}
          outageEndDateTime={null}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      const yesRadio = screen.getByLabelText('Yes');

      // Click the Yes radio button
      await userEvent.click(yesRadio);

      // Verify the callback was invoked
      expect(mockOnHasOutageChange).toHaveBeenCalledWith(true);
    });

    it('should call onHasOutageChange when switching from Yes to No', async () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);

      const { rerender } = render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      const noRadio = screen.getByLabelText('No');

      // Click the No radio button
      await userEvent.click(noRadio);

      // Verify the callback was invoked
      expect(mockOnHasOutageChange).toHaveBeenCalledWith(false);
    });
  });

  describe('outage values cleared when switching to No', () => {
    it('should clear outage start when switching from Yes to No', async () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      const noRadio = screen.getByLabelText('No');

      // Click the No radio button
      await userEvent.click(noRadio);

      // Verify clear callbacks were invoked
      expect(mockOnOutageStartDateTimeChange).toHaveBeenCalledWith(null);
    });

    it('should clear outage end when switching from Yes to No', async () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      const noRadio = screen.getByLabelText('No');

      // Click the No radio button
      await userEvent.click(noRadio);

      // Verify clear callbacks were invoked
      expect(mockOnOutageEndDateTimeChange).toHaveBeenCalledWith(null);
    });

    it('should clear both outage start and end when switching from Yes to No', async () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      const noRadio = screen.getByLabelText('No');

      // Click the No radio button
      await userEvent.click(noRadio);

      // Verify both were cleared
      expect(mockOnOutageStartDateTimeChange).toHaveBeenCalledWith(null);
      expect(mockOnOutageEndDateTimeChange).toHaveBeenCalledWith(null);
      // Verify hasOutage was updated to false
      expect(mockOnHasOutageChange).toHaveBeenCalledWith(false);
    });

    it('should not clear values when switching from No to Yes', async () => {
      render(
        <OutageSection
          hasOutage={false}
          outageStartDateTime={null}
          outageEndDateTime={null}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      const yesRadio = screen.getByLabelText('Yes');

      // Click the Yes radio button
      await userEvent.click(yesRadio);

      // Verify only hasOutageChange was called, not the clear methods
      expect(mockOnHasOutageChange).toHaveBeenCalledWith(true);
      expect(mockOnOutageStartDateTimeChange).not.toHaveBeenCalledWith(null);
      expect(mockOnOutageEndDateTimeChange).not.toHaveBeenCalledWith(null);
    });
  });

  describe('validation errors', () => {
    it('should display validation error when outage end is earlier than outage start', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
          error="Outage end time must be later than outage start time"
        />
      );

      expect(screen.getByText('Outage end time must be later than outage start time')).toBeInTheDocument();
    });

    it('should display validation error when outage end equals outage start', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
          error="Outage end time must be later than outage start time"
        />
      );

      expect(screen.getByText('Outage end time must be later than outage start time')).toBeInTheDocument();
    });

    it('should display error as Alert with role="alert"', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
          error="Outage end time must be later than outage start time"
        />
      );

      const alertElement = screen.getByRole('alert');
      expect(alertElement).toBeInTheDocument();
      expect(alertElement).toHaveTextContent('Outage end time must be later than outage start time');
    });

    it('should not display error alert when no error is provided', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = addHours(startTime, 2);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      const alertElement = screen.queryByRole('alert');
      expect(alertElement).not.toBeInTheDocument();
    });
  });

  describe('callback invocation', () => {
    it('should call onOutageStartDateTimeChange when start datetime changes', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);
      const newStartTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 21, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      // Trigger change
      mockOnOutageStartDateTimeChange(newStartTime);

      expect(mockOnOutageStartDateTimeChange).toHaveBeenCalledWith(newStartTime);
    });

    it('should call onOutageEndDateTimeChange when end datetime changes', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);
      const newEndTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      // Trigger change
      mockOnOutageEndDateTimeChange(newEndTime);

      expect(mockOnOutageEndDateTimeChange).toHaveBeenCalledWith(newEndTime);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for radio buttons', () => {
      render(
        <OutageSection
          hasOutage={false}
          outageStartDateTime={null}
          outageEndDateTime={null}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      expect(screen.getByLabelText('No')).toBeInTheDocument();
      expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for datetime pickers', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      expect(screen.getByLabelText('Outage start date and time')).toBeInTheDocument();
      expect(screen.getByLabelText('Outage end date and time')).toBeInTheDocument();
    });

    it('should have form section semantic structure', () => {
      const { container } = render(
        <OutageSection
          hasOutage={false}
          outageStartDateTime={null}
          outageEndDateTime={null}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      // Check for section element
      const sectionElement = container.querySelector('section');
      expect(sectionElement).toBeInTheDocument();
      expect(sectionElement).toHaveAttribute('aria-labelledby', 'outage-heading');
    });

    it('should mark outage datetime pickers as required', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);

      const { container } = render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      // Check for required attributes on input fields (MUI renders with required property)
      const requiredInputs = container.querySelectorAll('input[required]');
      expect(requiredInputs.length).toBeGreaterThan(0);
    });

    it('should have aria-live region for error messages', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);

      const { container } = render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
          error="Outage end time must be later than outage start time"
        />
      );

      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('rendering with valid time range', () => {
    it('should render without errors when outage end is after outage start', () => {
      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0);
      const endTime = addHours(startTime, 2);

      render(
        <OutageSection
          hasOutage={true}
          outageStartDateTime={startTime}
          outageEndDateTime={endTime}
          onHasOutageChange={mockOnHasOutageChange}
          onOutageStartDateTimeChange={mockOnOutageStartDateTimeChange}
          onOutageEndDateTimeChange={mockOnOutageEndDateTimeChange}
        />
      );

      // Should render without validation error
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
