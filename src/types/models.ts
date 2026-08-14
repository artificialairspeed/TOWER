/**
 * Type definitions for Deployment Notification Generator Portal
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

/**
 * Theme represents the visual theme for generated artifacts
 */
export type Theme = 'Light Mode' | 'Dark Mode';

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
  /** Header text for notification artifacts */
  notificationHeader: string;
}

/**
 * Application catalog containing all selectable applications
 * Requirements: 2.1, 2.7
 */
export const APPLICATION_CATALOG: Application[] = [
  {
    id: 'oqs-scheduling',
    name: 'OQS Scheduling',
    notificationHeader: 'OQS Scheduling Deployment Notification'
  },
  {
    id: 'oqs-recordkeeping',
    name: 'OQS Recordkeeping',
    notificationHeader: 'OQS Recordkeeping Deployment Notification'
  },
  {
    id: 'oqs-simlog',
    name: 'OQS SimLog',
    notificationHeader: 'OQS SimLog Deployment Notification'
  },
  {
    id: 'line-check-solver',
    name: 'Line Check Solver',
    notificationHeader: 'Line Check Solver Deployment Notification'
  },
  {
    id: 'trio',
    name: 'TRIO',
    notificationHeader: 'TRIO Deployment Notification'
  },
  {
    id: 'rosa',
    name: 'ROSA',
    notificationHeader: 'ROSA Deployment Notification'
  },
  {
    id: 'idcat',
    name: 'IDCAT',
    notificationHeader: 'IDCAT Deployment Notification'
  },
  {
    id: 'spt',
    name: 'SPT',
    notificationHeader: 'SPT Deployment Notification'
  }
];

// ============================================================================
// Change and Impact Items
// ============================================================================

/**
 * ChangeItem represents a single Jira change entry
 * Requirements: 6.1, 6.2
 */
export interface ChangeItem {
  /** Unique identifier for the change item */
  id: string;
  /** Jira ticket number (max 50 characters) */
  jiraNumber: string; // 1-50 chars
  /** Description or title of the change (max 500 characters) */
  description: string; // 1-500 chars
}

/**
 * ImpactItem represents a single deployment impact entry
 * Requirements: 7.1, 7.3, 7.4
 */
export interface ImpactItem {
  /** Unique identifier for the impact item */
  id: string;
  /** Impact description text (max 500 characters) */
  text: string; // 1-500 chars
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
  /** Change number including CHG prefix (max 20 characters, required)
   * Example: CHG12345
   */
  changeNumber: string; // max 20 chars
  
  /** Release version string (max 50 characters, required)
   * Example: v5.4.1
   */
  releaseVersion: string; // max 50 chars
  
  /** Target deployment environment (required) */
  environment: Environment | null;
  
  /** Computed deployment title (read-only, derived from other fields)
   * Format: [CHG#####] — [Application Name: Release Version - Deploy to ENVIRONMENT]
   */
  deploymentTitle: string;
  
  // ===== Schedule =====
  /** Deployment start date/time (required, default: today at 20:00) */
  startDateTime: Date;
  
  /** Deployment end date/time (required, default: today at 22:00) */
  endDateTime: Date;
  
  // ===== Outage Information =====
  /** Whether this deployment includes an outage (default: false) */
  hasOutage: boolean;
  
  /** Outage start date/time (required if hasOutage is true) */
  outageStartDateTime: Date | null;
  
  /** Outage end date/time (required if hasOutage is true) */
  outageEndDateTime: Date | null;
  
  // ===== Change Items =====
  /** List of Jira change items (1-999 items required) */
  changeItems: ChangeItem[];
  
  // ===== Impact Items =====
  /** List of deployment impact items (1-100 items required) */
  impactItems: ImpactItem[];
  
  // ===== Contact Information =====
  /** Contact person's name (max 255 characters, required) */
  contactName: string; // max 255 chars
  
  /** Contact person's email (max 255 characters, required, format: standard email) */
  contactEmail: string; // max 255 chars, format: email
  
  /** Contact person's phone (max 255 characters, required, format: (###) ###-####) */
  contactPhone: string; // max 255 chars, format: (###) ###-####
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
 * Artifact represents a single generated output file
 * Requirements: 10.4-10.7, 11.1-11.3
 */
export interface Artifact {
  /** ID of the form this artifact was generated from */
  formId: string;
  /** Type of artifact (HTML, PDF, or PNG) */
  type: 'HTML' | 'PDF' | 'PNG';
  /** File name for the artifact */
  fileName: string;
  /** Content of the artifact (HTML string for HTML, Blob for PDF/PNG) */
  content: string | Blob;
}

/**
 * GenerationResult represents the outcome of artifact generation
 * Requirements: 10.8, 11.4, 13.3, 13.4
 */
export interface GenerationResult {
  /** Whether generation completed successfully for all artifacts */
  success: boolean;
  /** Array of successfully generated artifacts */
  artifacts: Artifact[];
  /** Array of errors encountered during generation */
  errors: GenerationError[];
}

/**
 * GenerationError represents a failure during artifact generation
 */
export interface GenerationError {
  /** ID of the form where generation failed */
  formId: string;
  /** Type of artifact that failed to generate */
  artifactType: 'HTML' | 'PDF' | 'PNG';
  /** Error message describing the failure */
  message: string;
  /** Original error object (if available) */
  error?: Error;
}

/**
 * ArtifactBundle represents a complete set of artifacts for a single deployment form
 * 
 * Contains the generated HTML content and file names for all three artifact types.
 * Used for sequential delivery orchestration.
 * 
 * Requirements: 10.4, 11.1, 11.2, 11.3, 12.4, 14.1, 14.3
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
 * Tracks successful deliveries and failures during sequential artifact delivery.
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
