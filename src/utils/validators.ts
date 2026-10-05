/**
 * Field-level validation functions for deployment form inputs.
 * 
 * Requirements:
 * - 3.4: Trim whitespace from Change Number and Release Version
 * - 8.2: Validate email format
 * - 8.3: Validate phone format (###) ###-####
 */

/**
 * Shared validation messages.
 *
 * The blur-time validator (validateFieldOnBlur) and the submit-time validator
 * (validateForm) must report the same wording for the same rule, so each
 * message lives here exactly once.
 *
 * Note: ValidationErrorSummary pattern-matches on the phrases 'is required'
 * and 'Please select' to collapse them into "This field is required". Those
 * two phrasings must not change.
 */
const MESSAGES = {
  emailFormat: 'Please enter a valid email address (example@domain.com)',
  phoneFormat: 'Phone must be exactly 10 digits in format (###) ###-####',
  changeNumberFormat: 'Change Number must be up to 8 digits',
  releaseVersionFormat: 'Release Version must be in format YYYY.#.# (e.g. 2025.4.1)',
  maxLength: (label: string, max: number) => `${label} must not exceed ${max} characters`
} as const;

/** Maximum length shared by every free-text contact field. */
const MAX_TEXT_LENGTH = 255;

/** Change number: 1-8 digits, no CHG prefix (the prefix is a display adornment). */
const CHANGE_NUMBER_PATTERN = /^\d{1,8}$/;

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
 * Validates release version format.
 * Expected format: YYYY.#.# (4-digit year, single-digit minor, single-digit patch)
 *
 * @param releaseVersion - Release version to validate
 * @returns true if it matches the required format, false otherwise
 *
 * @example
 * isValidReleaseVersion('2025.4.1') // true
 * isValidReleaseVersion('2025.4')   // false
 */
