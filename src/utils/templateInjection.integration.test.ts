/**
 * Integration test for template token injection with actual template tokens
 * Task 7.5: Write integration tests for template injection
 * Requirements: 9.5, 9.6, 10.4
 * 
 * This test verifies that the injectTemplate function works correctly with
 * the actual token names used in the HTML templates.
 */

import { describe, it, expect } from 'vitest';
import { injectTemplate } from './formatters';
import { DeploymentFormData, Application } from '../types/models';

describe('injectTemplate - integration tests', () => {
  const mockApplication: Application = {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  };

  const createMockData = (): DeploymentFormData => ({
    formId: 'test-form-1',
    application: mockApplication,
    changeNumber: 'CHG12345',
    releaseVersion: 'v5.4.1',
    environment: 'PROD',
    deploymentTitle: '[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]',
    deploymentDate: new Date('2025-03-05T00:00:00Z'),
    startTime: new Date('2025-03-05T20:00:00Z'),
    endTime: new Date('2025-03-05T22:00:00Z'),
    hasOutage: false,
    outageStartDate: null,
    outageStartTime: null,
    outageEndDate: null,
    outageEndTime: null,
    changeItems: [
      { id: '1', jiraNumber: 'JIRA-123', description: 'Fix login bug' },
      { id: '2', jiraNumber: 'JIRA-456', description: 'Add new feature' }
    ],
    impactItems: [
      { id: '1', text: 'System will be unavailable during deployment' },
      { id: '2', text: 'Users may experience slower performance' }
    ],
    contactName: 'John Doe',
    contactEmail: 'john.doe@example.com',
    contactPhone: '(555) 123-4567'
  });

  // Test: All tokens replaced correctly with sample data
  it('should replace all template tokens correctly with sample data', () => {
    const template = `
      <title>{{NOTIFICATION_HEADER}} — Deployment Notification</title>
      <div class="eyebrow">{{NOTIFICATION_HEADER}}</div>
      <h1 class="title">{{DEPLOYMENT_TITLE}}</h1>
      <td>{{DEPLOYMENT_SUBTITLE}}</td>
      <td>{{SCHEDULE}}</td>
      <td>{{OUTAGE_BLOCK}}</td>
      {{JIRA_ITEMS}}
      {{IMPACT_ITEMS}}
      <td>{{CONTACT}}</td>
    `;
    
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    // Verify NOTIFICATION_HEADER is replaced
    expect(result).toContain('Crew Portal Deployment Notification');
    expect(result).not.toContain('{{NOTIFICATION_HEADER}}');
    
    // Verify DEPLOYMENT_TITLE is replaced
    expect(result).toContain('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
    expect(result).not.toContain('{{DEPLOYMENT_TITLE}}');
    
    // Verify DEPLOYMENT_SUBTITLE (change number) is replaced
    expect(result).toContain('CHG12345');
    expect(result).not.toContain('{{DEPLOYMENT_SUBTITLE}}');
    
    // Verify SCHEDULE is replaced
    expect(result).toContain('2025');
    expect(result).not.toContain('{{SCHEDULE}}');
    
    // Verify OUTAGE_BLOCK is empty (no outage)
    expect(result).not.toContain('{{OUTAGE_BLOCK}}');
    
    // Verify JIRA_ITEMS is replaced with HTML
    expect(result).toContain('<strong>JIRA-123</strong> Fix login bug');
    expect(result).toContain('<strong>JIRA-456</strong> Add new feature');
    expect(result).not.toContain('{{JIRA_ITEMS}}');
    
    // Verify IMPACT_ITEMS is replaced with HTML list
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>System will be unavailable during deployment</li>');
    expect(result).toContain('<li>Users may experience slower performance</li>');
    expect(result).not.toContain('{{IMPACT_ITEMS}}');
    
    // Verify CONTACT block is replaced with name, email, phone
    expect(result).toContain('John Doe<br>john.doe@example.com<br>(555) 123-4567');
    expect(result).not.toContain('{{CONTACT}}');
  });

  // Test: HTML structure preserved
  it('should preserve HTML structure after token injection', () => {
    const template = `
      <html>
        <head>
          <title>{{NOTIFICATION_HEADER}}</title>
        </head>
        <body>
          <div class="container">
            <h1>{{DEPLOYMENT_TITLE}}</h1>
            <table>
              <tr>
                <td>Schedule:</td>
                <td>{{SCHEDULE}}</td>
              </tr>
              <tr>
                <td>Changes:</td>
                <td>{{JIRA_ITEMS}}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;
    
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    // Verify HTML tags are preserved
    expect(result).toContain('<html>');
    expect(result).toContain('</html>');
    expect(result).toContain('<head>');
    expect(result).toContain('</head>');
    expect(result).toContain('<body>');
    expect(result).toContain('</body>');
    expect(result).toContain('<div class="container">');
    expect(result).toContain('</div>');
    expect(result).toContain('<table>');
    expect(result).toContain('</table>');
    
    // Verify structure is intact with content injected
    expect(result).toContain('<title>Crew Portal Deployment Notification</title>');
    expect(result).toContain('<h1>[CHG12345]');
  });

  // Test: Theme-specific template selection (simulate light vs dark)
  it('should handle theme-specific templates correctly', () => {
    const darkTemplate = `
      <style>body { background: #000; color: #fff; }</style>
      <h1>{{DEPLOYMENT_TITLE}}</h1>
    `;
    
    const lightTemplate = `
      <style>body { background: #fff; color: #000; }</style>
      <h1>{{DEPLOYMENT_TITLE}}</h1>
    `;
    
    const data = createMockData();
    
    // Inject into dark template
    const darkResult = injectTemplate(darkTemplate, data);
    expect(darkResult).toContain('background: #000');
    expect(darkResult).toContain('color: #fff');
    expect(darkResult).toContain('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
    
    // Inject into light template
    const lightResult = injectTemplate(lightTemplate, data);
    expect(lightResult).toContain('background: #fff');
    expect(lightResult).toContain('color: #000');
    expect(lightResult).toContain('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
    
    // Both should have title injected
    expect(darkResult).not.toContain('{{DEPLOYMENT_TITLE}}');
    expect(lightResult).not.toContain('{{DEPLOYMENT_TITLE}}');
  });

  // Test: Minimal data (1 Change_Item, 1 Impact_Item, no outage)
  it('should handle minimal data injection (1 change item, 1 impact item, no outage)', () => {
    const template = `
      <h1>{{DEPLOYMENT_TITLE}}</h1>
      <div>{{SCHEDULE}}</div>
      <div>{{OUTAGE_BLOCK}}</div>
      <div>{{JIRA_ITEMS}}</div>
      <div>{{IMPACT_ITEMS}}</div>
      <div>{{CONTACT}}</div>
    `;
    
    const minimalData: DeploymentFormData = {
      formId: 'minimal-form',
      application: mockApplication,
      changeNumber: 'CHG00001',
      releaseVersion: 'v1.0',
      environment: 'DEV',
      deploymentTitle: '[CHG00001] — [Crew Portal: v1.0 - Deploy Product to DEV]',
      deploymentDate: new Date('2025-06-15T00:00:00Z'),
      startTime: new Date('2025-06-15T20:00:00Z'),
      endTime: new Date('2025-06-15T22:00:00Z'),
      hasOutage: false,
      outageStartDate: null,
      outageStartTime: null,
      outageEndDate: null,
      outageEndTime: null,
      changeItems: [
        { id: '1', jiraNumber: 'JIRA-001', description: 'Single change' }
      ],
      impactItems: [
        { id: '1', text: 'Single impact' }
      ],
      contactName: 'Jane Smith',
      contactEmail: 'jane@example.com',
      contactPhone: '(111) 222-3333'
    };
    
    const result = injectTemplate(template, minimalData);
    
    // Verify all fields are injected
    expect(result).toContain('[CHG00001] — [Crew Portal: v1.0 - Deploy Product to DEV]');
    expect(result).toContain('2025'); // Year is present in schedule
    expect(result).toContain('June'); // Month is present
    expect(result).toContain('<strong>JIRA-001</strong> Single change');
    expect(result).toContain('<li>Single impact</li>');
    expect(result).toContain('Jane Smith<br>jane@example.com<br>(111) 222-3333');
    
    // Verify no outage block (empty string should be injected)
    expect(result).not.toContain('Outage Window');
    expect(result).not.toContain('{{OUTAGE_BLOCK}}');
    
    // Verify no tokens remain
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
  });

  // Test: Maximal data (999 Change_Items, 100 Impact_Items, with outage)
  it('should handle maximal data injection (999 change items, 100 impact items, with outage)', () => {
    const template = `
      <h1>{{DEPLOYMENT_TITLE}}</h1>
      <div>{{SCHEDULE}}</div>
      <div>{{OUTAGE_BLOCK}}</div>
      <div>{{JIRA_ITEMS}}</div>
      <div>{{IMPACT_ITEMS}}</div>
    `;
    
    // Create 999 change items
    const changeItems = Array.from({ length: 999 }, (_, i) => ({
      id: `change-${i}`,
      jiraNumber: `JIRA-${String(i).padStart(4, '0')}`,
      description: `Change description ${i}`
    }));
    
    // Create 100 impact items
    const impactItems = Array.from({ length: 100 }, (_, i) => ({
      id: `impact-${i}`,
      text: `Impact description ${i}`
    }));
    
    const maximalData: DeploymentFormData = {
      formId: 'maximal-form',
      application: mockApplication,
      changeNumber: 'CHG99999',
      releaseVersion: 'v99.99.99',
      environment: 'PROD',
      deploymentTitle: '[CHG99999] — [Crew Portal: v99.99.99 - Deploy Product to PROD]',
      deploymentDate: new Date('2025-12-31T00:00:00Z'),
      startTime: new Date('2025-12-31T20:00:00Z'),
      endTime: new Date('2025-12-31T23:59:00Z'),
      hasOutage: true,
      outageStartDate: new Date('2025-12-31T00:00:00Z'),
      outageStartTime: new Date('2025-12-31T20:00:00Z'),
      outageEndDate: new Date('2025-12-31T00:00:00Z'),
      outageEndTime: new Date('2025-12-31T23:59:00Z'),
      changeItems,
      impactItems,
      contactName: 'Max User',
      contactEmail: 'max@example.com',
      contactPhone: '(999) 999-9999'
    };
    
    const result = injectTemplate(template, maximalData);
    
    // Verify deployment title is injected
    expect(result).toContain('[CHG99999] — [Crew Portal: v99.99.99 - Deploy Product to PROD]');
    
    // Verify schedule is injected
    expect(result).toContain('2025');
    
    // Verify outage block is present
    expect(result).toContain('Outage Window:');
    
    // Verify all 999 change items are present
    expect(result).toContain('<strong>JIRA-0000</strong> Change description 0');
    expect(result).toContain('<strong>JIRA-0498</strong> Change description 498');
    expect(result).toContain('<strong>JIRA-0998</strong> Change description 998');
    
    // Count occurrences of change items (each has <strong> tag)
    const changeItemMatches = result.match(/<strong>JIRA-\d{4}<\/strong>/g);
    expect(changeItemMatches).toBeTruthy();
    expect(changeItemMatches!.length).toBe(999);
    
    // Verify all 100 impact items are present
    expect(result).toContain('<li>Impact description 0</li>');
    expect(result).toContain('<li>Impact description 49</li>');
    expect(result).toContain('<li>Impact description 99</li>');
    
    // Count occurrences of impact items (each has <li> tag)
    const impactItemMatches = result.match(/<li>Impact description \d+<\/li>/g);
    expect(impactItemMatches).toBeTruthy();
    expect(impactItemMatches!.length).toBe(100);
    
    // Verify no tokens remain
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
  });

  // Test: Outage block when hasOutage is true
  it('should include outage block when hasOutage is true', () => {
    const template = '<td>{{OUTAGE_BLOCK}}</td>';
    const data = createMockData();
    data.hasOutage = true;
    data.outageStartDate = new Date('2025-03-05T00:00:00Z');
    data.outageStartTime = new Date('2025-03-05T20:00:00Z');
    data.outageEndDate = new Date('2025-03-05T00:00:00Z');
    data.outageEndTime = new Date('2025-03-05T22:00:00Z');
    
    const result = injectTemplate(template, data);
    
    expect(result).toContain('Outage Window:');
    expect(result).toContain('2025');
    expect(result).not.toContain('{{OUTAGE_BLOCK}}');
  });

  // Test: HTML escaping in user-provided text
  it('should escape HTML in contact information and change items', () => {
    const template = `
      <td>{{CONTACT}}</td>
      <div>{{JIRA_ITEMS}}</div>
      <div>{{IMPACT_ITEMS}}</div>
    `;
    
    const data = createMockData();
    data.contactName = '<script>alert("XSS")</script>';
    data.contactEmail = 'test@example.com<script>';
    data.contactPhone = '<b>bold phone</b>';
    data.changeItems = [
      { id: '1', jiraNumber: '<img src=x>', description: 'Test <b>bold</b>' }
    ];
    data.impactItems = [
      { id: '1', text: 'Impact with <script>alert("bad")</script>' }
    ];
    
    const result = injectTemplate(template, data);
    
    // Verify HTML is escaped in contact info
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&lt;b&gt;');
    expect(result).not.toContain('<script>alert("XSS")');
    expect(result).not.toContain('<b>bold phone</b>');
    
    // Verify HTML is escaped in change items
    expect(result).toContain('&lt;img src=x&gt;');
    expect(result).toContain('&lt;b&gt;bold&lt;/b&gt;');
    
    // Verify HTML is escaped in impact items
    expect(result).toContain('&lt;script&gt;alert(&quot;bad&quot;)&lt;/script&gt;');
  });

  // Test: Backward compatibility with legacy token names
  it('should support both old and new token names for backward compatibility', () => {
    // Mix of old and new token names
    const template = `
      {{DEPLOYMENT_ID}}
      {{DEPLOYMENT_SUBTITLE}}
      {{DEPLOYMENT_SCHEDULE}}
      {{SCHEDULE}}
      {{OUTAGE_WINDOW}}
      {{OUTAGE_BLOCK}}
      {{CHANGE_ITEMS}}
      {{JIRA_ITEMS}}
      {{CONTACT_NAME}}
      {{CONTACT_EMAIL}}
      {{CONTACT_PHONE}}
      {{CONTACT}}
    `;
    
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    // All tokens should be replaced
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
    
    // Values should appear multiple times (since both old and new tokens are used)
    const chgCount = (result.match(/CHG12345/g) || []).length;
    expect(chgCount).toBeGreaterThanOrEqual(2); // Should appear at least twice
  });

  // Test: Multiple occurrences of same token
  it('should replace all occurrences of the same token', () => {
    const template = `
      <title>{{NOTIFICATION_HEADER}}</title>
      <h1>{{NOTIFICATION_HEADER}}</h1>
      <div>{{NOTIFICATION_HEADER}}</div>
      <footer>{{NOTIFICATION_HEADER}}</footer>
    `;
    
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    // Count occurrences of the notification header
    const matches = result.match(/Crew Portal Deployment Notification/g);
    expect(matches).toBeTruthy();
    expect(matches!.length).toBe(4);
    
    // Verify no tokens remain
    expect(result).not.toContain('{{NOTIFICATION_HEADER}}');
  });
});
