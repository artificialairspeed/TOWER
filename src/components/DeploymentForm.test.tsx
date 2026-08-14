/**
 * DeploymentForm Component Tests
 * 
 * Tests for the main DeploymentForm component that assembles all form sections.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeploymentForm } from './DeploymentForm';
import { createDefaultForm } from '../data/formFactory';

describe('DeploymentForm', () => {
  const mockOnUpdate = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnRemove = vi.fn();

  const defaultProps = {
    formData: createDefaultForm(),
    formNumber: 1,
    onUpdate: mockOnUpdate,
    onReset: mockOnReset,
    onRemove: mockOnRemove,
    canRemove: true
  };

  it('renders the form with all sections', () => {
    render(<DeploymentForm {...defaultProps} />);
    
    // Verify form header
    expect(screen.getByText('Deployment Form 1')).toBeInTheDocument();
    
    // Verify Reset and Remove buttons are present
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    
    // Verify major sections are present by checking for key labels
    expect(screen.getByText(/Application/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment Schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/Outage Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Change Items/i)).toBeInTheDocument();
    expect(screen.getByText(/Impact Items/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Information/i)).toBeInTheDocument();
  });

  it('disables Remove button when canRemove is false', () => {
    render(<DeploymentForm {...defaultProps} canRemove={false} />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    expect(removeButton).toBeDisabled();
  });

  it('enables Remove button when canRemove is true', () => {
    render(<DeploymentForm {...defaultProps} canRemove={true} />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    expect(removeButton).toBeEnabled();
  });

  it('displays correct form number in header', () => {
    render(<DeploymentForm {...defaultProps} formNumber={3} />);
    
    expect(screen.getByText('Deployment Form 3')).toBeInTheDocument();
  });
});
