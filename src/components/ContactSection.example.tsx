/**
 * ContactSection Component Examples
 * 
 * This file demonstrates various use cases of the ContactSection component.
 */

import React, { useState } from 'react';
import { Container, Button, Typography, Box } from '@mui/material';
import { ContactSection } from './ContactSection';
import { validateForm } from '../utils/validators';
import { createDefaultForm } from '../data/formFactory';
import type { DeploymentFormData } from '../types/models';

/**
 * Example 1: Basic ContactSection with no validation
 */
export function BasicContactSectionExample() {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Basic Contact Section
      </Typography>
      <ContactSection
        contactName={contactName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        onContactNameChange={setContactName}
        onContactEmailChange={setContactEmail}
        onContactPhoneChange={setContactPhone}
      />
      <Box mt={2}>
        <Typography variant="body2">
          Name: {contactName || '(empty)'}
        </Typography>
        <Typography variant="body2">
          Email: {contactEmail || '(empty)'}
        </Typography>
        <Typography variant="body2">
          Phone: {contactPhone || '(empty)'}
        </Typography>
      </Box>
    </Container>
  );
}

/**
 * Example 2: ContactSection with validation
 */
export function ValidatedContactSectionExample() {
  const [formData, setFormData] = useState<DeploymentFormData>(createDefaultForm());
  const [errors, setErrors] = useState<{
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  }>({});

  const handleValidate = () => {
    const validationResult = validateForm(formData);
    
    // Extract contact-related errors
    const contactErrors: typeof errors = {};
    validationResult.errors.forEach(error => {
      if (error.field === 'contactName') {
        contactErrors.contactName = error.message;
      } else if (error.field === 'contactEmail') {
        contactErrors.contactEmail = error.message;
      } else if (error.field === 'contactPhone') {
        contactErrors.contactPhone = error.message;
      }
    });
    
    setErrors(contactErrors);
  };

  const handleContactNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, contactName: value }));
    // Clear error when user starts typing
    if (errors.contactName) {
      setErrors(prev => ({ ...prev, contactName: undefined }));
    }
  };

  const handleContactEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, contactEmail: value }));
    if (errors.contactEmail) {
      setErrors(prev => ({ ...prev, contactEmail: undefined }));
    }
  };

  const handleContactPhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, contactPhone: value }));
    if (errors.contactPhone) {
      setErrors(prev => ({ ...prev, contactPhone: undefined }));
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Contact Section with Validation
      </Typography>
      <ContactSection
        contactName={formData.contactName}
        contactEmail={formData.contactEmail}
        contactPhone={formData.contactPhone}
        onContactNameChange={handleContactNameChange}
        onContactEmailChange={handleContactEmailChange}
        onContactPhoneChange={handleContactPhoneChange}
        contactNameError={errors.contactName}
        contactEmailError={errors.contactEmail}
        contactPhoneError={errors.contactPhone}
      />
      <Box mt={2}>
        <Button variant="contained" onClick={handleValidate}>
          Validate Contact Info
        </Button>
      </Box>
    </Container>
  );
}

/**
 * Example 3: ContactSection with pre-filled valid data
 */
export function PrefilledContactSectionExample() {
  const [contactName, setContactName] = useState('John Doe');
  const [contactEmail, setContactEmail] = useState('john.doe@example.com');
  const [contactPhone, setContactPhone] = useState('(555) 123-4567');

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Pre-filled Contact Section
      </Typography>
      <ContactSection
        contactName={contactName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        onContactNameChange={setContactName}
        onContactEmailChange={setContactEmail}
        onContactPhoneChange={setContactPhone}
      />
    </Container>
  );
}

/**
 * Example 4: ContactSection with invalid data and errors displayed
 */
export function InvalidContactSectionExample() {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('invalid-email');
  const [contactPhone, setContactPhone] = useState('123-456-7890');

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Invalid Contact Section (with errors)
      </Typography>
      <ContactSection
        contactName={contactName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        onContactNameChange={setContactName}
        onContactEmailChange={setContactEmail}
        onContactPhoneChange={setContactPhone}
        contactNameError="Contact Name is required"
        contactEmailError="Please enter a valid email address (example@domain.com)"
        contactPhoneError="Please enter phone number as (###) ###-####"
      />
    </Container>
  );
}

/**
 * Example 5: Full integration example
 */
export function FullIntegrationExample() {
  const [formData, setFormData] = useState<DeploymentFormData>(createDefaultForm());
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    const result = validateForm(formData);
    
    if (result.isValid) {
      setIsSubmitted(true);
      setValidationErrors(new Map());
    } else {
      const errorMap = new Map<string, string>();
      result.errors.forEach(error => {
        errorMap.set(error.field, error.message);
      });
      setValidationErrors(errorMap);
      setIsSubmitted(false);
    }
  };

  const handleReset = () => {
    setFormData(createDefaultForm());
    setValidationErrors(new Map());
    setIsSubmitted(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Full Integration Example
      </Typography>
      
      <ContactSection
        contactName={formData.contactName}
        contactEmail={formData.contactEmail}
        contactPhone={formData.contactPhone}
        onContactNameChange={(value) => setFormData(prev => ({ ...prev, contactName: value }))}
        onContactEmailChange={(value) => setFormData(prev => ({ ...prev, contactEmail: value }))}
        onContactPhoneChange={(value) => setFormData(prev => ({ ...prev, contactPhone: value }))}
        contactNameError={validationErrors.get('contactName')}
        contactEmailError={validationErrors.get('contactEmail')}
        contactPhoneError={validationErrors.get('contactPhone')}
      />

      <Box mt={3} display="flex" gap={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
      </Box>

      {isSubmitted && (
        <Box mt={2} p={2} bgcolor="success.light" borderRadius={1}>
          <Typography variant="body1" color="success.dark">
            ✓ Contact information validated successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Name: {formData.contactName}<br />
            Email: {formData.contactEmail}<br />
            Phone: {formData.contactPhone}
          </Typography>
        </Box>
      )}

      {validationErrors.size > 0 && !isSubmitted && (
        <Box mt={2} p={2} bgcolor="error.light" borderRadius={1}>
          <Typography variant="body1" color="error.dark">
            ✗ Please correct the errors above
          </Typography>
        </Box>
      )}
    </Container>
  );
}
