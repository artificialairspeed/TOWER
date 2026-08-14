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
 * Creates a Date object set to today at the specified time (24-hour format)
 * 
 * @param hours - Hour in 24-hour format (0-23)
 * @param minutes - Minute (0-59)
 * @returns Date object set to today at the specified time
 */
function createTimeToday(hours: number, minutes: number = 0): Date {
  const date = new Date();
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
    description: ''
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
 * - deployment date: today
 * - start time: 20:00 (8:00 PM)
 * - end time: 22:00 (10:00 PM)
 * - hasOutage: false
 * - one empty Change_Item
 * - one empty Impact_Item
 * - no application/environment selected
 * - all text fields empty
 * 
 * Requirements: 1.1, 4.2-4.4, 5.2, 6.1, 7.1
 * 
 * @returns DeploymentFormData with default values
 */
export function createDefaultForm(): DeploymentFormData {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to midnight for date comparison
  
  return {
    // Identification
    formId: generateFormId(),
    
    // Application Selection (no default selection)
    application: null,
    
    // Deployment Information (all empty, no defaults)
    changeNumber: '',
    releaseVersion: '',
    environment: null,
    deploymentTitle: '', // Computed, starts empty
    
    // Schedule (default: today at 20:00-22:00)
    deploymentDate: today,
    startTime: createTimeToday(20, 0), // 20:00 = 8:00 PM
    endTime: createTimeToday(22, 0),   // 22:00 = 10:00 PM
    
    // Outage Information (default: no outage)
    hasOutage: false,
    outageStartDate: null,
    outageStartTime: null,
    outageEndDate: null,
    outageEndTime: null,
    
    // Change Items (default: one empty item)
    changeItems: [createDefaultChangeItem()],
    
    // Impact Items (default: one empty item)
    impactItems: [createDefaultImpactItem()],
    
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
