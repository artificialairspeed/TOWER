/**
 * ContactSection Component
 * 
 * Provides input controls for contact information:
 * - Contact Name (max 255 chars, required)
 * - Email (max 255 chars, required, format validation)
 * - Phone (max 255 chars, optional; when provided, normalized to (###) ###-####)
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
            helperText={
              contactNameError ? <span id="contact-name-error">{contactNameError}</span> : undefined
            }
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
          {!contactNameError && (
            <span id="contact-name-help" className="sr-only">
              Enter the name of the person to contact about this deployment
            </span>
          )}
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
            helperText={
              contactEmailError ? (
                <span id="contact-email-error">{contactEmailError}</span>
              ) : undefined
            }
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
          {!contactEmailError && (
            <span id="contact-email-help" className="sr-only">
              Enter the contact email address, for example name@example.com
            </span>
          )}
        </Box>

        {/* Phone Input - Requirements: 8.1, 8.4 */}
        {/* Optional field. Input is normalized to at most 10 digits as the user
            types, then reformatted to (###) ###-#### on blur. */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' } }}>
          <TextField
            fullWidth
            type="tel"
            label="Phone"
            value={contactPhone}
            onChange={(e) => {
              // Normalize to digits rather than rejecting non-digit input. The
              // onBlur handler rewrites the value to "(555) 123-4567", so a
              // digits-only guard would reject every subsequent edit of an
              // already-formatted number.
              const digitsOnly = e.target.value.replace(/\D/g, '');

              if (digitsOnly.length <= 10) {
                onContactPhoneChange(digitsOnly);
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
            helperText={
              contactPhoneError ? (
                <span id="contact-phone-error">{contactPhoneError}</span>
              ) : undefined
            }
            slotProps={{
              htmlInput: {
                // Wide enough to hold the formatted "(555) 123-4567" value so
                // the field stays editable after onBlur reformats it.
                maxLength: 14,
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
          {!contactPhoneError && (
            <span id="contact-phone-help" className="sr-only">
              Optional. Enter 10 digits; the number is reformatted as (555) 123-4567 when you leave
              the field.
            </span>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// Wrap component with React.memo to prevent re-renders (22.2: Performance optimization)
export const ContactSection = React.memo(ContactSectionComponent);
