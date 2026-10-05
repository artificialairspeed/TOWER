/**
 * Formatting utilities for TOWER
 *
 * Input masks, display formatting, HTML escaping, list rendering, and the
 * template token injection used to produce the Flight Plan artifact.
 */

import type { DeploymentFormData, ChangeItem, ImpactItem } from '../types/models';

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
    // Must be exactly 10 digits; leave as entered if not valid
    return phone;
  }

  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
}

// ============================================================================
// Change Number Formatting
// ============================================================================

/**
 * Applies the "CHG" display prefix to a stored change number.
 *
 * The change number is stored as digits only (up to 8 digits); the "CHG"
 * prefix is a display adornment applied consistently wherever the change
 * number is shown or exported (title, HTML artifact, file name, queue row).
 *
 * An empty value is returned unchanged so callers can decide how to render
 * the "not set" case.
 *
 * @param changeNumber - The stored change number (digits only), e.g. "12345"
 * @returns The change number with the CHG prefix, e.g. "CHG12345", or '' when empty
 *
 * @example
 * formatChangeNumber('12345') // Returns: "CHG12345"
 * formatChangeNumber('')      // Returns: ""
 */
export function formatChangeNumber(changeNumber: string): string {
  return changeNumber ? `CHG${changeNumber}` : '';
}

// ============================================================================
// Release Version Formatting
// ============================================================================

/**
 * Formats raw input into the Release Version mask "YYYY.#.#" as the user types.
 *
 * The release version is always a 4-digit year, a single-digit segment, and a
 * final single-digit segment (e.g. "2025.4.1"). This helper is non-destructive
 * and idempotent: it strips every non-digit, keeps at most 6 digits
 * (4 for the year + 1 + 1), and re-inserts the dot separators. Dots are only
 * added once a following digit exists, so there is never a dangling trailing
 * dot while the user is mid-typing or after a backspace.
 *
 * @param input - The raw field value (may already contain dots/partial input)
 * @returns The value formatted toward "YYYY.#.#", e.g. "2025.4.1"
 *
 * @example
 * formatReleaseVersion('2025')    // Returns: "2025"
 * formatReleaseVersion('20254')   // Returns: "2025.4"
 * formatReleaseVersion('2025.4.1')// Returns: "2025.4.1"
 * formatReleaseVersion('abc2025x4-1') // Returns: "2025.4.1"
 */
export function formatReleaseVersion(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 6);
  const year = digits.slice(0, 4);
  const minor = digits.slice(4, 5);
  const patch = digits.slice(5, 6);

  let result = year;
  if (minor) result += `.${minor}`;
  if (patch) result += `.${patch}`;
  return result;
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
      // Impact items are children of the change item and render nested beneath it
      const impactsHtml = renderImpactItems(item.impactItems ?? []);
      return `<div class="change-group"><div><strong>${escapedJiraNumber}</strong> ${escapedDescription}</div>${impactsHtml}</div>`;
    })
    .join('');
}

/**
 * Renders a change item's child Impact Items as an indented block of bullets.
 *
 * Impact items are children of a change item, so this is called while rendering
 * each change item (see renderChangeItems) rather than as a standalone section.
 * The order of items is preserved exactly as provided (insertion order), and all
 * user text is HTML-escaped before rendering. An empty list renders nothing.
 *
 * Requirements: 7.8
 *
 * @param items - Array of Impact Items belonging to a change item
 * @returns HTML string with the indented impact bullets, or '' when there are none
 *
 * @example
 * renderImpactItems([
 *   { id: '1', text: 'System will be unavailable during deployment' },
 *   { id: '2', text: 'Users may experience slower performance' }
 * ])
 * // Returns an indented block:
 * // "<div class=\"impact-sub\" style=\"margin:4px 0 10px 18px;\"><div>&bull; System will be unavailable during deployment</div>..."
 */
export function renderImpactItems(items: ImpactItem[]): string {
  if (!items || items.length === 0) {
    return '';
  }

  const listItems = items
    .map(item => {
      const escapedText = escapeHtml(item.text);
      return `<div>&bull; ${escapedText}</div>`;
    })
    .join('\n');

  return `<div class="impact-sub" style="margin:4px 0 10px 18px;">${listItems}</div>`;
}

/**
 * Renders the outage indicator (Yes or No) for the deployment notification
 * 
 * This shows whether an outage is present, independent of outage window details.
 * 
 * @param hasOutage - Whether the deployment includes an outage
 * @returns HTML string showing "Yes" or "No"
 * 
 * @example
 * renderOutageIndicator(true)
 * // Returns: "Yes"
 * 
 * renderOutageIndicator(false)
 * // Returns: "No"
 */
