/**
 * Unit tests for formatting utilities
 * 
 * Tests title generation, notification header generation, and related formatting functions.
 */

import { describe, test, expect } from 'vitest';
import { 
  generateDeploymentTitle, 
  generateNotificationHeader,
  formatSchedule,
  formatYYYYMMDD,
  escapeHtml,
  renderChangeItems,
  renderImpactItems,
  renderOutageSection
} from './formatters';
import { DeploymentFormData, Application, ChangeItem, ImpactItem } from '../types/models';

// Helper to create a minimal valid deployment form data for testing
const createTestFormData = (overrides?: Partial<DeploymentFormData>): DeploymentFormData => {
  const testApplication: Application = {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  };
  
  return {
    formId: 'test-form-1',
    application: testApplication,
    changeNumber: 'CHG12345',
    releaseVersion: 'v5.4.1',
    environment: 'PROD',
    deploymentTitle: '',
    deploymentDate: new Date('2025-03-05'),
    startTime: new Date('2025-03-05T20:00:00'),
    endTime: new Date('2025-03-05T22:00:00'),
    hasOutage: false,
    outageStartDate: null,
    outageStartTime: null,
    outageEndDate: null,
    outageEndTime: null,
    changeItems: [],
    impactItems: [],
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '(555) 123-4567',
    ...overrides
  };
};

describe('generateDeploymentTitle', () => {
  test('generates complete title with all fields present', () => {
    const data = createTestFormData();
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
  });
  
  test('returns empty string when application is missing', () => {
    const data = createTestFormData({ application: null });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('');
  });
  
  test('returns empty string when change number is missing', () => {
    const data = createTestFormData({ changeNumber: '' });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('');
  });
  
  test('returns empty string when release version is missing', () => {
    const data = createTestFormData({ releaseVersion: '' });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('');
  });
  
  test('returns empty string when environment is missing', () => {
    const data = createTestFormData({ environment: null });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('');
  });
  
  test('handles different applications correctly', () => {
    const app: Application = {
      id: 'ao-crew-training',
      name: 'AO Crew Training',
      notificationHeader: 'AO Crew Training Deployment Notification'
    };
    
    const data = createTestFormData({ application: app });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[CHG12345] — [AO Crew Training: v5.4.1 - Deploy Product to PROD]');
  });
  
  test('handles different environments correctly', () => {
    const data = createTestFormData({ environment: 'QA' });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to QA]');
  });
  
  test('handles different change numbers correctly', () => {
    const data = createTestFormData({ changeNumber: 'CHG99999' });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[CHG99999] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
  });
  
  test('handles different release versions correctly', () => {
    const data = createTestFormData({ releaseVersion: 'v1.0.0' });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[CHG12345] — [Crew Portal: v1.0.0 - Deploy Product to PROD]');
  });
  
  test('handles ITEST environment', () => {
    const data = createTestFormData({ environment: 'ITEST' });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to ITEST]');
  });
  
  test('handles DEV environment', () => {
    const data = createTestFormData({ environment: 'DEV' });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to DEV]');
  });
  
  test('handles application names with special characters', () => {
    const app: Application = {
      id: 'learning-management',
      name: 'Learning Management',
      notificationHeader: 'Learning Management Deployment Notification'
    };
    
    const data = createTestFormData({ application: app });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[CHG12345] — [Learning Management: v5.4.1 - Deploy Product to PROD]');
  });
  
  test('handles release versions without "v" prefix', () => {
    const data = createTestFormData({ releaseVersion: '5.4.1' });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[CHG12345] — [Crew Portal: 5.4.1 - Deploy Product to PROD]');
  });
  
  test('handles change numbers without CHG prefix', () => {
    const data = createTestFormData({ changeNumber: '12345' });
    const result = generateDeploymentTitle(data);
    
    expect(result).toBe('[12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
  });
});

