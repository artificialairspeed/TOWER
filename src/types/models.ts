/**
 * Type definitions for TOWER — Takeoff Notifications for Technology Deployments
 *
 * This file contains all core data models, interfaces, and constants
 * used throughout the application.
 */

// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * Environment represents the deployment target environment
 */
export type Environment = 'PROD' | 'QA' | 'ITEST' | 'DEV';

// ============================================================================
// Application Model
// ============================================================================

/**
 * Application represents a deployable application in the catalog
 */
export interface Application {
  /** Unique identifier for the application */
  id: string;
  /** Display name of the application */
  name: string;
}

/**
 * Application catalog containing all selectable applications
 * Requirements: 2.1, 2.7
 */
export const APPLICATION_CATALOG: Application[] = [
  {
    id: 'oqs-scheduling',
    name: 'OQS Scheduling'
  },
  {
    id: 'oqs-recordkeeping',
    name: 'OQS Recordkeeping'
  },
  {
    id: 'oqs-simlog',
    name: 'OQS SimLog'
  },
  {
    id: 'line-check-solver',
    name: 'Line Check Solver'
  },
  {
    id: 'trio',
    name: 'TRIO'
  },
  {
    id: 'rosa',
    name: 'ROSA'
  },
  {
    id: 'idcat',
    name: 'IDCAT'
  },
  {
    id: 'spt',
    name: 'SPT'
  },
  {
    id: 'other',
    name: 'Other'
  }
];

// ============================================================================
// Change and Impact Items
// ============================================================================

/**
 * ImpactItem represents a single deployment impact entry.
 *
 * Impact items are children of a ChangeItem: an impact statement only exists
 * in the context of a parent change. Adding impact items to a change is
 * optional (a change may carry zero impact items).
 *
 * Requirements: 7.1, 7.3, 7.4
 */
export interface ImpactItem {
  /** Unique identifier for the impact item */
  id: string;
  /** Impact description text (max 500 characters) */
  text: string; // 1-500 chars
}

/**
 * ChangeItem represents a single Jira change entry.
 *
 * Each change item owns a list of child impact items (its deployment impact
 * statements). The list may be empty — attaching impacts is optional.
 *
 * Requirements: 6.1, 6.2, 7.1
 */
export interface ChangeItem {
  /** Unique identifier for the change item */
  id: string;
  /** Jira ticket number (max 50 characters) */
  jiraNumber: string; // 1-50 chars
  /** Description or title of the change (max 500 characters) */
  description: string; // 1-500 chars
  /** Child impact items for this change (0-100 items, optional) */
  impactItems: ImpactItem[];
}

// ============================================================================
// Deployment Form Data Model
// ============================================================================

/**
 * DeploymentFormData represents all data for a single deployment form
 * Requirements: 2.1, 3.1-3.3, 4.1-4.4, 5.1-5.2, 6.1-6.2, 7.1-7.2, 8.1
 */
export interface DeploymentFormData {
  // ===== Identification =====
  /** Unique identifier for this form instance */
  formId: string;
  
  // ===== Application Selection =====
  /** Selected application (null if not yet selected) */
  application: Application | null;
  
  // ===== Deployment Information =====
  /** Change number digits only, up to 8 digits (CHG prefix is added at display time, required)
   * Example: 12345 (rendered as CHG12345)
   */
  changeNumber: string; // up to 8 digits
  
  /** Release version string in YYYY.#.# format (max 8 characters, required)
   * Example: 2025.4.1
   */
  releaseVersion: string; // YYYY.#.# format, max 8 chars
  
  /** Target deployment environment (required) */
  environment: Environment | null;
  
  // ===== Schedule =====
  /** Deployment start date/time (required, default: today at 20:00) */
  startDateTime: Date;
  
  /** Deployment end date/time (required, default: today at 22:00) */
  endDateTime: Date;
  
  // ===== Outage Information =====
  /** Whether this deployment includes an outage (default: false) */
  hasOutage: boolean;
  
  // ===== Change Items =====
  /** List of Jira change items. Each change item owns its own impact items. */
  changeItems: ChangeItem[];
  
  // ===== Contact Information =====
  /** Contact person's name (max 255 characters, required) */
  contactName: string; // max 255 chars
  
  /** Contact person's email (max 255 characters, required, format: standard email) */
  contactEmail: string; // max 255 chars, format: email
  
  /** Contact person's phone (max 255 characters, optional; when provided, format: (###) ###-####). Empty string means not provided. */
  contactPhone: string; // max 255 chars, optional, format: (###) ###-####
}

// ============================================================================
// Validation Models
// ============================================================================

/**
 * ValidationError represents a single validation failure
 * Requirements: 3.5, 4.6, 4.7, 5.6, 6.2-6.6, 7.3-7.7, 8.2-8.5
 */
export interface ValidationError {
  /** ID of the form containing the error */
  formId: string;
  /** Name of the field that failed validation */
  field: string;
  /** Human-readable error message */
  message: string;
}

/**
 * ValidationResult represents the outcome of validation
 * Requirements: 10.2, 10.3
 */
export interface ValidationResult {
  /** Whether validation passed (true) or failed (false) */
  isValid: boolean;
  /** Array of validation errors (empty if isValid is true) */
  errors: ValidationError[];
}

// ============================================================================
// Generation and Artifact Models
// ============================================================================

/**
 * GenerationError represents a failure during artifact generation
 */
export interface GenerationError {
  /** ID of the form where generation failed */
  formId: string;
  /** Type of artifact that failed to generate */
  artifactType: 'PNG';
  /** Error message describing the failure */
  message: string;
  /** Original error object (if available) */
  error?: Error;
}

/**
 * ArtifactBundle represents the generated artifact input for a deployment form
 *
 * Contains the generated HTML content and the base file name used for delivery.
 *
 * Requirements: 10.4, 11.1, 11.2, 11.3, 12.4
 */
export interface ArtifactBundle {
  /** ID of the form this bundle was generated from */
  formId: string;
  /** Generated HTML content */
  htmlContent: string;
  /** Base file name for all artifacts (without extension) */
  fileName: string;
  /** Original form data (for reference) */
  formData: DeploymentFormData;
}

/**
 * DeliveryResult represents the outcome of artifact delivery
 *
 * Tracks the successful delivery and any failure for the single generated
 * artifact.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */
export interface DeliveryResult {
  /** Total number of artifacts that should have been delivered */
  total: number;
  /** Number of artifacts successfully delivered */
  successful: number;
  /** Number of artifacts that failed to deliver */
  failed: number;
  /** Array of errors encountered during delivery */
  errors: GenerationError[];
  /** Whether any HTML tabs were blocked by popup blocker */
  popupBlocked: boolean;
}