export function renderOutageIndicator(hasOutage: boolean): string {
  return hasOutage ? 'Yes' : 'No';
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
 * This is the complete token contract between this function and
 * `public/templates/flight-plan.html`. Every token below appears in the
 * template, and the template contains no token that is not listed here:
 *
 * | Token                  | Value                                              | Escaped |
 * |------------------------|----------------------------------------------------|---------|
 * | {{APPLICATION}}        | Application name                                   | yes     |
 * | {{ENVIRONMENT}}        | Environment (PROD rendered as PRODUCTION)          | yes     |
 * | {{CHANGE_NUMBER}}      | Change number, CHG-prefixed                        | yes     |
 * | {{RELEASE}}            | Release line, "PI {YYYY.#.#}"                      | yes     |
 * | {{SCHEDULE}}           | Formatted deployment date and time window          | n/a     |
 * | {{OUTAGE_INDICATOR}}   | "Yes" or "No"                                      | n/a     |
 * | {{JIRA_ITEMS}}         | Change-item markup, each with its nested impacts   | pre-escaped HTML |
 * | {{CONTACT}}            | Contact block (name, email, optional phone)        | pre-escaped HTML |
 *
 * Requirements: 10.4
 * 
 * @param template - The HTML template string containing tokens
 * @param data - The deployment form data to inject
 * @returns The populated HTML template with all tokens replaced
 * 
 * @example
 * const template = '<p>{{APPLICATION}}</p><p>{{CHANGE_NUMBER}}</p><p>{{RELEASE}}</p>';
 * const data = {
 *   application: { name: 'Crew Portal' },
 *   changeNumber: '12345',
 *   releaseVersion: '2025.4.1',
 *   environment: 'PROD',
 *   // ... other fields
 * };
 * const result = injectTemplate(template, data);
 * // Returns: '<p>Crew Portal</p><p>CHG12345</p><p>PI 2025.4.1</p>'
 */
export function injectTemplate(template: string, data: DeploymentFormData): string {
  // Format deployment schedule
  const deploymentSchedule = formatSchedule(
    data.startDateTime,
    data.endDateTime
  );
  
  // Render outage indicator (Yes/No)
  const outageIndicator = renderOutageIndicator(data.hasOutage);
  
  // Render change items as HTML (each change renders its nested impact items)
  const changeItemsHtml = renderChangeItems(data.changeItems);
  
  // Escape text tokens for security
  // CHG prefix is applied to the Change Number for HTML output display
  const escapedChangeNumber = escapeHtml(formatChangeNumber(data.changeNumber));
  // Application name (empty string when no application is selected)
  const escapedApplication = escapeHtml(data.application?.name ?? '');
  // Environment (PROD/QA/ITEST/DEV); empty string when not selected.
  // PROD is expanded to PRODUCTION for display.
  const environmentDisplay = data.environment === 'PROD' ? 'PRODUCTION' : (data.environment ?? '');
  const escapedEnvironment = escapeHtml(environmentDisplay);
  // Release line: "PI {YYYY.#.#}"
  const releaseLine =
    data.application && data.releaseVersion
      ? `PI ${data.releaseVersion}`
      : '';
  const escapedRelease = escapeHtml(releaseLine);
  const escapedContactName = escapeHtml(data.contactName);
  const escapedContactEmail = escapeHtml(data.contactEmail);
  // Phone is optional: treat a blank/whitespace-only value as "not provided".
  const hasContactPhone = (data.contactPhone ?? '').trim().length > 0;
  const escapedContactPhone = hasContactPhone ? escapeHtml(data.contactPhone) : '';
  
  // Build contact block (HTML-escaped individual fields combined).
  // Omit the phone line entirely when no phone was provided so no dangling <br> appears.
  const contactBlock = [escapedContactName, escapedContactEmail, escapedContactPhone]
    .filter((part) => part.length > 0)
    .join('<br>');
  
  // Replace all tokens in the template
  let result = template;
  
  // Replace text tokens (escaped)
  result = result.replace(/\{\{APPLICATION\}\}/g, escapedApplication);
  result = result.replace(/\{\{CHANGE_NUMBER\}\}/g, escapedChangeNumber);
  result = result.replace(/\{\{SCHEDULE\}\}/g, deploymentSchedule);
  result = result.replace(/\{\{OUTAGE_INDICATOR\}\}/g, outageIndicator);
  result = result.replace(/\{\{ENVIRONMENT\}\}/g, escapedEnvironment);
  result = result.replace(/\{\{RELEASE\}\}/g, escapedRelease);

  // Replace HTML tokens (verbatim - already contains safe HTML)
  result = result.replace(/\{\{JIRA_ITEMS\}\}/g, changeItemsHtml);
  result = result.replace(/\{\{CONTACT\}\}/g, contactBlock);

  return result;
}
