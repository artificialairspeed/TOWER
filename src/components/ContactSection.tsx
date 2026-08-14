/**
 * ContactSection Component
 * 
 * Provides input controls for contact information:
 * - Contact Name (max 255 chars, required)
 * - Email (max 255 chars, required, format validation)
 * - Phone (max 255 chars, required, any format; normalized to (###) ###-####)
 * - Display format errors adjacent to fields
 * - Display required errors adjacent to fields
 * - Preserve entered values when validation fails
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import { formatPhoneNumber } from '../utils/formatters';

export interface ContactSectionProps {
  /** Current contact name value */
  contactName: string;
  /** Current contact email value */
  contactEmail: string;
  /** Current contact phone value */
  contactPhone: string;
  /** Callback when contact name changes */
  onContactNameChange: (value: string) => void;
  /** Callback when contact email changes */
  onContactEmailChange: (value: string) => void;
  /** Callback when contact phone changes */
  onContactPhoneChange: (value: string) => void;
  /** Validation error for contact name field */
  contactNameError?: string;
  /** Validation error for contact email field */
  contactEmailError?: string;
  /** Validation error for contact phone field */
  contactPhoneError?: string;
  /** Callback for onBlur field validation (field, value) */
  onBlurValidate?: (field: string, value: string) => void;
}

/**
 * ContactSection component for entering contact information
 * 
 * Performance optimization:
 * - Wrapped with React.memo to prevent re-renders when parent changes (22.2)
 */
function ContactSectionComponent({
  contactName,
  contactEmail,
  contactPhone,
  onContactNameChange,
  onContactEmailChange,
  onContactPhoneChange,
  contactNameError,
  contactEmailError,
  contactPhoneError,
  onBlurValidate
}: ContactSectionProps) {
  return (
    <Box sx={{ mb: 3 }} component="section" aria-labelledby="contact-heading">
      <Typography variant="h6" gutterBottom id="contact-heading">
        Contact Information
      </Typography>

      {/* All 3 fields on same row */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'flex-start' }}>
        {/* Contact Name Input - Requirements: 8.1, 8.4 */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>
          <TextField
            fullWidth
            required
            label="Contact Name"
            value={contactName}
            onChange={(e) => onContactNameChange(e.target.value)}
            onBlur={() => onBlurValidate?.('contactName', contactName)}
            error={!!contactNameError}
            slotProps={{
              htmlInput: {
                maxLength: 255,
                'aria-label': 'Contact name',
                'aria-describedby': contactNameError ? 'contact-name-error' : 'contact-name-help',
                'aria-invalid': !!contactNameError
              },
              inputLabel: {
                shrink: true
              }
            }}
          />
        </Box>

        {/* Email Input - Requirements: 8.1, 8.2, 8.4 */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>
          <TextField
            fullWidth
            required
            type="email"
            label="Email"
            value={contactEmail}
            onChange={(e) => onContactEmailChange(e.target.value)}
            onBlur={() => onBlurValidate?.('contactEmail', contactEmail)}
            error={!!contactEmailError}
            slotProps={{
              htmlInput: {
                maxLength: 255,
                'aria-label': 'Contact email address',
                'aria-describedby': contactEmailError ? 'contact-email-error' : 'contact-email-help',
                'aria-invalid': !!contactEmailError
              },
              inputLabel: {
                shrink: true
              }
            }}
          />
        </Box>

        {/* Phone Input - Requirements: 8.1, 8.4 */}
        {/* Only allows 10-digit phone numbers, accepts numerics only on input */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>
          <TextField
            fullWidth
            required
            type="tel"
            label="Phone"
            value={contactPhone}
            onChange={(e) => {
              // Only allow digits
              const input = e.target.value;
              const digitsOnly = input.replace(/\D/g, '');
              
              // Accept only if input is digits and at most 10 digits
              if (digitsOnly.length <= 10 && digitsOnly === input) {
                onContactPhoneChange(input);
              }
            }}
            onBlur={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              if (formatted !== contactPhone) {
                onContactPhoneChange(formatted);
              }
              onBlurValidate?.('contactPhone', formatted);
            }}
            error={!!contactPhoneError}
            slotProps={{
              htmlInput: {
                maxLength: 10,
                placeholder: '5551234567',
                'aria-label': 'Contact phone number',
                'aria-describedby': contactPhoneError ? 'contact-phone-error' : 'contact-phone-help',
                'aria-invalid': !!contactPhoneError
              },
              inputLabel: {
                shrink: true
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const ContactSection = React.memo(ContactSectionComponent);
