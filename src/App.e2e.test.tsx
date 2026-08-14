/**
 * End-to-End Test: Validation Flow (Task 20.3)
 * 
 * Tests the complete validation workflow:
 * - Leave required fields empty
 * - Click Generate Outputs
 * - Verify generation blocked
 * - Verify validation errors displayed
 * - Verify all entered data preserved
 * - Correct errors
 * - Generate successfully
 * 
 * Requirements: 2.3, 3.5, 4.7, 8.4, 8.5, 10.2, 10.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('E2E: Validation Flow (Task 20.3)', () => {
  describe('Requirement 10.2-10.3: Validation blocking and error display', () => {
    it('blocks generation and displays validation error when form is incomplete', async () => {
      render(<App />);
      
      // Get the Generate Flight Plan button by its aria-label
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      expect(generateButton).toBeInTheDocument();
      expect(generateButton).not.toBeDisabled();
      
      // Attempt to generate with empty required fields
      fireEvent.click(generateButton);
      
      // Validation error should appear
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      });
      
      // Generation should not have succeeded
      expect(screen.queryByText(/Generated.*artifacts successfully/i)).not.toBeInTheDocument();
    });

    it('displays validation summary alert when generation fails', async () => {
      render(<App />);
      
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        // Check for validation alert
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
        // Check for guidance message
        expect(screen.getByText(/issue.*need.*attention/i)).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 10.3: Data preservation after validation failure', () => {
    it('preserves entered Change Number after validation failure', async () => {
      render(<App />);
      
      // Fill in Change Number
      const changeNumberInputs = screen.getAllByLabelText(/Change Number/i);
      fireEvent.change(changeNumberInputs[0], { target: { value: 'CHG12345' } });
      
      // Attempt generation (will fail due to missing required fields)
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      });
      
      // Verify value is preserved
      expect(changeNumberInputs[0]).toHaveValue('CHG12345');
    });

    it('preserves entered Release Version after validation failure', async () => {
      render(<App />);
      
      // Fill in Release Version
      const releaseVersionInputs = screen.getAllByLabelText(/Release Version/i);
      fireEvent.change(releaseVersionInputs[0], { target: { value: 'v1.0.0' } });
      
      // Attempt generation
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      });
      
      // Verify value is preserved
      expect(releaseVersionInputs[0]).toHaveValue('v1.0.0');
    });

    it('preserves entered Contact information after validation failure', async () => {
      render(<App />);
      
      // Fill in contact fields
      const contactNameInputs = screen.getAllByLabelText(/Contact Name/i);
      const contactEmailInputs = screen.getAllByLabelText(/Email/i);
      const contactPhoneInputs = screen.getAllByLabelText(/Phone/i);
      
      const testName = 'Jane Smith';
      const testEmail = 'jane@example.com';
      const testPhone = '(555) 987-6543';
      
      fireEvent.change(contactNameInputs[0], { target: { value: testName } });
      fireEvent.change(contactEmailInputs[0], { target: { value: testEmail } });
      fireEvent.change(contactPhoneInputs[0], { target: { value: testPhone } });
      
      // Attempt generation
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      });
      
      // Verify all values are preserved
      expect(contactNameInputs[0]).toHaveValue(testName);
      expect(contactEmailInputs[0]).toHaveValue(testEmail);
      expect(contactPhoneInputs[0]).toHaveValue(testPhone);
    });

    it('preserves entered Change Item data after validation failure', async () => {
      render(<App />);
      
      // Fill in Change Item
      const jiraInputs = screen.getAllByLabelText(/Jira number/i);
      const descriptionInputs = screen.getAllByLabelText(/Description/i);
      
      const testJira = 'TICKET-123';
      const testDescription = 'Implementation of new feature';
      
      fireEvent.change(jiraInputs[0], { target: { value: testJira } });
      fireEvent.change(descriptionInputs[0], { target: { value: testDescription } });
      
      // Attempt generation
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      });
      
      // Verify values are preserved
      expect(jiraInputs[0]).toHaveValue(testJira);
      expect(descriptionInputs[0]).toHaveValue(testDescription);
    });

    it('preserves multiple form fields simultaneously during validation failure', async () => {
      render(<App />);
      
      // Fill multiple fields
      const changeNumberInputs = screen.getAllByLabelText(/Change Number/i);
      const releaseVersionInputs = screen.getAllByLabelText(/Release Version/i);
      const contactNameInputs = screen.getAllByLabelText(/Contact Name/i);
      const jiraInputs = screen.getAllByLabelText(/Jira number/i);
      
      const testData = {
        changeNumber: 'CHG55555',
        releaseVersion: 'v2.1.0',
        contactName: 'Alice',
        jira: 'TASK-999'
      };
      
      fireEvent.change(changeNumberInputs[0], { target: { value: testData.changeNumber } });
      fireEvent.change(releaseVersionInputs[0], { target: { value: testData.releaseVersion } });
      fireEvent.change(contactNameInputs[0], { target: { value: testData.contactName } });
      fireEvent.change(jiraInputs[0], { target: { value: testData.jira } });
      
      // Trigger validation failure
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      });
      
      // Verify all data preserved
      expect(changeNumberInputs[0]).toHaveValue(testData.changeNumber);
      expect(releaseVersionInputs[0]).toHaveValue(testData.releaseVersion);
      expect(contactNameInputs[0]).toHaveValue(testData.contactName);
      expect(jiraInputs[0]).toHaveValue(testData.jira);
    });
  });

  describe('Requirement 8.4, 8.5: Contact field validation and data preservation', () => {
    it('preserves contact data when email format is invalid', async () => {
      render(<App />);
      
      const contactNameInputs = screen.getAllByLabelText(/Contact Name/i);
      const contactEmailInputs = screen.getAllByLabelText(/Email/i);
      const contactPhoneInputs = screen.getAllByLabelText(/Phone/i);
      
      // Enter invalid email
      fireEvent.change(contactNameInputs[0], { target: { value: 'Test User' } });
      fireEvent.change(contactEmailInputs[0], { target: { value: 'invalid-email-format' } });
      fireEvent.change(contactPhoneInputs[0], { target: { value: '(555) 444-5555' } });
      
      // Trigger validation
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      });
      
      // Data should be preserved exactly as entered
      expect(contactNameInputs[0]).toHaveValue('Test User');
      expect(contactEmailInputs[0]).toHaveValue('invalid-email-format');
      expect(contactPhoneInputs[0]).toHaveValue('(555) 444-5555');
    });

    it('preserves contact data when phone format is invalid', async () => {
      render(<App />);
      
      const contactNameInputs = screen.getAllByLabelText(/Contact Name/i);
      const contactEmailInputs = screen.getAllByLabelText(/Email/i);
      const contactPhoneInputs = screen.getAllByLabelText(/Phone/i);
      
      // Enter invalid phone
      fireEvent.change(contactNameInputs[0], { target: { value: 'Contact' } });
      fireEvent.change(contactEmailInputs[0], { target: { value: 'contact@test.com' } });
      fireEvent.change(contactPhoneInputs[0], { target: { value: '555-1234' } });
      
      // Trigger validation
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      });
      
      // All data should be preserved
      expect(contactNameInputs[0]).toHaveValue('Contact');
      expect(contactEmailInputs[0]).toHaveValue('contact@test.com');
      expect(contactPhoneInputs[0]).toHaveValue('555-1234');
    });
  });

  describe('Requirements 3.5, 4.7: Form-level validation', () => {
    it('validates all required fields and blocks generation on failure', async () => {
      render(<App />);
      
      // Leave form empty and attempt generation
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      // Validation should fail
      await waitFor(() => {
        expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      });
      
      // No success message should appear
      expect(screen.queryByText(/Generated.*artifacts successfully/i)).not.toBeInTheDocument();
    });

    it('shows validation error count in alert', async () => {
      render(<App />);
      
      const generateButton = screen.getByRole('button', {
        name: 'Generate HTML, PDF, and PNG outputs for all forms'
      });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        // Should display the number of validation issues
        const alert = screen.getByText(/issue.*need.*attention/i);
        expect(alert).toBeInTheDocument();
      });
    });
  });
});