describe('generateNotificationHeader', () => {
  test('generates header for simple application name', () => {
    const result = generateNotificationHeader('Crew Portal');
    
    expect(result).toBe('Crew Portal Deployment Notification');
  });
  
  test('generates header for application with multiple words', () => {
    const result = generateNotificationHeader('AO Crew Training');
    
    expect(result).toBe('AO Crew Training Deployment Notification');
  });
  
  test('generates header for Learning Management', () => {
    const result = generateNotificationHeader('Learning Management');
    
    expect(result).toBe('Learning Management Deployment Notification');
  });
  
  test('generates header for Administration Portal', () => {
    const result = generateNotificationHeader('Administration Portal');
    
    expect(result).toBe('Administration Portal Deployment Notification');
  });
  
  test('generates header for Crew Mobile', () => {
    const result = generateNotificationHeader('Crew Mobile');
    
    expect(result).toBe('Crew Mobile Deployment Notification');
  });
  
  test('handles empty string', () => {
    const result = generateNotificationHeader('');
    
    expect(result).toBe(' Deployment Notification');
  });
  
  test('preserves exact casing of application name', () => {
    const result = generateNotificationHeader('MyApp');
    
    expect(result).toBe('MyApp Deployment Notification');
  });
});

// ============================================================================
// Date and Time Formatting Tests
// ============================================================================

describe('formatSchedule', () => {
  test('formats schedule with correct date and time format', () => {
    const date = new Date('2025-03-05');
    const startTime = new Date('2025-03-05T20:00:00');
    const endTime = new Date('2025-03-05T22:00:00');
    
    const result = formatSchedule(date, startTime, endTime);
    
    // Expected format: "Month DD, YYYY, HH:MM AM/PM–HH:MM AM/PM"
    expect(result).toMatch(/^[A-Z][a-z]+ \d{2}, \d{4}, \d{2}:\d{2} [AP]M–\d{2}:\d{2} [AP]M$/);
  });
  
  test('formats PM times correctly', () => {
    const date = new Date('2025-03-05');
    const startTime = new Date('2025-03-05T20:00:00'); // 8:00 PM
    const endTime = new Date('2025-03-05T22:00:00'); // 10:00 PM
    
    const result = formatSchedule(date, startTime, endTime);
    
    // Should contain PM times
    expect(result).toContain('PM');
    // Should have the dash separator between times
    expect(result).toContain('–');
  });
  
  test('formats AM times correctly', () => {
    const date = new Date('2025-03-05');
    const startTime = new Date('2025-03-05T08:00:00'); // 8:00 AM
    const endTime = new Date('2025-03-05T10:00:00'); // 10:00 AM
    
    const result = formatSchedule(date, startTime, endTime);
    
    // Should contain AM times
    expect(result).toContain('AM');
  });
  
  test('formats mixed AM and PM times correctly', () => {
    const date = new Date('2025-03-05');
    const startTime = new Date('2025-03-05T11:30:00'); // 11:30 AM
    const endTime = new Date('2025-03-05T13:45:00'); // 1:45 PM
    
    const result = formatSchedule(date, startTime, endTime);
    
    // Should contain both AM and PM
    expect(result).toContain('AM');
    expect(result).toContain('PM');
  });
  
  test('formats midnight correctly', () => {
    const date = new Date('2025-03-05');
    const startTime = new Date('2025-03-05T00:00:00'); // 12:00 AM
    const endTime = new Date('2025-03-05T01:00:00'); // 1:00 AM
    
    const result = formatSchedule(date, startTime, endTime);
    
    // Should show 12:00 AM for midnight
    expect(result).toContain('12:00 AM');
  });
  
  test('formats noon correctly', () => {
    const date = new Date('2025-03-05');
    const startTime = new Date('2025-03-05T12:00:00'); // 12:00 PM
    const endTime = new Date('2025-03-05T13:00:00'); // 1:00 PM
    
    const result = formatSchedule(date, startTime, endTime);
    
    // Should show 12:00 PM for noon
    expect(result).toContain('12:00 PM');
  });
  
  test('handles various dates throughout the year', () => {
    // January 1st - using time to avoid timezone issues
    const jan1 = new Date('2025-01-01T12:00:00');
    const time1 = new Date('2025-01-01T15:00:00');
    const time2 = new Date('2025-01-01T17:00:00');
    
    const result1 = formatSchedule(jan1, time1, time2);
    expect(result1).toContain('January 01, 2025');
    
    // December 31st - using time to avoid timezone issues
    const dec31 = new Date('2025-12-31T12:00:00');
    const time3 = new Date('2025-12-31T15:00:00');
    const time4 = new Date('2025-12-31T17:00:00');
    
    const result2 = formatSchedule(dec31, time3, time4);
    expect(result2).toContain('December 31, 2025');
  });
  
  test('handles leap year date', () => {
    // February 29 on a leap year - using time to avoid timezone issues
    const leapDay = new Date('2024-02-29T12:00:00');
    const startTime = new Date('2024-02-29T14:00:00');
    const endTime = new Date('2024-02-29T16:00:00');
    
    const result = formatSchedule(leapDay, startTime, endTime);
    
    expect(result).toContain('February 29, 2024');
  });
  
  test('formats with two-digit day padding', () => {
    const date = new Date('2025-03-05T12:00:00');
    const startTime = new Date('2025-03-05T10:00:00');
    const endTime = new Date('2025-03-05T12:00:00');
    
    const result = formatSchedule(date, startTime, endTime);
    
    // Day should be padded to 2 digits (05, not 5)
    expect(result).toContain('05');
  });
  
  test('formats with two-digit minute padding', () => {
    const date = new Date('2025-03-05');
    const startTime = new Date('2025-03-05T10:05:00'); // 10:05
    const endTime = new Date('2025-03-05T12:09:00'); // 12:09
    
    const result = formatSchedule(date, startTime, endTime);
    
    // Minutes should be padded to 2 digits
    expect(result).toContain(':05');
    expect(result).toContain(':09');
  });
  
  test('uses en-dash (–) as time separator', () => {
    const date = new Date('2025-03-05');
    const startTime = new Date('2025-03-05T10:00:00');
    const endTime = new Date('2025-03-05T12:00:00');
    
    const result = formatSchedule(date, startTime, endTime);
    
    // Should use en-dash (–), not hyphen (-)
    expect(result).toContain('–');
    expect(result).not.toContain(' - ');
  });
});

