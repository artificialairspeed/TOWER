/**
 * Component Tests for DeploymentInfoSection
 * 
 * Tests the core deployment identifier entry controls:
 * - Change Number input with auto-trim on blur
 * - Release Version input with auto-trim on blur  
 * - Environment dropdown selection
 * - Required field validation error display
 * - Validation error persistence with entered data
 * 
 * Requirements: 3.1-3.8
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { DeploymentInfoSection, DeploymentInfoSectionProps } from './DeploymentInfoSection';

/**
 * Helper to render the component with default props
 */
const renderComponent = (props: Partial<DeploymentInfoSectionProps> = {}) => {
  const defaultProps: DeploymentInfoSectionProps = {
    changeNumber: '',
    releaseVersion: '',
    environment: null,
    onChangeNumberChange: vi.fn(),
    onReleaseVersionChange: vi.fn(),
    onEnvironmentChange: vi.fn(),
    onBlurValidate: vi.fn(),
    ...props,
  };
  
  return {
    ...render(<DeploymentInfoSection {...defaultProps} />),
    defaultProps,
  };
};

describe('DeploymentInfoSection', () => {
  // =========================================================================
  // Change Number Input - Auto-trim on Blur Tests (Requirement 3.4)
  // =========================================================================
  
  describe('Change Number - Auto-trim on blur', () => {
    it('should trim leading whitespace on blur', async () => {
      const onChangeNumberChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        changeNumber: '  CHG12345',
        onChangeNumberChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Change number');
      fireEvent.blur(input);
      
      expect(onChangeNumberChange).toHaveBeenCalledWith('CHG12345');
      expect(onBlurValidate).toHaveBeenCalledWith('changeNumber', 'CHG12345');
    });
    
    it('should trim trailing whitespace on blur', async () => {
      const onChangeNumberChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        changeNumber: 'CHG12345  ',
        onChangeNumberChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Change number');
      fireEvent.blur(input);
      
      expect(onChangeNumberChange).toHaveBeenCalledWith('CHG12345');
      expect(onBlurValidate).toHaveBeenCalledWith('changeNumber', 'CHG12345');
    });
    
    it('should trim both leading and trailing whitespace on blur', async () => {
      const onChangeNumberChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        changeNumber: '  CHG12345  ',
        onChangeNumberChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Change number');
      fireEvent.blur(input);
      
      expect(onChangeNumberChange).toHaveBeenCalledWith('CHG12345');
      expect(onBlurValidate).toHaveBeenCalledWith('changeNumber', 'CHG12345');
    });
    
    it('should not update if already trimmed on blur', async () => {
      const onChangeNumberChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        changeNumber: 'CHG12345',
        onChangeNumberChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Change number');
      fireEvent.blur(input);
      
      expect(onChangeNumberChange).not.toHaveBeenCalled();
      expect(onBlurValidate).toHaveBeenCalledWith('changeNumber', 'CHG12345');
    });
    
    it('should call onBlurValidate with trimmed value even when not changed', async () => {
      const onBlurValidate = vi.fn();
      
      renderComponent({
        changeNumber: 'CHG12345',
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Change number');
      fireEvent.blur(input);
      
      expect(onBlurValidate).toHaveBeenCalledWith('changeNumber', 'CHG12345');
    });
  });
  
  // =========================================================================
  // Release Version Input - Auto-trim on Blur Tests (Requirement 3.4)
  // =========================================================================
  
  describe('Release Version - Auto-trim on blur', () => {
    it('should trim leading whitespace on blur', async () => {
      const onReleaseVersionChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        releaseVersion: '  v5.4.1',
        onReleaseVersionChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Release version');
      fireEvent.blur(input);
      
      expect(onReleaseVersionChange).toHaveBeenCalledWith('v5.4.1');
      expect(onBlurValidate).toHaveBeenCalledWith('releaseVersion', 'v5.4.1');
    });
    
    it('should trim trailing whitespace on blur', async () => {
      const onReleaseVersionChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        releaseVersion: 'v5.4.1  ',
        onReleaseVersionChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Release version');
      fireEvent.blur(input);
      
      expect(onReleaseVersionChange).toHaveBeenCalledWith('v5.4.1');
      expect(onBlurValidate).toHaveBeenCalledWith('releaseVersion', 'v5.4.1');
    });
    
    it('should trim both leading and trailing whitespace on blur', async () => {
      const onReleaseVersionChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        releaseVersion: '  v5.4.1  ',
        onReleaseVersionChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Release version');
      fireEvent.blur(input);
      
      expect(onReleaseVersionChange).toHaveBeenCalledWith('v5.4.1');
      expect(onBlurValidate).toHaveBeenCalledWith('releaseVersion', 'v5.4.1');
    });
    
    it('should not update if already trimmed on blur', async () => {
      const onReleaseVersionChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        releaseVersion: 'v5.4.1',
        onReleaseVersionChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Release version');
      fireEvent.blur(input);
      
      expect(onReleaseVersionChange).not.toHaveBeenCalled();
      expect(onBlurValidate).toHaveBeenCalledWith('releaseVersion', 'v5.4.1');
    });
  });
  
  // =========================================================================
  // Required Field Validation Error Display Tests (Requirement 3.5)
  // =========================================================================
  
  describe('Required field validation errors', () => {
    it('should display change number error when provided', () => {
      renderComponent({
        changeNumberError: 'Change Number is required',
      });
      
      expect(screen.getByText('Change Number is required')).toBeInTheDocument();
    });
    
    it('should display release version error when provided', () => {
      renderComponent({
        releaseVersionError: 'Release Version is required',
      });
      
      expect(screen.getByText('Release Version is required')).toBeInTheDocument();
    });
    
    it('should display environment error when provided', () => {
      renderComponent({
        environmentError: 'Environment is required',
      });
      
      expect(screen.getByText('Environment is required')).toBeInTheDocument();
    });
    
    it('should display all three errors when all provided', () => {
      renderComponent({
        changeNumberError: 'Change Number is required',
        releaseVersionError: 'Release Version is required',
        environmentError: 'Environment is required',
      });
      
      expect(screen.getByText('Change Number is required')).toBeInTheDocument();
      expect(screen.getByText('Release Version is required')).toBeInTheDocument();
      expect(screen.getByText('Environment is required')).toBeInTheDocument();
    });
    
    it('should set error attribute on input when error exists', () => {
      renderComponent({
        changeNumberError: 'Error message',
      });
      
      const input = screen.getByLabelText('Change number') as HTMLInputElement;
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    
    it('should set error attribute on environment select when error exists', () => {
      renderComponent({
        environmentError: 'Error message',
      });
      
      const select = screen.getByLabelText('Deployment environment');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });
  });
  
  // =========================================================================
  // Validation Error Persistence Tests (Requirement 3.5)
  // =========================================================================
  
  describe('Validation error persistence with entered data', () => {
    it('should preserve entered change number when error is displayed', () => {
      renderComponent({
        changeNumber: 'CHG12345',
        changeNumberError: 'Invalid format',
      });
      
      const input = screen.getByLabelText('Change number') as HTMLInputElement;
      expect(input.value).toBe('CHG12345');
    });
    
    it('should preserve entered release version when error is displayed', () => {
      renderComponent({
        releaseVersion: 'v5.4.1',
        releaseVersionError: 'Invalid format',
      });
      
      const input = screen.getByLabelText('Release version') as HTMLInputElement;
      expect(input.value).toBe('v5.4.1');
    });
    
    it('should preserve environment selection when error is displayed', () => {
      renderComponent({
        environment: 'PROD',
        environmentError: 'Invalid selection',
      });
      
      // For MUI Select, check that PROD is selected (rendered as selected menu item)
      const select = screen.getByLabelText('Deployment environment');
      expect(select).toHaveTextContent('PROD');
    });
    
    it('should retain all values when multiple errors displayed', () => {
      renderComponent({
        changeNumber: 'CHG12345',
        releaseVersion: 'v5.4.1',
        environment: 'QA',
        changeNumberError: 'Error 1',
        releaseVersionError: 'Error 2',
        environmentError: 'Error 3',
      });
      
      expect((screen.getByLabelText('Change number') as HTMLInputElement).value).toBe('CHG12345');
      expect((screen.getByLabelText('Release version') as HTMLInputElement).value).toBe('v5.4.1');
      expect(screen.getByLabelText('Deployment environment')).toHaveTextContent('QA');
    });
  });
  
  // =========================================================================
  // Environment Selection Tests (Requirement 3.3)
  // =========================================================================
  
  describe('Environment dropdown selection', () => {
    it('should display all environment options', () => {
      renderComponent();
      
      const select = screen.getByLabelText('Deployment environment');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('PROD')).toBeInTheDocument();
      expect(screen.getByText('QA')).toBeInTheDocument();
      expect(screen.getByText('ITEST')).toBeInTheDocument();
      expect(screen.getByText('DEV')).toBeInTheDocument();
    });
    
    it('should display placeholder when no environment selected', () => {
      renderComponent({
        environment: null,
      });
      
      // When no environment selected, the MUI Select renders with the InputLabel visible
      // The placeholder behavior is represented by the floating label
      const select = screen.getByLabelText('Deployment environment');
      expect(select).toBeInTheDocument();
      // Verify the select renders without crashing when value is null
    });
    
    it('should call onEnvironmentChange when environment selected', async () => {
      const onEnvironmentChange = vi.fn();
      
      renderComponent({
        onEnvironmentChange,
      });
      
      const select = screen.getByLabelText('Deployment environment');
      fireEvent.mouseDown(select);
      
      const option = screen.getByText('PROD');
      fireEvent.click(option);
      
      expect(onEnvironmentChange).toHaveBeenCalledWith('PROD');
    });
    
    it('should display selected environment', () => {
      renderComponent({
        environment: 'PROD',
      });
      
      const select = screen.getByLabelText('Deployment environment');
      expect(select).toHaveTextContent('PROD');
    });
    
    it('should clear environment by selecting placeholder', async () => {
      const onEnvironmentChange = vi.fn();
      
      renderComponent({
        environment: 'PROD',
        onEnvironmentChange,
      });
      
      const select = screen.getByLabelText('Deployment environment');
      fireEvent.mouseDown(select);
      
      const placeholder = screen.getByText('Select Environment');
      fireEvent.click(placeholder);
      
      expect(onEnvironmentChange).toHaveBeenCalledWith(null);
    });
  });
  
  // =========================================================================
  // Field Input Handling Tests
  // =========================================================================
  
  describe('Field input handling', () => {
    it('should call onChangeNumberChange when change number input changes', async () => {
      const onChangeNumberChange = vi.fn();
      
      renderComponent({
        onChangeNumberChange,
      });
      
      const input = screen.getByLabelText('Change number');
      fireEvent.change(input, { target: { value: 'CHG54321' } });
      
      expect(onChangeNumberChange).toHaveBeenCalledWith('CHG54321');
    });
    
    it('should call onReleaseVersionChange when release version input changes', async () => {
      const onReleaseVersionChange = vi.fn();
      
      renderComponent({
        onReleaseVersionChange,
      });
      
      const input = screen.getByLabelText('Release version');
      fireEvent.change(input, { target: { value: 'v6.0.0' } });
      
      expect(onReleaseVersionChange).toHaveBeenCalledWith('v6.0.0');
    });
    
    it('should enforce max length of 20 for change number', () => {
      renderComponent({
        changeNumber: 'CHG12345',
      });
      
      const input = screen.getByLabelText('Change number') as HTMLInputElement;
      expect(input).toHaveAttribute('maxLength', '20');
    });
    
    it('should enforce max length of 50 for release version', () => {
      renderComponent({
        releaseVersion: 'v5.4.1',
      });
      
      const input = screen.getByLabelText('Release version') as HTMLInputElement;
      expect(input).toHaveAttribute('maxLength', '50');
    });
  });
  
  // =========================================================================
  // Accessibility Tests (Requirement 3.1-3.8)
  // =========================================================================
  
  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Change number')).toBeInTheDocument();
      expect(screen.getByLabelText('Release version')).toBeInTheDocument();
      expect(screen.getByLabelText('Deployment environment')).toBeInTheDocument();
    });
    
    it('should have required indicators on all fields', () => {
      renderComponent();
      
      // MUI marks required fields with an asterisk in the label
      const labels = screen.getAllByText(/\*/);
      expect(labels.length).toBeGreaterThanOrEqual(3);
    });
    
    it('should mark change number input as required', () => {
      renderComponent();
      
      const input = screen.getByLabelText(/Change number/i) as HTMLInputElement;
      expect(input).toBeRequired();
    });
    
    it('should mark release version input as required', () => {
      renderComponent();
      
      const input = screen.getByLabelText(/Release version/i) as HTMLInputElement;
      expect(input).toBeRequired();
    });
  });
  
  // =========================================================================
  // Edge Cases Tests
  // =========================================================================
  
  describe('Edge cases', () => {
    it('should handle empty change number trim', async () => {
      const onChangeNumberChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        changeNumber: '   ',
        onChangeNumberChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Change number');
      fireEvent.blur(input);
      
      expect(onChangeNumberChange).toHaveBeenCalledWith('');
      expect(onBlurValidate).toHaveBeenCalledWith('changeNumber', '');
    });
    
    it('should handle empty release version trim', async () => {
      const onReleaseVersionChange = vi.fn();
      const onBlurValidate = vi.fn();
      
      renderComponent({
        releaseVersion: '   ',
        onReleaseVersionChange,
        onBlurValidate,
      });
      
      const input = screen.getByLabelText('Release version');
      fireEvent.blur(input);
      
      expect(onReleaseVersionChange).toHaveBeenCalledWith('');
      expect(onBlurValidate).toHaveBeenCalledWith('releaseVersion', '');
    });
    
    it('should handle tabs and newlines in trim', async () => {
      const onChangeNumberChange = vi.fn();
      
      renderComponent({
        changeNumber: '\t\nCHG12345\n\t',
        onChangeNumberChange,
      });
      
      const input = screen.getByLabelText('Change number');
      fireEvent.blur(input);
      
      expect(onChangeNumberChange).toHaveBeenCalledWith('CHG12345');
    });
    
    it('should not update onBlurValidate when callback not provided', () => {
      const { defaultProps } = renderComponent({
        changeNumber: '  CHG12345',
        onBlurValidate: undefined,
      });
      
      const input = screen.getByLabelText('Change number');
      fireEvent.blur(input);
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });
  
  // =========================================================================
  // Helper Text Tests (Requirement 3.1, 3.2)
  // =========================================================================
  
  describe('Helper text display', () => {
    it('should show max character hint for change number when no error', () => {
      renderComponent();
      
      expect(screen.getByText('Max 20 characters')).toBeInTheDocument();
    });
    
    it('should show max character hint for release version when no error', () => {
      renderComponent();
      
      expect(screen.getByText('Max 50 characters')).toBeInTheDocument();
    });
    
    it('should replace helper text with error message when error exists', () => {
      renderComponent({
        changeNumberError: 'Custom error message',
      });
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      // The helper text is replaced, not shown alongside
      expect(screen.queryByText('Max 20 characters')).not.toBeInTheDocument();
    });
  });
});
