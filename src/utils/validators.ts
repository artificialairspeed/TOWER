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
// Single-Field Validation (for onBlur immediate feedback)
// ============================================================================

/**
 * Validates a single field by name and returns an error message, or undefined if valid.
 * Only performs format/length validation — does NOT flag required-but-empty fields,
 * because a user who merely tabs through a field shouldn't see "required" until submit.
 * 
 * For fields where the user has typed something and then blurred, this catches
 * format issues immediately (e.g. bad email format, exceeds max length).
 */
export function validateFieldOnBlur(
  field: string,
  value: string
): string | undefined {
  // Skip validation for empty values — "required" errors only on submit
  const trimmed = trimInput(value);
  if (!trimmed) return undefined;

  switch (field) {
    case 'contactEmail':
      if (!isWithinLength(value, 255)) {
        return 'Email must not exceed 255 characters';
      }
      if (!isValidEmail(trimmed)) {
        return 'Please enter a valid email address (example@domain.com)';
      }
      return undefined;

    case 'contactPhone':
      if (!isWithinLength(value, 255)) {
        return 'Phone must not exceed 255 characters';
      }
      if (value && !isValidPhone(value)) {
        return 'Phone must be exactly 10 digits in format (###) ###-####';
      }
      return undefined;

    case 'contactName':
      if (!isWithinLength(value, 255)) {
        return 'Contact Name must not exceed 255 characters';
      }
      return undefined;

    case 'changeNumber':
      if (!isWithinLength(value, 20)) {
        return 'Change Number must not exceed 20 characters';
      }
      return undefined;

    case 'releaseVersion':
      if (!isWithinLength(value, 50)) {
        return 'Release Version must not exceed 50 characters';
      }
      return undefined;

    default:
      return undefined;
  }
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
  if (!data.startDateTime) {
    errors.push({
      formId: data.formId,
      field: 'startDateTime',
      message: 'Deployment Start is required'
    });
  }

  if (!data.endDateTime) {
    errors.push({
      formId: data.formId,
      field: 'endDateTime',
      message: 'Deployment End is required'
    });
  }

  // Validate time ordering: End must be later than Start
  // Requirements 4.6
  if (data.startDateTime && data.endDateTime) {
    if (data.endDateTime <= data.startDateTime) {
      errors.push({
        formId: data.formId,
        field: 'endDateTime',
        message: 'Deployment End must be later than Deployment Start'
      });
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
  } else if (!isValidPhone(data.contactPhone)) {
    errors.push({
      formId: data.formId,
      field: 'contactPhone',
      message: 'Phone must be exactly 10 digits in format (###) ###-####'
    });
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors
  };
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
