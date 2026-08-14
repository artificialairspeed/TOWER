/**
 * Tests for ContactSection Component
 * 
 * Requirements tested: 8.1, 8.2, 8.3, 8.4, 8.5
 * 
 * Test cases:
 * - Contact field validation (required, email format, phone format)
 * - Validation errors displayed adjacent to fields
 * - Entered values preserved on validation failure
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactSection } from './ContactSection';

describe('ContactSection', () => {
  const defaultProps = {
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    onContactNameChange: vi.fn(),
    onContactEmailChange: vi.fn(),
    onContactPhoneChange: vi.fn()
  };

  it('renders all required contact fields', () => {
    render(<ContactSection {...defaultProps} />);

    expect(screen.getByLabelText(/Contact Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
  });

  describe('Contact Name field - Requirement 8.1, 8.4', () => {
    it('displays the current value', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactName="John Doe" 
        />
      );

      const input = screen.getByLabelText(/Contact Name/i) as HTMLInputElement;
      expect(input.value).toBe('John Doe');
    });

    it('calls onChange when value changes', async () => {
      const user = userEvent.setup();
      const onContactNameChange = vi.fn();

      render(
        <ContactSection 
          {...defaultProps} 
          onContactNameChange={onContactNameChange}
        />
      );

      const input = screen.getByLabelText(/Contact Name/i);
      await user.type(input, 'Jane');

      expect(onContactNameChange).toHaveBeenCalled();
    });

    it('enforces max length of 255 characters', () => {
      render(<ContactSection {...defaultProps} />);

      const input = screen.getByLabelText(/Contact Name/i) as HTMLInputElement;
      expect(input.maxLength).toBe(255);
      
      // Verify helper text mentions the constraint
      expect(screen.getByText(/Max 255 characters/i)).toBeInTheDocument();
    });

    it('displays required field error when provided - Requirement 8.4', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactNameError="Contact Name is required"
        />
      );

      expect(screen.getByText('Contact Name is required')).toBeInTheDocument();
    });

    it('preserves entered value when validation error is displayed - Requirement 8.5', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactName="John Doe"
          contactNameError="Contact Name is required"
        />
      );

      const input = screen.getByLabelText(/Contact Name/i) as HTMLInputElement;
      expect(input.value).toBe('John Doe');
      expect(screen.getByText('Contact Name is required')).toBeInTheDocument();
    });

    it('shows helper text when no error is present', () => {
      render(<ContactSection {...defaultProps} />);

      expect(screen.getByText(/Max 255 characters/i)).toBeInTheDocument();
    });
  });

  describe('Email field - Requirements 8.1, 8.2, 8.4', () => {
    it('displays the current value', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactEmail="john@example.com" 
        />
      );

      const input = screen.getByLabelText(/Email/i) as HTMLInputElement;
      expect(input.value).toBe('john@example.com');
    });

    it('calls onChange when value changes', async () => {
      const user = userEvent.setup();
      const onContactEmailChange = vi.fn();

      render(
        <ContactSection 
          {...defaultProps} 
          onContactEmailChange={onContactEmailChange}
        />
      );

      const input = screen.getByLabelText(/Email/i);
      await user.type(input, 'test@ex');

      expect(onContactEmailChange).toHaveBeenCalled();
    });

    it('enforces max length of 255 characters', () => {
      render(<ContactSection {...defaultProps} />);

      const input = screen.getByLabelText(/Email/i) as HTMLInputElement;
      expect(input.maxLength).toBe(255);
    });

    it('displays required field error when provided - Requirement 8.4', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactEmailError="Email is required"
        />
      );

      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('displays email format validation error adjacent to field - Requirement 8.2, 8.4', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactEmail="invalid-email"
          contactEmailError="Please enter a valid email address (example@domain.com)"
        />
      );

      expect(screen.getByText('Please enter a valid email address (example@domain.com)')).toBeInTheDocument();
    });

    it('preserves entered value when format validation fails - Requirement 8.5', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactEmail="invalid-email"
          contactEmailError="Please enter a valid email address (example@domain.com)"
        />
      );

      const input = screen.getByLabelText(/Email/i) as HTMLInputElement;
      expect(input.value).toBe('invalid-email');
      expect(screen.getByText('Please enter a valid email address (example@domain.com)')).toBeInTheDocument();
    });

    it('shows helper text with format requirement when no error', () => {
      render(<ContactSection {...defaultProps} />);

      expect(screen.getByText(/Valid email format required \(example@domain\.com\)/i)).toBeInTheDocument();
    });
  });

  describe('Phone field - Requirements 8.1, 8.3, 8.4', () => {
    it('displays the current value', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactPhone="(555) 123-4567" 
        />
      );

      const input = screen.getByLabelText(/Phone/i) as HTMLInputElement;
      expect(input.value).toBe('(555) 123-4567');
    });

    it('calls onChange when value changes', async () => {
      const user = userEvent.setup();
      const onContactPhoneChange = vi.fn();

      render(
        <ContactSection 
          {...defaultProps} 
          onContactPhoneChange={onContactPhoneChange}
        />
      );

      const input = screen.getByLabelText(/Phone/i);
      await user.type(input, '(555');

      expect(onContactPhoneChange).toHaveBeenCalled();
    });

    it('enforces max length of 255 characters', () => {
      render(<ContactSection {...defaultProps} />);

      const input = screen.getByLabelText(/Phone/i) as HTMLInputElement;
      expect(input.maxLength).toBe(255);
    });

    it('displays required field error when provided - Requirement 8.4', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactPhoneError="Phone is required"
        />
      );

      expect(screen.getByText('Phone is required')).toBeInTheDocument();
    });

    it('displays phone format validation error adjacent to field - Requirement 8.3, 8.4', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactPhone="555-123-4567"
          contactPhoneError="Please enter phone number as (###) ###-####"
        />
      );

      expect(screen.getByText('Please enter phone number as (###) ###-####')).toBeInTheDocument();
    });

    it('preserves entered value when format validation fails - Requirement 8.5', () => {
      render(
        <ContactSection 
          {...defaultProps} 
          contactPhone="555-123-4567"
          contactPhoneError="Please enter phone number as (###) ###-####"
        />
      );

      const input = screen.getByLabelText(/Phone/i) as HTMLInputElement;
      expect(input.value).toBe('555-123-4567');
      expect(screen.getByText('Please enter phone number as (###) ###-####')).toBeInTheDocument();
    });

    it('shows helper text with format requirement when no error', () => {
      render(<ContactSection {...defaultProps} />);

      expect(screen.getByText(/Format: \(###\) ###-####/i)).toBeInTheDocument();
    });
  });

  describe('Integration - Requirements 8.1-8.5', () => {
    it('displays all fields with valid values and no errors', () => {
      render(
        <ContactSection 
          contactName="John Doe"
          contactEmail="john@example.com"
          contactPhone="(555) 123-4567"
          onContactNameChange={vi.fn()}
          onContactEmailChange={vi.fn()}
          onContactPhoneChange={vi.fn()}
        />
      );

      const nameInput = screen.getByLabelText(/Contact Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone/i) as HTMLInputElement;

      expect(nameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('john@example.com');
      expect(phoneInput.value).toBe('(555) 123-4567');
      
      // No validation errors should be displayed
      expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Please enter/i)).not.toBeInTheDocument();
    });

    it('displays all fields with validation errors adjacent to each field - Requirement 8.4', () => {
      render(
        <ContactSection 
          {...defaultProps}
          contactNameError="Contact Name is required"
          contactEmailError="Please enter a valid email address (example@domain.com)"
          contactPhoneError="Please enter phone number as (###) ###-####"
        />
      );

      // All three validation errors should be displayed adjacent to their fields
      expect(screen.getByText('Contact Name is required')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email address (example@domain.com)')).toBeInTheDocument();
      expect(screen.getByText('Please enter phone number as (###) ###-####')).toBeInTheDocument();
    });

    it('preserves all entered values when multiple validation errors occur - Requirement 8.5', () => {
      render(
        <ContactSection 
          contactName="John Doe"
          contactEmail="invalid-email"
          contactPhone="555-123-4567"
          onContactNameChange={vi.fn()}
          onContactEmailChange={vi.fn()}
          onContactPhoneChange={vi.fn()}
          contactEmailError="Please enter a valid email address (example@domain.com)"
          contactPhoneError="Please enter phone number as (###) ###-####"
        />
      );

      // All entered values should be preserved
      const nameInput = screen.getByLabelText(/Contact Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone/i) as HTMLInputElement;

      expect(nameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('invalid-email');
      expect(phoneInput.value).toBe('555-123-4567');
      
      // Validation errors should be displayed
      expect(screen.getByText('Please enter a valid email address (example@domain.com)')).toBeInTheDocument();
      expect(screen.getByText('Please enter phone number as (###) ###-####')).toBeInTheDocument();
    });

    it('marks all fields as required', () => {
      render(<ContactSection {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Contact Name/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const phoneInput = screen.getByLabelText(/Phone/i);

      // All fields should have required attribute
      expect(nameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(phoneInput).toBeRequired();
    });
  });
});
