/**
 * Formatting utilities for deployment notification generator
 * 
 * This file contains functions for generating titles, headers, and formatted strings
 * used in the deployment notification artifacts.
 */

import { DeploymentFormData, ChangeItem, ImpactItem } from '../types/models';

// ============================================================================
// Phone Formatting
// ============================================================================

/**
 * Normalizes a phone number entered in any format to (###) ###-####.
 *
 * Accepts any input the user types (e.g. "5551234567", "555-123-4567",
 * "555.123.4567", "+1 (555) 123-4567") and reformats it based on the digits
 * it contains:
 * - 10 digits            -> (555) 123-4567
 * - 11 digits leading 1  -> (555) 123-4567 (country code dropped)
 *
 * If the input does not contain a usable 10-digit number, the original value
 * is returned unchanged so nothing the user typed is lost.
 *
 * @param phone - The raw phone value as entered
 * @returns The reformatted phone number, or the original value if it can't be formatted
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return phone;

  const digits = phone.replace(/\D/g, '');

  // Drop a leading US country code if present.
  const local =
    digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;

  if (local.length !== 10) {
    // Not enough (or too many) digits to format confidently; leave as entered.
    return phone;
  }

  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
}

// ============================================================================
// Title Generation Functions
// ============================================================================

/**
 * Generates the deployment title in the required format
 * 
 * Format: [CHG#####] — [Application Name: Release Version - Deploy to ENVIRONMENT]
 * 
 * Returns an empty string if any required component is missing:
 * - Application
 * - Change Number
 * - Release Version
 * - Environment
 * 
 * Requirements: 2.4, 2.5, 3.6
 * 
 * @param data - The deployment form data
 * @returns The formatted deployment title, or empty string if incomplete
 * 
 * @example
 * generateDeploymentTitle({
 *   application: { name: 'Crew Portal', ... },
 *   changeNumber: 'CHG12345',
 *   releaseVersion: 'v5.4.1',
 *   environment: 'PROD',
 *   ...
 * })
 * // Returns: "[CHG12345] — [Crew Portal: v5.4.1 - Deploy to PROD]"
 */
export function generateDeploymentTitle(data: DeploymentFormData): string {
  // Check if all required components are present
  if (!data.application || !data.changeNumber || !data.releaseVersion || !data.environment) {
    return '';
  }
  
  // Extract application name
  const applicationName = data.application.name;
  
  // Build the title in the required format
  return `[${data.changeNumber}] — [${applicationName}: ${data.releaseVersion} - Deploy to ${data.environment}]`;
}

/**
 * Generates the notification header for a given application name
 * 
 * The header follows the pattern: "{Application Name} Deployment Notification"
 * 
 * Requirements: 2.5
 * 
 * @param applicationName - The name of the application
 * @returns The formatted notification header
 * 
 * @example
 * generateNotificationHeader('Crew Portal')
 * // Returns: "Crew Portal Deployment Notification"
 */
export function generateNotificationHeader(applicationName: string): string {
  return `${applicationName} Deployment Notification`;
}

// ============================================================================
// Date and Time Formatting Functions
// ============================================================================

/**
 * Formats a deployment schedule with date and time range
 * 
 * Format: Month DD, YYYY, HH:MM AM/PM–HH:MM AM/PM
 * Example: "March 05, 2025, 08:00 PM–10:00 PM"
 * 
 * If start and end are on the same date, shows one date with time range.
 * If they span different dates, shows full date+time for both.
 * 
 * Uses Intl.DateTimeFormat API for locale-aware date formatting.
 * 
 * Requirements: 4.5
 * 
 * @param startDateTime - The deployment start date/time
 * @param endDateTime - The deployment end date/time
 * @returns The formatted schedule string
 * 
 * @example
 * formatSchedule(
 *   new Date('2025-03-05T20:00:00'),
 *   new Date('2025-03-05T22:00:00')
 * )
 * // Returns: "March 05, 2025, 08:00 PM–10:00 PM"
 */
