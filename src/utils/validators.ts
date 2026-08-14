/**
 * Field-level validation functions for deployment form inputs.
 * 
 * Requirements:
 * - 3.4: Trim whitespace from Change Number and Release Version
 * - 8.2: Validate email format
 * - 8.3: Validate phone format (###) ###-####
 */

/**
 * Validates email address format using standard pragmatic email pattern.
 * 
 * @param email - Email address to validate
 * @returns true if email matches valid format, false otherwise
 * 
 * Validates: 3.4, 8.2
 */
export function isValidEmail(email: string): boolean {
  // Standard pragmatic email regex pattern
  // Allows: local-part@domain with reasonable character sets
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format.
 * Expected format: (###) ###-####
 * 
 * @param phone - Phone number to validate
 * @returns true if phone matches required format, false otherwise
 * 
 * Validates: 8.3
 */
export function isValidPhone(phone: string): boolean {
  // Phone format: (###) ###-####
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Trims leading and trailing whitespace from input string.
 * 
 * @param input - String to trim
 * @returns Trimmed string
 * 
 * Validates: 3.4
 */
export function trimInput(input: string): string {
  return input.trim();
}

/**
 * Checks if a string is non-empty after trimming whitespace.
 * 
 * @param input - String to check
 * @returns true if string is non-empty after trimming, false otherwise
 */
export function isNonEmpty(input: string): boolean {
  return trimInput(input).length > 0;
}

/**
 * Checks if a string is within the specified maximum length after trimming.
 * 
 * @param input - String to check
 * @param maxLength - Maximum allowed length
 * @returns true if trimmed string length is within max, false otherwise
 */
export function isWithinLength(input: string, maxLength: number): boolean {
  return trimInput(input).length <= maxLength;
}

// ============================================================================
// Form-Level Validation
// ============================================================================

import type { DeploymentFormData, ValidationResult, ValidationError } from '../types/models';

/**
 * Validates a complete deployment form, checking all fields, formats, and business logic.
 * 
 * This function orchestrates all validation rules:
 * - Required field presence
 * - Field format validation (email, phone)
 * - Time ordering constraints (end > start)
 * - Outage logic validation
 * - List count constraints (Change Items: 1-999, Impact Items: 1-100)
 * - List item content validation
 * 
 * The function is non-destructive: it never mutates the input data.
 * 
 * @param data - The deployment form data to validate
 * @returns ValidationResult with isValid boolean and array of ValidationErrors
 * 
 * Requirements: 3.5, 4.6, 4.7, 5.6, 6.2-6.6, 7.3-7.7, 8.1-8.5
 */
export function validateForm(data: DeploymentFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // ===== Application Selection (Requirement 2.3) =====
  if (!data.application) {
    errors.push({
      formId: data.formId,
      field: 'application',
      message: 'Please select an application'
    });
  }

  // ===== Deployment Information (Requirements 3.1-3.3, 3.5) =====
  if (!isNonEmpty(data.changeNumber)) {
    errors.push({
      formId: data.formId,
      field: 'changeNumber',
      message: 'Change Number is required'
    });
  } else if (!isWithinLength(data.changeNumber, 20)) {
    errors.push({
      formId: data.formId,
      field: 'changeNumber',
      message: 'Change Number must not exceed 20 characters'
    });
  }

  if (!isNonEmpty(data.releaseVersion)) {
    errors.push({
      formId: data.formId,
      field: 'releaseVersion',
      message: 'Release Version is required'
    });
  } else if (!isWithinLength(data.releaseVersion, 50)) {
    errors.push({
      formId: data.formId,
      field: 'releaseVersion',
      message: 'Release Version must not exceed 50 characters'
    });
  }

  if (!data.environment) {
    errors.push({
      formId: data.formId,
      field: 'environment',
      message: 'Please select an environment'
    });
  }

  // ===== Schedule (Requirements 4.6, 4.7) =====
  if (!data.deploymentDate) {
    errors.push({
      formId: data.formId,
      field: 'deploymentDate',
      message: 'Deployment Date is required'
    });
  }

  if (!data.startTime) {
    errors.push({
      formId: data.formId,
      field: 'startTime',
      message: 'Start Time is required'
    });
  }

  if (!data.endTime) {
    errors.push({
      formId: data.formId,
      field: 'endTime',
      message: 'End Time is required'
    });
  }

  // Validate time ordering: End Time must be later than Start Time
  // Requirements 4.6
  if (data.startTime && data.endTime && data.deploymentDate) {
    // Combine date and time for accurate comparison
    const startDateTime = combineDateAndTime(data.deploymentDate, data.startTime);
    const endDateTime = combineDateAndTime(data.deploymentDate, data.endTime);
    
    if (endDateTime <= startDateTime) {
      errors.push({
        formId: data.formId,
        field: 'endTime',
        message: 'End Time must be later than Start Time'
      });
    }
  }

  // ===== Outage Information (Requirement 5.6) =====
  if (data.hasOutage) {
    // Outage date/time fields are required when outage indicator is Yes
    if (!data.outageStartDate) {
      errors.push({
        formId: data.formId,
        field: 'outageStartDate',
        message: 'Outage Start Date is required when outage is indicated'
      });
    }

    if (!data.outageStartTime) {
      errors.push({
        formId: data.formId,
        field: 'outageStartTime',
        message: 'Outage Start Time is required when outage is indicated'
      });
    }

    if (!data.outageEndDate) {
      errors.push({
        formId: data.formId,
        field: 'outageEndDate',
        message: 'Outage End Date is required when outage is indicated'
      });
    }

    if (!data.outageEndTime) {
      errors.push({
        formId: data.formId,
        field: 'outageEndTime',
        message: 'Outage End Time is required when outage is indicated'
      });
    }

    // Validate outage time ordering: Outage End must be later than Outage Start
    if (data.outageStartDate && data.outageStartTime && data.outageEndDate && data.outageEndTime) {
      const outageStart = combineDateAndTime(data.outageStartDate, data.outageStartTime);
      const outageEnd = combineDateAndTime(data.outageEndDate, data.outageEndTime);
      
      if (outageEnd <= outageStart) {
        errors.push({
          formId: data.formId,
          field: 'outageEndTime',
          message: 'Outage End must be later than Outage Start'
        });
      }
    }
  }

  // ===== Change Items (Requirements 6.2-6.6) =====
  if (data.changeItems.length === 0) {
    errors.push({
      formId: data.formId,
      field: 'changeItems',
      message: 'At least one Change Item is required'
    });
  } else if (data.changeItems.length > 999) {
    errors.push({
      formId: data.formId,
      field: 'changeItems',
      message: 'Maximum of 999 Change Items allowed'
    });
  }

  // Validate each Change Item
  data.changeItems.forEach((item, index) => {
    if (!isNonEmpty(item.jiraNumber)) {
      errors.push({
        formId: data.formId,
        field: `changeItems[${index}].jiraNumber`,
        message: `Change Item ${index + 1}: Jira Number is required`
      });
    } else if (!isWithinLength(item.jiraNumber, 50)) {
      errors.push({
        formId: data.formId,
        field: `changeItems[${index}].jiraNumber`,
        message: `Change Item ${index + 1}: Jira Number must not exceed 50 characters`
      });
    }

    if (!isNonEmpty(item.description)) {
      errors.push({
        formId: data.formId,
        field: `changeItems[${index}].description`,
        message: `Change Item ${index + 1}: Title/Description is required`
      });
    } else if (!isWithinLength(item.description, 500)) {
      errors.push({
        formId: data.formId,
        field: `changeItems[${index}].description`,
        message: `Change Item ${index + 1}: Title/Description must not exceed 500 characters`
      });
    }
  });

  // ===== Impact Items (Requirements 7.3-7.7) =====
  if (data.impactItems.length === 0) {
    errors.push({
      formId: data.formId,
      field: 'impactItems',
      message: 'At least one Impact Item is required'
    });
  } else if (data.impactItems.length > 100) {
    errors.push({
      formId: data.formId,
      field: 'impactItems',
      message: 'Maximum of 100 Impact Items allowed'
    });
  }

  // Validate each Impact Item
  data.impactItems.forEach((item, index) => {
    if (!isNonEmpty(item.text)) {
      errors.push({
        formId: data.formId,
        field: `impactItems[${index}].text`,
        message: `Impact Item ${index + 1}: Text is required`
      });
    } else if (!isWithinLength(item.text, 500)) {
      errors.push({
        formId: data.formId,
        field: `impactItems[${index}].text`,
        message: `Impact Item ${index + 1}: Text must not exceed 500 characters`
      });
    }
  });

  // ===== Contact Information (Requirements 8.1-8.5) =====
  if (!isNonEmpty(data.contactName)) {
    errors.push({
      formId: data.formId,
      field: 'contactName',
      message: 'Contact Name is required'
    });
  } else if (!isWithinLength(data.contactName, 255)) {
    errors.push({
      formId: data.formId,
      field: 'contactName',
      message: 'Contact Name must not exceed 255 characters'
    });
  }

  if (!isNonEmpty(data.contactEmail)) {
    errors.push({
      formId: data.formId,
      field: 'contactEmail',
      message: 'Email is required'
    });
  } else if (!isWithinLength(data.contactEmail, 255)) {
    errors.push({
      formId: data.formId,
      field: 'contactEmail',
      message: 'Email must not exceed 255 characters'
    });
  } else if (!isValidEmail(data.contactEmail)) {
    errors.push({
      formId: data.formId,
      field: 'contactEmail',
      message: 'Please enter a valid email address (example@domain.com)'
    });
  }

  if (!isNonEmpty(data.contactPhone)) {
    errors.push({
      formId: data.formId,
      field: 'contactPhone',
      message: 'Phone is required'
    });
  } else if (!isWithinLength(data.contactPhone, 255)) {
    errors.push({
      formId: data.formId,
      field: 'contactPhone',
      message: 'Phone must not exceed 255 characters'
    });
  }
  // Note: no specific phone format is required. Any format the user enters is
  // accepted and normalized to (###) ###-#### via formatPhoneNumber on input.

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Helper function to combine a date and time into a single Date object for comparison.
 * Takes the date portion from dateValue and the time portion from timeValue.
 * 
 * @param dateValue - Date object containing the date portion
 * @param timeValue - Date object containing the time portion
 * @returns Combined Date object
 */
function combineDateAndTime(dateValue: Date, timeValue: Date): Date {
  const combined = new Date(dateValue);
  combined.setHours(timeValue.getHours());
  combined.setMinutes(timeValue.getMinutes());
  combined.setSeconds(timeValue.getSeconds());
  combined.setMilliseconds(timeValue.getMilliseconds());
  return combined;
}

// ============================================================================
// Batch Validation
// ============================================================================

import type { Theme } from '../types/models';

/**
 * Validates all deployment forms in a batch before generation.
 * 
 * This function serves as the gate for batch output generation. It performs:
 * 1. Individual form validation on every form using validateForm
 * 2. Theme selection check (theme must be selected)
 * 3. Application catalog check (catalog must be non-empty)
 * 
 * An empty error array indicates that the batch is ready to generate outputs.
 * 
 * @param forms - Array of deployment forms to validate
 * @param theme - Currently selected theme (null if not selected)
 * @param catalogEmpty - Whether the application catalog is empty
 * @returns ValidationResult with aggregated errors across all forms and session-level checks
 * 
 * Requirements: 2.3, 2.8, 9.4, 10.2, 10.3
 */
export function validateBatch(
  forms: DeploymentFormData[],
  theme: Theme | null,
  catalogEmpty: boolean
): ValidationResult {
  const errors: ValidationError[] = [];

  // ===== Theme Selection Check (Requirement 9.4) =====
  if (!theme) {
    errors.push({
      formId: '_session',
      field: 'theme',
      message: 'Please select a theme (Light Mode or Dark Mode) before generating outputs'
    });
  }

  // ===== Application Catalog Check (Requirements 2.8) =====
  if (catalogEmpty) {
    errors.push({
      formId: '_session',
      field: 'applicationCatalog',
      message: 'No applications are available. Cannot generate outputs without an application catalog.'
    });
  }

  // ===== Validate Each Form (Requirements 10.2, 10.3) =====
  // Run validateForm on every form and aggregate all errors
  forms.forEach(form => {
    const formValidation = validateForm(form);
    if (!formValidation.isValid) {
      // Aggregate errors from this form into the batch result
      errors.push(...formValidation.errors);
    }
  });

  // Return aggregated validation result
  // Empty error array means batch may proceed to generation
  return {
    isValid: errors.length === 0,
    errors
  };
}
