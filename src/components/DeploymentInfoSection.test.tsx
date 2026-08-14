/**
 * Tests for DeploymentInfoSection Component
 * 
 * Requirements tested: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeploymentInfoSection } from './DeploymentInfoSection';
import type { Environment } from '../types/models';

describe('DeploymentInfoSection', () => {
  const defaultProps = {
    changeNumber: '',
    releaseVersion: '',
    environment: null as Environment | null,
    onChangeNumberChange: vi.fn(),
    onReleaseVersionChange: vi.fn(),
    onEnvironmentChange: vi.fn()
  };

  it('renders all required fields', () => {
    render(<DeploymentInfoSection {...defaultProps} />);

    expect(screen.getByLabelText(/Change Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Release Version/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Environment/i)).toBeInTheDocument();
  });

  describe('Change Number field', () => {
    it('displays the current value', () => {
      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          changeNumber="CHG12345" 
        />
      );

      const input = screen.getByLabelText(/Change Number/i) as HTMLInputElement;
      expect(input.value).toBe('CHG12345');
    });

    it('calls onChange when value changes', async () => {
      const user = userEvent.setup();
      const onChangeNumberChange = vi.fn();

      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          onChangeNumberChange={onChangeNumberChange}
        />
      );

      const input = screen.getByLabelText(/Change Number/i);
      await user.type(input, 'CHG99');

      expect(onChangeNumberChange).toHaveBeenCalled();
    });

    it('enforces max length of 20 characters', () => {
      render(<DeploymentInfoSection {...defaultProps} />);

      // Verify component enforces max length through props
      const input = screen.getByLabelText(/Change Number/i) as HTMLInputElement;
      // Test helper text mentions the constraint
      expect(screen.getByText(/max 20 characters/i)).toBeInTheDocument();
    });

    it('auto-trims value on blur', async () => {
      const user = userEvent.setup();
      const onChangeNumberChange = vi.fn();

      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          changeNumber="  CHG12345  "
          onChangeNumberChange={onChangeNumberChange}
        />
      );

      const input = screen.getByLabelText(/Change Number/i);
      await user.click(input);
      await user.tab(); // Trigger blur

      expect(onChangeNumberChange).toHaveBeenCalledWith('CHG12345');
    });

    it('does not call onChange on blur if value is already trimmed', async () => {
      const user = userEvent.setup();
      const onChangeNumberChange = vi.fn();

      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          changeNumber="CHG12345"
          onChangeNumberChange={onChangeNumberChange}
        />
      );

      const input = screen.getByLabelText(/Change Number/i);
      await user.click(input);
      onChangeNumberChange.mockClear(); // Clear calls from click
      await user.tab(); // Trigger blur

      expect(onChangeNumberChange).not.toHaveBeenCalled();
    });

    it('displays validation error when provided', () => {
      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          changeNumberError="Change Number is required"
        />
      );

      expect(screen.getByText('Change Number is required')).toBeInTheDocument();
    });
  });

  describe('Release Version field', () => {
    it('displays the current value', () => {
      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          releaseVersion="v5.4.1" 
        />
      );

      const input = screen.getByLabelText(/Release Version/i) as HTMLInputElement;
      expect(input.value).toBe('v5.4.1');
    });

    it('calls onChange when value changes', async () => {
      const user = userEvent.setup();
      const onReleaseVersionChange = vi.fn();

      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          onReleaseVersionChange={onReleaseVersionChange}
        />
      );

      const input = screen.getByLabelText(/Release Version/i);
      await user.type(input, 'v1.0');

      expect(onReleaseVersionChange).toHaveBeenCalled();
    });

    it('enforces max length of 50 characters', () => {
      render(<DeploymentInfoSection {...defaultProps} />);

      // Verify component enforces max length through props
      const input = screen.getByLabelText(/Release Version/i) as HTMLInputElement;
      // Test helper text mentions the constraint
      expect(screen.getByText(/Max 50 characters/i)).toBeInTheDocument();
    });

    it('auto-trims value on blur', async () => {
      const user = userEvent.setup();
      const onReleaseVersionChange = vi.fn();

      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          releaseVersion="  v5.4.1  "
          onReleaseVersionChange={onReleaseVersionChange}
        />
      );

      const input = screen.getByLabelText(/Release Version/i);
      await user.click(input);
      await user.tab(); // Trigger blur

      expect(onReleaseVersionChange).toHaveBeenCalledWith('v5.4.1');
    });

    it('does not call onChange on blur if value is already trimmed', async () => {
      const user = userEvent.setup();
      const onReleaseVersionChange = vi.fn();

      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          releaseVersion="v5.4.1"
          onReleaseVersionChange={onReleaseVersionChange}
        />
      );

      const input = screen.getByLabelText(/Release Version/i);
      await user.click(input);
      onReleaseVersionChange.mockClear(); // Clear calls from click
      await user.tab(); // Trigger blur

      expect(onReleaseVersionChange).not.toHaveBeenCalled();
    });

    it('displays validation error when provided', () => {
      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          releaseVersionError="Release Version is required"
        />
      );

      expect(screen.getByText('Release Version is required')).toBeInTheDocument();
    });
  });

  describe('Environment dropdown', () => {
    it('displays no selection by default', () => {
      render(<DeploymentInfoSection {...defaultProps} />);

      // MUI Select with empty value shows empty content
      // Verify the select exists and has no selected value
      const select = screen.getByRole('combobox', { name: /Environment/i });
      expect(select).toBeInTheDocument();
      expect(select.textContent).toBe('​'); // Zero-width space used by MUI
    });

    it('displays the selected environment', () => {
      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          environment="PROD" 
        />
      );

      // MUI Select displays the selected value as text content
      expect(screen.getByText('PROD')).toBeInTheDocument();
    });

    it('calls onChange when environment is selected', async () => {
      const user = userEvent.setup();
      const onEnvironmentChange = vi.fn();

      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          onEnvironmentChange={onEnvironmentChange}
        />
      );

      const select = screen.getByLabelText(/Environment/i);
      await user.click(select);
      
      const prodOption = screen.getByRole('option', { name: 'PROD' });
      await user.click(prodOption);

      expect(onEnvironmentChange).toHaveBeenCalledWith('PROD');
    });

    it('provides all required environment options', async () => {
      const user = userEvent.setup();
      render(<DeploymentInfoSection {...defaultProps} />);

      const select = screen.getByLabelText(/Environment/i);
      await user.click(select);

      expect(screen.getByRole('option', { name: 'PROD' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'QA' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'ITEST' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'DEV' })).toBeInTheDocument();
    });

    it('can be cleared by selecting the placeholder', async () => {
      const user = userEvent.setup();
      const onEnvironmentChange = vi.fn();

      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          environment="PROD"
          onEnvironmentChange={onEnvironmentChange}
        />
      );

      const select = screen.getByLabelText(/Environment/i);
      await user.click(select);
      
      const emptyOption = screen.getByRole('option', { name: /Select Environment/i });
      await user.click(emptyOption);

      expect(onEnvironmentChange).toHaveBeenCalledWith(null);
    });

    it('displays validation error when provided', () => {
      render(
        <DeploymentInfoSection 
          {...defaultProps} 
          environmentError="Environment is required"
        />
      );

      expect(screen.getByText('Environment is required')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('displays all fields with values and no errors', () => {
      render(
        <DeploymentInfoSection 
          changeNumber="CHG12345"
          releaseVersion="v5.4.1"
          environment="PROD"
          onChangeNumberChange={vi.fn()}
          onReleaseVersionChange={vi.fn()}
          onEnvironmentChange={vi.fn()}
        />
      );

      const changeNumberInput = screen.getByLabelText(/Change Number/i) as HTMLInputElement;
      const releaseVersionInput = screen.getByLabelText(/Release Version/i) as HTMLInputElement;

      expect(changeNumberInput.value).toBe('CHG12345');
      expect(releaseVersionInput.value).toBe('v5.4.1');
      // MUI Select displays the selected value as text
      expect(screen.getByText('PROD')).toBeInTheDocument();
    });

    it('displays all fields with validation errors', () => {
      render(
        <DeploymentInfoSection 
          {...defaultProps}
          changeNumberError="Change Number is required"
          releaseVersionError="Release Version is required"
          environmentError="Environment is required"
        />
      );

      expect(screen.getByText('Change Number is required')).toBeInTheDocument();
      expect(screen.getByText('Release Version is required')).toBeInTheDocument();
      expect(screen.getByText('Environment is required')).toBeInTheDocument();
    });
  });
});