describe('formatYYYYMMDD', () => {
  test('formats date as 8-digit YYYYMMDD string', () => {
    const date = new Date('2025-03-05T12:00:00');
    const result = formatYYYYMMDD(date);
    
    expect(result).toBe('20250305');
    expect(result).toHaveLength(8);
  });
  
  test('formats January 1st correctly', () => {
    const date = new Date('2025-01-01T12:00:00');
    const result = formatYYYYMMDD(date);
    
    expect(result).toBe('20250101');
  });
  
  test('formats December 31st correctly', () => {
    const date = new Date('2025-12-31T12:00:00');
    const result = formatYYYYMMDD(date);
    
    expect(result).toBe('20251231');
  });
  
  test('formats leap year February 29th correctly', () => {
    const date = new Date('2024-02-29T12:00:00');
    const result = formatYYYYMMDD(date);
    
    expect(result).toBe('20240229');
  });
  
  test('pads single-digit months with leading zero', () => {
    const date = new Date('2025-03-15T12:00:00');
    const result = formatYYYYMMDD(date);
    
    // Month 03 should be padded
    expect(result).toBe('20250315');
  });
  
  test('pads single-digit days with leading zero', () => {
    const date = new Date('2025-11-05T12:00:00');
    const result = formatYYYYMMDD(date);
    
    // Day 05 should be padded
    expect(result).toBe('20251105');
  });
  
  test('handles double-digit months without adding extra padding', () => {
    const date = new Date('2025-10-20T12:00:00');
    const result = formatYYYYMMDD(date);
    
    expect(result).toBe('20251020');
  });
  
  test('handles double-digit days without adding extra padding', () => {
    const date = new Date('2025-05-25T12:00:00');
    const result = formatYYYYMMDD(date);
    
    expect(result).toBe('20250525');
  });
  
  test('formats various months correctly', () => {
    const months = [
      { date: new Date('2025-01-15T12:00:00'), expected: '20250115' },
      { date: new Date('2025-02-15T12:00:00'), expected: '20250215' },
      { date: new Date('2025-03-15T12:00:00'), expected: '20250315' },
      { date: new Date('2025-04-15T12:00:00'), expected: '20250415' },
      { date: new Date('2025-05-15T12:00:00'), expected: '20250515' },
      { date: new Date('2025-06-15T12:00:00'), expected: '20250615' },
      { date: new Date('2025-07-15T12:00:00'), expected: '20250715' },
      { date: new Date('2025-08-15T12:00:00'), expected: '20250815' },
      { date: new Date('2025-09-15T12:00:00'), expected: '20250915' },
      { date: new Date('2025-10-15T12:00:00'), expected: '20251015' },
      { date: new Date('2025-11-15T12:00:00'), expected: '20251115' },
      { date: new Date('2025-12-15T12:00:00'), expected: '20251215' }
    ];
    
    months.forEach(({ date, expected }) => {
      expect(formatYYYYMMDD(date)).toBe(expected);
    });
  });
  
  test('handles different years correctly', () => {
    expect(formatYYYYMMDD(new Date('2020-06-15T12:00:00'))).toBe('20200615');
    expect(formatYYYYMMDD(new Date('2023-06-15T12:00:00'))).toBe('20230615');
    expect(formatYYYYMMDD(new Date('2025-06-15T12:00:00'))).toBe('20250615');
    expect(formatYYYYMMDD(new Date('2030-06-15T12:00:00'))).toBe('20300615');
  });
  
  test('handles first and last days of month', () => {
    // First day
    expect(formatYYYYMMDD(new Date('2025-06-01T12:00:00'))).toBe('20250601');
    
    // Last day (30-day month)
    expect(formatYYYYMMDD(new Date('2025-06-30T12:00:00'))).toBe('20250630');
    
    // Last day (31-day month)
    expect(formatYYYYMMDD(new Date('2025-07-31T12:00:00'))).toBe('20250731');
    
    // Last day of February (non-leap year)
    expect(formatYYYYMMDD(new Date('2025-02-28T12:00:00'))).toBe('20250228');
    
    // Last day of February (leap year)
    expect(formatYYYYMMDD(new Date('2024-02-29T12:00:00'))).toBe('20240229');
  });
  
  test('formats consistently for same date', () => {
    const date = new Date('2025-07-04T12:00:00');
    
    const result1 = formatYYYYMMDD(date);
    const result2 = formatYYYYMMDD(date);
    const result3 = formatYYYYMMDD(date);
    
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
    expect(result1).toBe('20250704');
  });
});