export function formatSchedule(startDateTime: Date, endDateTime: Date): string {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const startDatePart = dateFormatter.format(startDateTime);
  const startTimePart = timeFormatter.format(startDateTime);
  const endTimePart = timeFormatter.format(endDateTime);

  // Check if same date
  const sameDate =
    startDateTime.getFullYear() === endDateTime.getFullYear() &&
    startDateTime.getMonth() === endDateTime.getMonth() &&
    startDateTime.getDate() === endDateTime.getDate();

  if (sameDate) {
    // Same date: "Month DD, YYYY, HH:MM AM/PM–HH:MM AM/PM"
    return `${startDatePart}, ${startTimePart}–${endTimePart}`;
  }

  // Different dates: "Month DD, YYYY, HH:MM AM/PM–Month DD, YYYY, HH:MM AM/PM"
  const endDatePart = dateFormatter.format(endDateTime);
  return `${startDatePart}, ${startTimePart}–${endDatePart}, ${endTimePart}`;
}

/**
 * Formats a date as an 8-digit YYYYMMDD string
 * 
 * Format: YYYYMMDD
 * Example: "20250305"
 * 
 * Used for file naming where a compact date representation is needed.
 * 
 * Requirements: 12.2
 * 
 * @param date - The date to format
 * @returns The 8-digit date string
 * 
 * @example
 * formatYYYYMMDD(new Date('2025-03-05'))
 * // Returns: "20250305"
 * 
 * formatYYYYMMDD(new Date('2025-12-31'))
 * // Returns: "20251231"
 */
export function formatYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

// ============================================================================
// HTML Escaping and List Rendering Functions
// ============================================================================

/**
 * Escapes HTML special characters in text to prevent XSS attacks
 * 
 * Escapes the following characters:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &#39;
 * 
 * Requirements: 6.7, 7.8 (HTML escaping before injection)
 * 
 * @param text - The text to escape
 * @returns The HTML-escaped text
 * 
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
 */
export function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

/**
 * Renders a list of Change Items as HTML
 * 
 * Each item is formatted as:
 * <div><strong>{escapedJiraNumber}</strong> {escapedDescription}</div>
 * 
 * Each item is wrapped in a <div> to ensure they appear on separate lines.
 * All user text (Jira Number and Description) is HTML-escaped before rendering.
 * 
 * Requirements: 6.7
 * 
 * @param items - Array of Change Items to render
 * @returns HTML string with all change items formatted
 * 
 * @example
 * renderChangeItems([
 *   { id: '1', jiraNumber: 'JIRA-123', description: 'Fix login bug' },
 *   { id: '2', jiraNumber: 'JIRA-456', description: 'Add new feature' }
 * ])
 * // Returns:
 * // "<div><strong>JIRA-123</strong> Fix login bug</div><div><strong>JIRA-456</strong> Add new feature</div>"
 */
export function renderChangeItems(items: ChangeItem[]): string {
  return items
    .map(item => {
      const escapedJiraNumber = escapeHtml(item.jiraNumber);
      const escapedDescription = escapeHtml(item.description);
      return `<div><strong>${escapedJiraNumber}</strong> ${escapedDescription}</div>`;
    })
    .join('');
}

/**
 * Renders a list of Impact Items as an HTML unordered list
 * 
 * Format: <ul><li>{escapedText}</li>...</ul>
 * 
 * The order of items is preserved exactly as provided (insertion order).
 * All user text is HTML-escaped before rendering.
 * 
 * Requirements: 7.8
 * 
 * @param items - Array of Impact Items to render
 * @returns HTML string with unordered list of impact items
 * 
 * @example
 * renderImpactItems([
 *   { id: '1', text: 'System will be unavailable during deployment' },
 *   { id: '2', text: 'Users may experience slower performance' }
 * ])
 * // Returns:
 * // "<ul>\n<li>System will be unavailable during deployment</li>\n<li>Users may experience slower performance</li>\n</ul>"
 */
