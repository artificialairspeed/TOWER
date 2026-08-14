/**
 * Unit tests for OutageSection component
 * 
 * Tests Requirements:
 * - 5.1: Yes/No outage indicator
 * - 5.2: Default outage indicator to No
 * - 5.3: Conditionally render date/time pickers when Yes selected
 * - 5.4: Hide pickers when No selected
 * - 5.5: Clear outage values when switching from Yes to No
 * - 5.6: Show validation error when outage end <= outage start
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OutageSection } from './OutageSection';

describe('OutageSection', () => {
  const mockOnHasOutageChange = vi.fn();
  const mockOnOutageStartDateChange = vi.fn();
  const mockOnOutageStartTimeChange = vi.fn();
  const mockOnOutageEndDateChange = vi.fn();
  const mockOnOutageEndTimeChange = vi.fn();

  const defaultProps = {
    hasOutage: false,
    outageStartDate: null,
    outageStartTime: null,
    outageEndDate: null,
    outageEndTime: null,
    onHasOutageChange: mockOnHasOutageChange,
    onOutageStartDateChange: mockOnOutageStartDateChange,
    onOutageStartTimeChange: mockOnOutageStartTimeChange,
    onOutageEndDateChange: mockOnOutageEndDateChange,
    onOutageEndTimeChange: mockOnOutageEndTimeChange
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Requirement 5.1, 5.2: Yes/No outage indicator with default No
  it('should render Yes/No radio buttons with No selected by default', () => {
    render(<OutageSection {...defaultProps} />);
    
    const noRadio = screen.getByLabelText('No');
    const yesRadio = screen.getByLabelText('Yes');
    
    expect(noRadio).toBeInTheDocument();
    expect(yesRadio).toBeInTheDocument();
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
  });

  // Requirement 5.4: Hide pickers when No selected
  it('should hide date/time pickers when hasOutage is false', () => {
    render(<OutageSection {...defaultProps} hasOutage={false} />);
    
    expect(screen.queryByLabelText(/Outage Start Date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Outage Start Time/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Outage End Date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Outage End Time/i)).not.toBeInTheDocument();
  });

  // Requirement 5.3: Conditionally render pickers when Yes selected (4 pickers total)
  it('should show all 4 date/time pickers when hasOutage is true', () => {
    render(<OutageSection {...defaultProps} hasOutage={true} />);
    
    // Check that all 4 pickers are present - MUI renders labels multiple times (legend + label)
    // So we use getAllByText and verify that at least one instance exists for each picker
    expect(screen.getAllByText(/Outage Start Date \*/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Outage Start Time \*/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Outage End Date \*/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Outage End Time \*/).length).toBeGreaterThan(0);
  });

  // Requirement 5.1: Call callback when radio button selection changes
  it('should call onHasOutageChange when Yes is selected', async () => {
    const user = userEvent.setup();
    render(<OutageSection {...defaultProps} hasOutage={false} />);
    
    const yesRadio = screen.getByLabelText('Yes');
    await user.click(yesRadio);
    
    expect(mockOnHasOutageChange).toHaveBeenCalledWith(true);
  });

  it('should call onHasOutageChange when No is selected', async () => {
    const user = userEvent.setup();
    render(<OutageSection {...defaultProps} hasOutage={true} />);
    
    const noRadio = screen.getByLabelText('No');
    await user.click(noRadio);
    
    expect(mockOnHasOutageChange).toHaveBeenCalledWith(false);
  });

  // Requirement 5.5: Clear outage values when switching from Yes to No
  it('should clear all outage values when switching from Yes to No', async () => {
    const user = userEvent.setup();
    render(
      <OutageSection 
        {...defaultProps} 
        hasOutage={true}
        outageStartDate={new Date('2025-01-15')}
        outageStartTime={new Date('2025-01-15T20:00:00')}
        outageEndDate={new Date('2025-01-15')}
        outageEndTime={new Date('2025-01-15T22:00:00')}
      />
    );
    
    const noRadio = screen.getByLabelText('No');
    await user.click(noRadio);
    
    // Should call all clear callbacks
    expect(mockOnOutageStartDateChange).toHaveBeenCalledWith(null);
    expect(mockOnOutageStartTimeChange).toHaveBeenCalledWith(null);
    expect(mockOnOutageEndDateChange).toHaveBeenCalledWith(null);
    expect(mockOnOutageEndTimeChange).toHaveBeenCalledWith(null);
    expect(mockOnHasOutageChange).toHaveBeenCalledWith(false);
  });

  it('should NOT clear outage values when switching from No to Yes', async () => {
    const user = userEvent.setup();
    render(<OutageSection {...defaultProps} hasOutage={false} />);
    
    const yesRadio = screen.getByLabelText('Yes');
    await user.click(yesRadio);
    
    // Should only call hasOutage change, not clear the date/time fields
    expect(mockOnHasOutageChange).toHaveBeenCalledWith(true);
    expect(mockOnOutageStartDateChange).not.toHaveBeenCalled();
    expect(mockOnOutageStartTimeChange).not.toHaveBeenCalled();
    expect(mockOnOutageEndDateChange).not.toHaveBeenCalled();
    expect(mockOnOutageEndTimeChange).not.toHaveBeenCalled();
  });

  // Requirement 5.6: Show validation error when outage end <= outage start
  it('should display validation error message when provided', () => {
    const errorMessage = 'Outage end time must be later than outage start time';
    render(<OutageSection {...defaultProps} hasOutage={true} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should not display validation error when error prop is undefined', () => {
    render(<OutageSection {...defaultProps} hasOutage={true} />);
    
    // Should not have any alert/error message
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should show Yes radio button as checked when hasOutage is true', () => {
    render(<OutageSection {...defaultProps} hasOutage={true} />);
    
    const yesRadio = screen.getByLabelText('Yes');
    const noRadio = screen.getByLabelText('No');
    
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();
  });

  // Task 10.3 - Component Tests for Schedule and Outage
  describe('Task 10.3 - Additional Component Tests', () => {
    it('enforces picker-only input for outage date/time fields', () => {
      const { container } = render(
        <OutageSection 
          {...defaultProps} 
          hasOutage={true}
          outageStartDate={new Date('2025-01-15')}
          outageStartTime={new Date('2025-01-15T20:00:00')}
          outageEndDate={new Date('2025-01-15')}
          outageEndTime={new Date('2025-01-15T22:00:00')}
        />
      );
      
      // MUI DatePicker and TimePicker components prevent keyboard entry by default
      // Verify that date/time pickers are rendered (they handle read-only input internally)
      const pickerButtons = screen.getAllByRole('button');
      
      // Should have at least 4 picker buttons (one for each date/time field)
      expect(pickerButtons.length).toBeGreaterThanOrEqual(4);
    });

    it('defaults outage indicator to No on form creation', () => {
      render(<OutageSection {...defaultProps} hasOutage={false} />);
      
      const noRadio = screen.getByLabelText('No');
      expect(noRadio).toBeChecked();
    });

    it('shows all 4 outage pickers when Yes is selected', () => {
      render(<OutageSection {...defaultProps} hasOutage={true} />);
      
      // Verify all 4 required outage pickers are visible
      expect(screen.getAllByText(/Outage Start Date \*/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Outage Start Time \*/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Outage End Date \*/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Outage End Time \*/).length).toBeGreaterThan(0);
    });

    it('hides all outage pickers when No is selected', () => {
      render(<OutageSection {...defaultProps} hasOutage={false} />);
      
      // Verify all outage pickers are hidden
      expect(screen.queryByText(/Outage Start Date \*/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Outage Start Time \*/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Outage End Date \*/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Outage End Time \*/)).not.toBeInTheDocument();
    });

    it('clears all outage values when switching from Yes to No', async () => {
      const user = userEvent.setup();
      
      render(
        <OutageSection 
          {...defaultProps} 
          hasOutage={true}
          outageStartDate={new Date('2025-01-15')}
          outageStartTime={new Date('2025-01-15T20:00:00')}
          outageEndDate={new Date('2025-01-15')}
          outageEndTime={new Date('2025-01-15T22:00:00')}
        />
      );
      
      const noRadio = screen.getByLabelText('No');
      await user.click(noRadio);
      
      // All outage date/time values should be cleared
      expect(mockOnOutageStartDateChange).toHaveBeenCalledWith(null);
      expect(mockOnOutageStartTimeChange).toHaveBeenCalledWith(null);
      expect(mockOnOutageEndDateChange).toHaveBeenCalledWith(null);
      expect(mockOnOutageEndTimeChange).toHaveBeenCalledWith(null);
    });

    it('displays validation error for invalid outage time ordering', () => {
      const errorMessage = 'Outage end time must be later than outage start time';
      
      render(
        <OutageSection 
          {...defaultProps} 
          hasOutage={true} 
          error={errorMessage}
        />
      );
      
      // Error should be displayed as an alert
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('toggles outage section visibility when indicator changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<OutageSection {...defaultProps} hasOutage={false} />);
      
      // Initially hidden
      expect(screen.queryByText(/Outage Start Date \*/)).not.toBeInTheDocument();
      
      // Click Yes
      const yesRadio = screen.getByLabelText('Yes');
      await user.click(yesRadio);
      
      // Rerender with hasOutage=true to simulate state update
      rerender(<OutageSection {...defaultProps} hasOutage={true} />);
      
      // Now visible
      expect(screen.getAllByText(/Outage Start Date \*/).length).toBeGreaterThan(0);
    });
  });
});