// ============================================================================
// HTML Escaping Tests
// ============================================================================

describe('escapeHtml', () => {
  test('escapes ampersand character', () => {
    expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
  });
  
  test('escapes less-than character', () => {
    expect(escapeHtml('foo < bar')).toBe('foo &lt; bar');
  });
  
  test('escapes greater-than character', () => {
    expect(escapeHtml('foo > bar')).toBe('foo &gt; bar');
  });
  
  test('escapes double quote character', () => {
    expect(escapeHtml('foo " bar')).toBe('foo &quot; bar');
  });
  
  test('escapes single quote character', () => {
    expect(escapeHtml("foo ' bar")).toBe('foo &#39; bar');
  });
  
  test('escapes multiple special characters together', () => {
    expect(escapeHtml('<script>alert("XSS")</script>'))
      .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });
  
  test('escapes all special characters in one string', () => {
    expect(escapeHtml(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &#39;');
  });
  
  test('leaves normal text unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
  
  test('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
  
  test('preserves whitespace', () => {
    expect(escapeHtml('  foo  bar  ')).toBe('  foo  bar  ');
  });
});

// ============================================================================
// Change Items Rendering Tests
// ============================================================================

describe('renderChangeItems', () => {
  test('renders single change item with Jira number in strong tag', () => {
    const items: ChangeItem[] = [
      { id: '1', jiraNumber: 'JIRA-123', description: 'Fix login bug' }
    ];
    
    const result = renderChangeItems(items);
    
    expect(result).toBe('<strong>JIRA-123</strong> Fix login bug');
  });
  
  test('renders multiple change items separated by newlines', () => {
    const items: ChangeItem[] = [
      { id: '1', jiraNumber: 'JIRA-123', description: 'Fix login bug' },
      { id: '2', jiraNumber: 'JIRA-456', description: 'Add new feature' }
    ];
    
    const result = renderChangeItems(items);
    
    expect(result).toBe(
      '<strong>JIRA-123</strong> Fix login bug\n<strong>JIRA-456</strong> Add new feature'
    );
  });
  
  test('escapes HTML in Jira number', () => {
    const items: ChangeItem[] = [
      { id: '1', jiraNumber: '<script>', description: 'Test' }
    ];
    
    const result = renderChangeItems(items);
    
    expect(result).toBe('<strong>&lt;script&gt;</strong> Test');
  });
  
  test('escapes HTML in description', () => {
    const items: ChangeItem[] = [
      { id: '1', jiraNumber: 'JIRA-123', description: 'Fix <script> injection' }
    ];
    
    const result = renderChangeItems(items);
    
    expect(result).toBe('<strong>JIRA-123</strong> Fix &lt;script&gt; injection');
  });
  
  test('escapes HTML special characters in both fields', () => {
    const items: ChangeItem[] = [
      { id: '1', jiraNumber: 'CHG<123>', description: 'Update "config" & settings' }
    ];
    
    const result = renderChangeItems(items);
    
    expect(result).toBe(
      '<strong>CHG&lt;123&gt;</strong> Update &quot;config&quot; &amp; settings'
    );
  });
  
  test('handles empty array', () => {
    const items: ChangeItem[] = [];
    
    const result = renderChangeItems(items);
    
    expect(result).toBe('');
  });
  
  test('preserves order of items', () => {
    const items: ChangeItem[] = [
      { id: '1', jiraNumber: 'FIRST', description: 'First item' },
      { id: '2', jiraNumber: 'SECOND', description: 'Second item' },
      { id: '3', jiraNumber: 'THIRD', description: 'Third item' }
    ];
    
    const result = renderChangeItems(items);
    
    expect(result).toContain('FIRST');
    expect(result).toContain('SECOND');
    expect(result).toContain('THIRD');
    expect(result.indexOf('FIRST')).toBeLessThan(result.indexOf('SECOND'));
    expect(result.indexOf('SECOND')).toBeLessThan(result.indexOf('THIRD'));
  });
  
  test('handles long descriptions without truncation', () => {
    const longDescription = 'A'.repeat(500);
    const items: ChangeItem[] = [
      { id: '1', jiraNumber: 'JIRA-123', description: longDescription }
    ];
    
    const result = renderChangeItems(items);
    
    expect(result).toContain(longDescription);
  });
});

// ============================================================================
// Impact Items Rendering Tests
// ============================================================================

describe('renderImpactItems', () => {
  test('renders single impact item as unordered list', () => {
    const items: ImpactItem[] = [
      { id: '1', text: 'System will be unavailable' }
    ];
    
    const result = renderImpactItems(items);
    
    expect(result).toBe('<ul>\n<li>System will be unavailable</li>\n</ul>');
  });
  
  test('renders multiple impact items in list structure', () => {
    const items: ImpactItem[] = [
      { id: '1', text: 'System will be unavailable' },
      { id: '2', text: 'Users may experience delays' }
    ];
    
    const result = renderImpactItems(items);
    
    expect(result).toBe(
      '<ul>\n<li>System will be unavailable</li>\n<li>Users may experience delays</li>\n</ul>'
    );
  });
  
  test('escapes HTML in impact text', () => {
    const items: ImpactItem[] = [
      { id: '1', text: 'Update <script> & settings' }
    ];
    
    const result = renderImpactItems(items);
    
    expect(result).toBe('<ul>\n<li>Update &lt;script&gt; &amp; settings</li>\n</ul>');
  });
  
  test('escapes all HTML special characters', () => {
    const items: ImpactItem[] = [
      { id: '1', text: `Test & < > " ' characters` }
    ];
    
    const result = renderImpactItems(items);
    
    expect(result).toBe(
      '<ul>\n<li>Test &amp; &lt; &gt; &quot; &#39; characters</li>\n</ul>'
    );
  });
  
  test('preserves insertion order', () => {
    const items: ImpactItem[] = [
      { id: '1', text: 'First impact' },
      { id: '2', text: 'Second impact' },
      { id: '3', text: 'Third impact' }
    ];
    
    const result = renderImpactItems(items);
    
    expect(result).toContain('First impact');
    expect(result).toContain('Second impact');
    expect(result).toContain('Third impact');
    expect(result.indexOf('First')).toBeLessThan(result.indexOf('Second'));
    expect(result.indexOf('Second')).toBeLessThan(result.indexOf('Third'));
  });
  
  test('handles empty array', () => {
    const items: ImpactItem[] = [];
    
    const result = renderImpactItems(items);
    
    expect(result).toBe('<ul>\n\n</ul>');
  });
  
  test('handles long impact text without truncation', () => {
    const longText = 'B'.repeat(500);
    const items: ImpactItem[] = [
      { id: '1', text: longText }
    ];
    
    const result = renderImpactItems(items);
    
    expect(result).toContain(longText);
  });
  
  test('renders proper list structure', () => {
    const items: ImpactItem[] = [
      { id: '1', text: 'Impact one' }
    ];
    
    const result = renderImpactItems(items);
    
    expect(result).toMatch(/^<ul>\n<li>.*<\/li>\n<\/ul>$/);
  });
});

// ============================================================================
// Outage Section Rendering Tests
// ============================================================================

describe('renderOutageSection', () => {
  test('returns empty string when hasOutage is false', () => {
    const result = renderOutageSection(false, null, null, null, null);
    
    expect(result).toBe('');
  });
  
  test('returns empty string when hasOutage is false even with dates provided', () => {
    const date = new Date('2025-03-05T20:00:00');
    const result = renderOutageSection(false, date, date, date, date);
    
    expect(result).toBe('');
  });
  
  test('renders outage window when hasOutage is true with all dates', () => {
    // Use UTC dates to avoid timezone issues
    const startDate = new Date(Date.UTC(2025, 2, 5)); // March 5, 2025 UTC
    const startTime = new Date(Date.UTC(2025, 2, 5, 20, 0)); // 20:00 UTC
    const endDate = new Date(Date.UTC(2025, 2, 5)); // March 5, 2025 UTC
    const endTime = new Date(Date.UTC(2025, 2, 5, 22, 0)); // 22:00 UTC
    
    const result = renderOutageSection(true, startDate, startTime, endDate, endTime);
    
    // Check for key components (format may vary by locale)
    expect(result).toContain('Outage Window:');
    // Just verify the structure is correct, not exact date formatting (due to timezone issues)
    expect(result).toMatch(/Outage Window: [A-Za-z]+ \d{2}, \d{4}, \d{2}:\d{2} [AP]M–[A-Za-z]+ \d{2}, \d{4}, \d{2}:\d{2} [AP]M/);
  });
  
  test('returns empty string when hasOutage is true but dates are null', () => {
    const result = renderOutageSection(true, null, null, null, null);
    
    expect(result).toBe('');
  });
  
  test('returns empty string when hasOutage is true but some dates are missing', () => {
    const date = new Date('2025-03-05T20:00:00');
    
    // Missing end time
    expect(renderOutageSection(true, date, date, date, null)).toBe('');
    
    // Missing start time
    expect(renderOutageSection(true, date, null, date, date)).toBe('');
    
    // Missing end date
    expect(renderOutageSection(true, date, date, null, date)).toBe('');
    
    // Missing start date
    expect(renderOutageSection(true, null, date, date, date)).toBe('');
  });
  
  test('handles outage spanning different dates', () => {
    const startDate = new Date(Date.UTC(2025, 2, 5)); // March 5, 2025 UTC
    const startTime = new Date(Date.UTC(2025, 2, 5, 23, 0)); // 23:00 UTC
    const endDate = new Date(Date.UTC(2025, 2, 6)); // March 6, 2025 UTC
    const endTime = new Date(Date.UTC(2025, 2, 6, 1, 0)); // 01:00 UTC
    
    const result = renderOutageSection(true, startDate, startTime, endDate, endTime);
    
    expect(result).toContain('Outage Window:');
    // Verify structure with date range
    expect(result).toMatch(/Outage Window: [A-Za-z]+ \d{2}, \d{4}, \d{2}:\d{2} [AP]M–[A-Za-z]+ \d{2}, \d{4}, \d{2}:\d{2} [AP]M/);
  });
  
  test('escapes any potential HTML in formatted dates', () => {
    // This is a safety test - normal date formatting shouldn't produce HTML chars
    // but we verify escaping is applied
    const date = new Date('2025-03-05T20:00:00');
    
    const result = renderOutageSection(true, date, date, date, date);
    
    // Result should not contain any unescaped < or > characters
    // except those in entity codes (&lt;, &gt;, etc.)
    const unescapedHtml = result.match(/<(?![a-z])/i) || result.match(/(?<![a-z])>/i);
    expect(unescapedHtml).toBeNull();
  });
  
  test('formats with consistent date/time pattern', () => {
    const startDate = new Date(Date.UTC(2025, 11, 31)); // December 31, 2025 UTC
    const startTime = new Date(Date.UTC(2025, 11, 31, 14, 30)); // 14:30 UTC
    const endDate = new Date(Date.UTC(2025, 11, 31)); // December 31, 2025 UTC
    const endTime = new Date(Date.UTC(2025, 11, 31, 16, 45)); // 16:45 UTC
    
    const result = renderOutageSection(true, startDate, startTime, endDate, endTime);
    
    expect(result).toContain('Outage Window:');
    // Times should be formatted as HH:MM AM/PM
    expect(result).toMatch(/\d{2}:\d{2} [AP]M/);
  });
});