export function renderImpactItems(items: ImpactItem[]): string {
  const listItems = items
    .map(item => {
      const escapedText = escapeHtml(item.text);
      return `<li>${escapedText}</li>`;
    })
    .join('\n');
  
  return `<ul>\n${listItems}\n</ul>`;
}

/**
 * Renders the outage section for the deployment notification
 * 
 * If hasOutage is false, returns an empty string.
 * If hasOutage is true, formats the outage window as a date/time range.
 * 
 * Format when outage exists:
 * "Outage Window: Month DD, YYYY, HH:MM AM/PM–Month DD, YYYY, HH:MM AM/PM"
 * 
 * All dates and times are HTML-escaped (though date formatting shouldn't produce
 * HTML-special characters, we escape for consistency and safety).
 * 
 * Requirements: 7.8 (outage rendering)
 * 
 * @param hasOutage - Whether the deployment includes an outage
 * @param outageStartDateTime - Start date/time of the outage (required if hasOutage is true)
 * @param outageEndDateTime - End date/time of the outage (required if hasOutage is true)
 * @returns HTML string for the outage section, or empty string if no outage
 * 
 * @example
 * renderOutageSection(
 *   true,
 *   new Date('2025-03-05T20:00:00'),
 *   new Date('2025-03-05T22:00:00')
 * )
 * // Returns: "Outage Window: March 05, 2025, 08:00 PM–March 05, 2025, 10:00 PM"
 * 
 * renderOutageSection(false, null, null)
 * // Returns: ""
 */
export function renderOutageSection(
  hasOutage: boolean,
  outageStartDateTime: Date | null,
  outageEndDateTime: Date | null
): string {
  if (!hasOutage) {
    return '';
  }
  
  // If outage is indicated but dates/times are missing, return empty
  // (validation should catch this, but we handle gracefully)
  if (!outageStartDateTime || !outageEndDateTime) {
    return '';
  }
  
  // Format start date and time
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const startDatePart = dateFormatter.format(outageStartDateTime);
  const startTimePart = timeFormatter.format(outageStartDateTime);
  
  const endDatePart = dateFormatter.format(outageEndDateTime);
  const endTimePart = timeFormatter.format(outageEndDateTime);
  
  // Combine into outage window format
  const outageWindow = `Outage Window: ${startDatePart}, ${startTimePart}–${endDatePart}, ${endTimePart}`;
  
  // Escape for safety (though dates shouldn't contain HTML-special chars)
  return escapeHtml(outageWindow);
}

// ============================================================================
// Template Token Injection
// ============================================================================

/**
 * Injects deployment form data into an HTML template by replacing tokens
 * 
 * This function replaces all template tokens with actual data from the deployment form.
 * Text tokens are HTML-escaped for security, while HTML tokens (like lists) are inserted verbatim.
 * 
 * Tokens replaced:
 * - {{NOTIFICATION_HEADER}} - Application-specific notification header
 * - {{DEPLOYMENT_TITLE}} - Computed deployment title
 * - {{DEPLOYMENT_SUBTITLE}} - Change number (deployment ID)
 * - {{SCHEDULE}} - Formatted deployment date and time window
 * - {{OUTAGE_BLOCK}} - Formatted outage window (or empty if no outage)
 * - {{JIRA_ITEMS}} - Rendered HTML list of change items (Jira items)
 * - {{IMPACT_ITEMS}} - Rendered HTML unordered list of impact items
 * - {{CONTACT}} - Contact information block (name, email, phone)
 * 
 * Also supports legacy token names for backward compatibility:
 * - {{DEPLOYMENT_ID}} → {{DEPLOYMENT_SUBTITLE}}
 * - {{DEPLOYMENT_SCHEDULE}} → {{SCHEDULE}}
 * - {{OUTAGE_WINDOW}} → {{OUTAGE_BLOCK}}
 * - {{CHANGE_ITEMS}} → {{JIRA_ITEMS}}
 * - {{CONTACT_NAME}}, {{CONTACT_EMAIL}}, {{CONTACT_PHONE}} → {{CONTACT}}
 * 
 * Requirements: 10.4
 * 
 * @param template - The HTML template string containing tokens
 * @param data - The deployment form data to inject
 * @returns The populated HTML template with all tokens replaced
 * 
 * @example
 * const template = '<h1>{{NOTIFICATION_HEADER}}</h1><p>{{DEPLOYMENT_TITLE}}</p>';
 * const data = {
 *   application: { name: 'Crew Portal', notificationHeader: 'Crew Portal Deployment' },
 *   changeNumber: 'CHG12345',
 *   releaseVersion: 'v5.4.1',
 *   environment: 'PROD',
 *   // ... other fields
 * };
 * const result = injectTemplate(template, data);
 * // Returns: '<h1>Crew Portal Deployment</h1><p>[CHG12345] — [Crew Portal: v5.4.1 - Deploy to PROD]</p>'
 */