export function isValidReleaseVersion(releaseVersion: string): boolean {
  const releaseVersionRegex = /^\d{4}\.\d\.\d$/;
  return releaseVersionRegex.test(releaseVersion);
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
      if (!isWithinLength(value, MAX_TEXT_LENGTH)) {
        return MESSAGES.maxLength('Email', MAX_TEXT_LENGTH);
      }
      if (!isValidEmail(trimmed)) {
        return MESSAGES.emailFormat;
      }
      return undefined;

    case 'contactPhone':
      if (!isWithinLength(value, MAX_TEXT_LENGTH)) {
        return MESSAGES.maxLength('Phone', MAX_TEXT_LENGTH);
      }
      if (!isValidPhone(value)) {
        return MESSAGES.phoneFormat;
      }
      return undefined;

    case 'contactName':
      if (!isWithinLength(value, MAX_TEXT_LENGTH)) {
        return MESSAGES.maxLength('Contact Name', MAX_TEXT_LENGTH);
      }
      return undefined;

    case 'changeNumber':
      if (!CHANGE_NUMBER_PATTERN.test(trimmed)) {
        return MESSAGES.changeNumberFormat;
      }
      return undefined;

    case 'releaseVersion':
      if (!isValidReleaseVersion(trimmed)) {
        return MESSAGES.releaseVersionFormat;
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
 * - List count constraints (Change Items: 1-999; Impact Items: 0-100 per change item)
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
  } else if (!CHANGE_NUMBER_PATTERN.test(data.changeNumber.trim())) {
    errors.push({
      formId: data.formId,
      field: 'changeNumber',
      message: MESSAGES.changeNumberFormat
    });
  }

  if (!isNonEmpty(data.releaseVersion)) {
    errors.push({
      formId: data.formId,
      field: 'releaseVersion',
      message: 'Release Version is required'
    });
  } else if (!isValidReleaseVersion(data.releaseVersion.trim())) {
    errors.push({
      formId: data.formId,
      field: 'releaseVersion',
      message: MESSAGES.releaseVersionFormat
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
        message: `Change Item ${index + 1}: ${MESSAGES.maxLength('Jira Number', 50)}`
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
        message: `Change Item ${index + 1}: ${MESSAGES.maxLength('Title/Description', 500)}`
      });
    }

    // ===== Impact Items for this Change Item (Requirements 7.3-7.7) =====
    // Impact items are optional children of a change item: zero is valid.
    // Only a per-change-item maximum and per-item content rules apply.
    const impactItems = item.impactItems ?? [];

    if (impactItems.length > 100) {
      errors.push({
        formId: data.formId,
        field: `changeItems[${index}].impactItems`,
        message: `Change Item ${index + 1}: Maximum of 100 Impact Items allowed`
      });
    }

    impactItems.forEach((impact, impactIndex) => {
      if (!isNonEmpty(impact.text)) {
        errors.push({
          formId: data.formId,
          field: `changeItems[${index}].impactItems[${impactIndex}].text`,
          message: `Change Item ${index + 1}, Impact ${impactIndex + 1}: Text is required`
        });
      } else if (!isWithinLength(impact.text, 500)) {
        errors.push({
          formId: data.formId,
          field: `changeItems[${index}].impactItems[${impactIndex}].text`,
          message: `Change Item ${index + 1}, Impact ${impactIndex + 1}: ${MESSAGES.maxLength('Text', 500)}`
        });
      }
    });
  });

  // ===== Contact Information (Requirements 8.1-8.5) =====
  if (!isNonEmpty(data.contactName)) {
    errors.push({
      formId: data.formId,
      field: 'contactName',
      message: 'Contact Name is required'
    });
  } else if (!isWithinLength(data.contactName, MAX_TEXT_LENGTH)) {
    errors.push({
      formId: data.formId,
      field: 'contactName',
      message: MESSAGES.maxLength('Contact Name', MAX_TEXT_LENGTH)
    });
  }

  if (!isNonEmpty(data.contactEmail)) {
    errors.push({
      formId: data.formId,
      field: 'contactEmail',
      message: 'Email is required'
    });
  } else if (!isWithinLength(data.contactEmail, MAX_TEXT_LENGTH)) {
    errors.push({
      formId: data.formId,
      field: 'contactEmail',
      message: MESSAGES.maxLength('Email', MAX_TEXT_LENGTH)
    });
  } else if (!isValidEmail(data.contactEmail)) {
    errors.push({
      formId: data.formId,
      field: 'contactEmail',
      message: MESSAGES.emailFormat
    });
  }

  // Phone is optional. Only validate length/format when a value was provided.
  if (isNonEmpty(data.contactPhone)) {
    if (!isWithinLength(data.contactPhone, MAX_TEXT_LENGTH)) {
      errors.push({
        formId: data.formId,
        field: 'contactPhone',
        message: MESSAGES.maxLength('Phone', MAX_TEXT_LENGTH)
      });
    } else if (!isValidPhone(data.contactPhone)) {
      errors.push({
        formId: data.formId,
        field: 'contactPhone',
        message: MESSAGES.phoneFormat
      });
    }
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// Generation Validation
// ============================================================================

/**
 * Validates the deployment form before generation.
 *
 * This function serves as the gate for output generation. It performs:
 * 1. Application catalog check (catalog must be non-empty)
 * 2. Form field validation using validateForm
 *
 * An empty error array indicates that the form is ready to generate outputs.
 *
 * @param form - Deployment form to validate
 * @param catalogEmpty - Whether the application catalog is empty
 * @returns ValidationResult with form errors and session-level checks
 *
 * Requirements: 2.3, 2.8, 10.2, 10.3
 */
export function validateForGeneration(
  form: DeploymentFormData,
  catalogEmpty: boolean
): ValidationResult {
  const errors: ValidationError[] = [];

  // ===== Application Catalog Check (Requirements 2.8) =====
  if (catalogEmpty) {
    errors.push({
      formId: '_session',
      field: 'applicationCatalog',
      message: 'No applications are available. Cannot generate outputs without an application catalog.'
    });
  }

  // ===== Validate the Form (Requirements 10.2, 10.3) =====
  const formValidation = validateForm(form);
  if (!formValidation.isValid) {
    errors.push(...formValidation.errors);
  }

  // Return validation result. Empty error array means generation may proceed.
  return {
    isValid: errors.length === 0,
    errors
  };
}
