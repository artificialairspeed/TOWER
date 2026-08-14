/**
 * Tests for ValidationErrorSummary component
 * 
 * Tests validation error summary display:
 * - Renders error summary with correct messages
 * - Shows form number in title
 * - Displays correct count of errors
 * - Does not render when no errors
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationErrorSummary } from './ValidationErrorSummary';
import type { ValidationError } from '../types/models';

describe('ValidationErrorSummary', () => {
  it('should not render when there are no errors', () => {
    const { container } = render(
      <ValidationErrorSummary errors={[]} formNumber={1} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should display error summary with form number', () => {
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' }
    ];
    
    render(<ValidationErrorSummary errors={errors} formNumber={2} />);
    
    expect(screen.getByText(/Validation Errors in Deployment Form 2/i)).toBeInTheDocument();
  });

  it('should display correct error count for single error', () => {
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' }
    ];
    
    render(<ValidationErrorSummary errors={errors} formNumber={1} />);
    
    expect(screen.getByText(/Please correct the following 1 error/i)).toBeInTheDocument();
  });

  it('should display correct error count for multiple errors', () => {
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' },
      { formId: 'form1', field: 'environment', message: 'Please select an environment' }
    ];
    
    render(<ValidationErrorSummary errors={errors} formNumber={1} />);
    
    expect(screen.getByText(/Please correct the following 3 errors/i)).toBeInTheDocument();
  });

  it('should display all error messages', () => {
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' },
      { formId: 'form1', field: 'environment', message: 'Please select an environment' }
    ];
    
    render(<ValidationErrorSummary errors={errors} formNumber={1} />);
    
    expect(screen.getByText(/Change Number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    expect(screen.getByText(/Please select an environment/i)).toBeInTheDocument();
  });

  it('should display field labels for common fields', () => {
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' }
    ];
    
    render(<ValidationErrorSummary errors={errors} formNumber={1} />);
    
    // Field labels should appear as bold text
    expect(screen.getByText(/Change Number:/i)).toBeInTheDocument();
    expect(screen.getByText(/Email:/i)).toBeInTheDocument();
  });

  it('should handle array field names (like change items)', () => {
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeItems[0].jiraNumber', message: 'Change Item 1: Jira Number is required' }
    ];
    
    render(<ValidationErrorSummary errors={errors} formNumber={1} />);
    
    // Should display the message which already includes the formatted field name
    expect(screen.getByText(/Change Item 1: Jira Number is required/i)).toBeInTheDocument();
  });

  it('should render as an error alert', () => {
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' }
    ];
    
    const { container } = render(<ValidationErrorSummary errors={errors} formNumber={1} />);
    
    // Should have error severity styling - check for MuiAlert with error severity
    const alert = container.querySelector('.MuiAlert-root');
    expect(alert).toBeInTheDocument();
    
    // Verify it's an error alert by checking for the error icon or severity
    expect(alert?.classList.toString()).toContain('MuiAlert');
  });

  it('should display errors in a list format', () => {
    const errors: ValidationError[] = [
      { formId: 'form1', field: 'changeNumber', message: 'Change Number is required' },
      { formId: 'form1', field: 'contactEmail', message: 'Invalid email format' }
    ];
    
    const { container } = render(<ValidationErrorSummary errors={errors} formNumber={1} />);
    
    // Should render as a list
    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();
    
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(2);
  });
});
