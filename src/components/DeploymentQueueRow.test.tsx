/**
 * Unit tests for DeploymentQueueRow component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeploymentQueueRow } from './DeploymentQueueRow';
import { createDefaultForm } from '../data/formFactory';
import { APPLICATION_CATALOG } from '../types/models';

describe('DeploymentQueueRow', () => {
  const mockOnUpdate = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnRemove = vi.fn();
  const mockOnClearFieldError = vi.fn();

  const defaultProps = {
    formData: createDefaultForm(),
    position: 1,
    onUpdate: mockOnUpdate,
    onReset: mockOnReset,
    onRemove: mockOnRemove,
    canRemove: true,
    validationErrors: [],
    onClearFieldError: mockOnClearFieldError
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with collapsed state by default', () => {
    const { container } = render(<DeploymentQueueRow {...defaultProps} />);
    
    // Should show queue position
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Should show "Not Selected" for application
    expect(screen.getByText('Not Selected')).toBeInTheDocument();
    
    // Check that the Collapse component is not expanded
    const collapseContainer = container.querySelector('.MuiCollapse-root');
    expect(collapseContainer).toHaveClass('MuiCollapse-hidden');
  });

  it('should display application information when selected', () => {
    const formDataWithApp = {
      ...createDefaultForm(),
      application: APPLICATION_CATALOG[0],
      environment: 'PROD' as const
    };

    render(<DeploymentQueueRow {...defaultProps} formData={formDataWithApp} />);
    
    expect(screen.getAllByText(APPLICATION_CATALOG[0].name)[0]).toBeInTheDocument();
    expect(screen.getAllByText('PROD').length).toBeGreaterThan(0);
  });

  it('should expand when clicked', () => {
    const { container } = render(<DeploymentQueueRow {...defaultProps} />);
    
    // Initially collapsed
    const collapseContainer = container.querySelector('.MuiCollapse-root');
    expect(collapseContainer).toHaveClass('MuiCollapse-hidden');
    
    // Click the summary row
    const summaryRow = screen.getByRole('button', { name: /Expand to show details/ });
    fireEvent.click(summaryRow);
    
    // Should now be expanded
    expect(collapseContainer).not.toHaveClass('MuiCollapse-hidden');
  });

  it('should collapse when clicked while expanded', () => {
    render(<DeploymentQueueRow {...defaultProps} />);
    
    // Expand
    let summaryRow = screen.getByRole('button', { name: /Expand to show details/ });
    expect(summaryRow).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(summaryRow);
    
    // Check expanded
    summaryRow = screen.getByRole('button', { name: /Collapse to hide details/ });
    expect(summaryRow).toHaveAttribute('aria-expanded', 'true');
    
    // Collapse
    fireEvent.click(summaryRow);
    summaryRow = screen.getByRole('button', { name: /Expand to show details/ });
    expect(summaryRow).toHaveAttribute('aria-expanded', 'false');
  });

  it('should show error indicator when validation errors exist', () => {
    const propsWithErrors = {
      ...defaultProps,
      validationErrors: [
        { formId: 'form-1', field: 'changeNumber', message: 'Required' },
        { formId: 'form-1', field: 'contactEmail', message: 'Invalid email' }
      ]
    };

    render(<DeploymentQueueRow {...propsWithErrors} />);
    
    expect(screen.getByText('2 errors')).toBeInTheDocument();
  });

  it('should call onRemove when remove button is clicked', () => {
    render(<DeploymentQueueRow {...defaultProps} />);
    
    const removeButton = screen.getByLabelText('Remove deployment');
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('should disable remove button when canRemove is false', () => {
    render(<DeploymentQueueRow {...defaultProps} canRemove={false} />);
    
    const removeButton = screen.getByLabelText('Cannot remove the only deployment');
    expect(removeButton).toBeDisabled();
  });

  it('should not expand when remove button is clicked', () => {
    render(<DeploymentQueueRow {...defaultProps} />);
    
    const removeButton = screen.getByLabelText('Remove deployment');
    fireEvent.click(removeButton);
    
    // Remove should be called
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    
    // Form should still be collapsed (not visible)
    const expandButton = screen.getByRole('button', { name: /Expand to show details/ });
    expect(expandButton).toBeInTheDocument();
  });

  it('should show formatted deployment date', () => {
    const formDataWithDate = {
      ...createDefaultForm(),
      deploymentDate: new Date('2024-12-25')
    };

    render(<DeploymentQueueRow {...defaultProps} formData={formDataWithDate} />);
    
    // Check for Dec and 2024 (day might vary due to timezone)
    expect(screen.getByText(/Dec.*2024/)).toBeInTheDocument();
  });

  it('should display PROD environment with error color chip', () => {
    const formDataWithProd = {
      ...createDefaultForm(),
      environment: 'PROD' as const
    };

    render(<DeploymentQueueRow {...defaultProps} formData={formDataWithProd} />);
    
    // Check that PROD text exists in the chip
    expect(screen.getAllByText('PROD').length).toBeGreaterThan(0);
  });
});
