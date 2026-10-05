/**
 * Form Data Factory
 * 
 * Factory functions for creating DeploymentFormData instances with proper defaults.
 * Requirements: 1.1, 4.2-4.4, 5.2, 6.1, 7.1
 */

import type { DeploymentFormData, ChangeItem, ImpactItem } from '../types/models';

/**
 * Generates a unique form ID using timestamp and random component
 * 
 * @returns Unique string identifier for a form
 */
function generateFormId(): string {
  // Combine timestamp with random string to ensure uniqueness
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `form-${timestamp}-${random}`;
}

/**
 * Generates a unique ID for change/impact items
 * 
 * @returns Unique string identifier for an item
 */
function generateItemId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `item-${timestamp}-${random}`;
}

/**
 * Creates a Date object set to tomorrow at the specified time (24-hour format)
 * 
 * @param hours - Hour in 24-hour format (0-23)
 * @param minutes - Minute (0-59)
 * @returns Date object set to tomorrow at the specified time
 */
function createDateTimeTomorrow(hours: number, minutes: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1); // Set to tomorrow
  date.setHours(hours, minutes, 0, 0); // Set hours, minutes, seconds=0, ms=0
  return date;
}

/**
 * Creates a default empty ChangeItem
 * Requirements: 6.1
 * 
 * @returns ChangeItem with empty jiraNumber and description
 */
function createDefaultChangeItem(): ChangeItem {
  return {
    id: generateItemId(),
    jiraNumber: '',
    description: '',
    // Impact items are optional children; a new change starts with none
    impactItems: []
  };
}

/**
 * Creates a default empty ImpactItem
 * Requirements: 7.1
 * 
 * @returns ImpactItem with empty text
 */
function createDefaultImpactItem(): ImpactItem {
  return {
    id: generateItemId(),
    text: ''
  };
}

/**
 * Creates a default DeploymentFormData instance with creation-time defaults
 * 
 * Default values per requirements:
 * - deployment date: tomorrow
 * - start time: 20:00 (8:00 PM)
 * - end time: 22:00 (10:00 PM)
 * - hasOutage: false
 * - no Change_Item entries (the user adds the first via "Add Change Item")
 * - no application/environment selected
 * - all text fields empty
 * 
 * Requirements: 1.1, 4.2-4.4, 5.2, 6.1, 7.1
 * 
 * @returns DeploymentFormData with default values
 */
export function createDefaultForm(): DeploymentFormData {
  return {
    // Identification
    formId: generateFormId(),
    
    // Application Selection (no default selection)
    application: null,
    
    // Deployment Information (all empty, no defaults)
    changeNumber: '',
    releaseVersion: '',
    environment: null,

    // Schedule (default: tomorrow at 20:00-22:00)
    startDateTime: createDateTimeTomorrow(20, 0), // 20:00 = 8:00 PM
    endDateTime: createDateTimeTomorrow(22, 0),   // 22:00 = 10:00 PM
    
    // Outage Information (default: no outage)
    hasOutage: false,
    
    // Change Items (default: none; a card is only added when the user clicks "Add Change Item")
    changeItems: [],
    
    // Contact Information (all empty)
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  };
}

/**
 * Creates a new empty ChangeItem for adding to a form
 * Requirements: 6.1
 * 
 * @returns New ChangeItem with unique ID and empty fields
 */
export function createNewChangeItem(): ChangeItem {
  return createDefaultChangeItem();
}

/**
 * Creates a new empty ImpactItem for adding to a form
 * Requirements: 7.1
 * 
 * @returns New ImpactItem with unique ID and empty text
 */
export function createNewImpactItem(): ImpactItem {
  return createDefaultImpactItem();
}