export function injectTemplate(template: string, data: DeploymentFormData): string {
  // Generate notification header
  const notificationHeader = data.application 
    ? generateNotificationHeader(data.application.name)
    : '';
  
  // Generate deployment title
  const deploymentTitle = generateDeploymentTitle(data);
  
  // Format deployment schedule
  const deploymentSchedule = formatSchedule(
    data.startDateTime,
    data.endDateTime
  );
  
  // Render outage section
  const outageWindow = renderOutageSection(
    data.hasOutage,
    data.outageStartDateTime,
    data.outageEndDateTime
  );
  
  // Render change items as HTML
  const changeItemsHtml = renderChangeItems(data.changeItems);
  
  // Render impact items as HTML
  const impactItemsHtml = renderImpactItems(data.impactItems);
  
  // Escape text tokens for security
  const escapedChangeNumber = escapeHtml(data.changeNumber);
  const escapedContactName = escapeHtml(data.contactName);
  const escapedContactEmail = escapeHtml(data.contactEmail);
  const escapedContactPhone = escapeHtml(data.contactPhone);
  
  // Build contact block (HTML-escaped individual fields combined)
  const contactBlock = `${escapedContactName}<br>${escapedContactEmail}<br>${escapedContactPhone}`;
  
  // Replace all tokens in the template
  let result = template;
  
  // Replace text tokens (escaped)
  result = result.replace(/\{\{NOTIFICATION_HEADER\}\}/g, notificationHeader);
  result = result.replace(/\{\{DEPLOYMENT_TITLE\}\}/g, deploymentTitle);
  result = result.replace(/\{\{DEPLOYMENT_SUBTITLE\}\}/g, escapedChangeNumber);
  result = result.replace(/\{\{SCHEDULE\}\}/g, deploymentSchedule);
  
  // Replace HTML tokens (verbatim - already contains safe HTML)
  result = result.replace(/\{\{OUTAGE_BLOCK\}\}/g, outageWindow);
  result = result.replace(/\{\{JIRA_ITEMS\}\}/g, changeItemsHtml);
  result = result.replace(/\{\{IMPACT_ITEMS\}\}/g, impactItemsHtml);
  result = result.replace(/\{\{CONTACT\}\}/g, contactBlock);
  
  // Support legacy token names for backward compatibility
  result = result.replace(/\{\{DEPLOYMENT_ID\}\}/g, escapedChangeNumber);
  result = result.replace(/\{\{DEPLOYMENT_SCHEDULE\}\}/g, deploymentSchedule);
  result = result.replace(/\{\{OUTAGE_WINDOW\}\}/g, outageWindow);
  result = result.replace(/\{\{CHANGE_ITEMS\}\}/g, changeItemsHtml);
  result = result.replace(/\{\{CONTACT_NAME\}\}/g, escapedContactName);
  result = result.replace(/\{\{CONTACT_EMAIL\}\}/g, escapedContactEmail);
  result = result.replace(/\{\{CONTACT_PHONE\}\}/g, escapedContactPhone);
  
  return result;
}
